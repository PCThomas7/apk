import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface KatexRenderedProps {
  content: string;
  displayMode?: boolean;
  style?: object;
  onHeightMeasured?: (height: number) => void;
  onError?: (error: string) => void;
}

const screenWidth = Dimensions.get('window').width;

// Process text line breaks (convert \\ to <br/>)
const processTextLineBreaks = (text: string) => {
  return text.replace(/\\\\/g, '<br/>');
};

// Parse text into segments of text and math
const parseTextAndMath = (text: string, displayMode: boolean) => {
  const segments = [];
  let currentIndex = 0;
  let inMath = false;
  let inDisplayMath = false;
  let mathStartIndex = 0;

  for (let i = 0; i < text.length; i++) {
    // Handle escaped dollar sign
    if (text[i] === '\\' && i + 1 < text.length && text[i + 1] === '$') {
      i++; // Skip the backslash
      continue;
    }

    // Check for display math ($$)
    if (i + 1 < text.length && text[i] === '$' && text[i + 1] === '$') {
      if (!inMath && !inDisplayMath) {
        // Start of display math
        if (i > currentIndex) {
          segments.push({
            type: 'text',
            content: text.substring(currentIndex, i)
          });
        }
        inDisplayMath = true;
        mathStartIndex = i + 2; // Skip both dollar signs
        i++; // Skip the next dollar sign
      } else if (inDisplayMath) {
        // End of display math
        segments.push({
          type: 'math',
          displayMode: true,
          content: text.substring(mathStartIndex, i)
        });
        inDisplayMath = false;
        currentIndex = i + 2; // Skip both dollar signs
        i++; // Skip the next dollar sign
      }
    }
    // Check for inline math ($)
    else if (text[i] === '$') {
      if (!inMath && !inDisplayMath) {
        // Start of inline math
        if (i > currentIndex) {
          segments.push({
            type: 'text',
            content: text.substring(currentIndex, i)
          });
        }
        inMath = true;
        mathStartIndex = i + 1; // Skip the dollar sign
      } else if (inMath) {
        // End of inline math
        segments.push({
          type: 'math',
          displayMode: false,
          content: text.substring(mathStartIndex, i)
        });
        inMath = false;
        currentIndex = i + 1; // Skip the dollar sign
      }
    }
  }

  // Add any remaining text
  if (currentIndex < text.length) {
    if (inMath) {
      // Unclosed math delimiter - treat as text
      segments.push({
        type: 'text',
        content: '$' + text.substring(mathStartIndex)
      });
    } else if (inDisplayMath) {
      // Unclosed display math delimiter - treat as text
      segments.push({
        type: 'text',
        content: '$$' + text.substring(mathStartIndex)
      });
    } else {
      segments.push({
        type: 'text',
        content: text.substring(currentIndex)
      });
    }
  }

  // If no segments or just one text segment, and displayMode is false
  if ((segments.length === 0 || (segments.length === 1 && segments[0].type === 'text')) && !displayMode) {
    const textContent = segments.length === 1 ? segments[0].content : text;

    // More precise detection of math content
    const hasActualMathSymbols = /(?:\\[a-zA-Z]+(?![a-zA-Z])(?!\\))|[${}^_]/.test(textContent);
    const onlyHasLineBreaks = !hasActualMathSymbols && /\\\\/.test(textContent);

    if (hasActualMathSymbols && !onlyHasLineBreaks) {
      return [{ type: 'math', displayMode: false, content: text }];
    }

    return segments.length === 0 ? [{ type: 'text', content: text }] : segments;
  }

  return segments;
};



// Convert tabular to array (since KaTeX doesn't support tabular)
const convertTabularToArray = (text: string) => {
  const tabularRegex = /\\begin\{tabular\}(\{[^}]*\})([\s\S]*?)\\end\{tabular\}/g;

  return text.replace(tabularRegex, (match, columnSpec, content) => {
    const rows = content.trim().split(/\\\\\s*/);
    const processedRows = [];

    for (let row of rows) {
      if (!row.trim()) continue;

      if (row.trim() === '\\hline') {
        processedRows.push('\\hline');
        continue;
      }

      const cells = row.split('&');
      const processedCells = [];

      for (let cell of cells) {
        cell = cell.trim();

        if (cell.match(/^\$.*\$/)) {
          processedCells.push(cell.substring(1, cell.length - 1));
        } else if (cell.match(/\$/)) {
          processedCells.push(cell.replace(/\$(.*?)\$/g, '$1'));
        } else if (cell && !cell.match(/^\\/) && !cell.match(/^\s*$/)) {
          processedCells.push(`\\text{${cell}}`);
        } else {
          processedCells.push(cell);
        }
      }

      processedRows.push(processedCells.join(' & '));
    }

    const processedContent = processedRows.join(' \\\\ ');
    return `\\begin{array}${columnSpec}${processedContent}\\end{array}`;
  });
};

const KatexRendered: React.FC<KatexRenderedProps> = ({
  content,
  displayMode = false,
  style = {},
  onHeightMeasured,
  onError,
}) => {
  const [webViewHeight, setWebViewHeight] = useState(1);
  const [htmlContent, setHtmlContent] = useState('');
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    try {
      // Pre-process tabular environments
      const processedText = convertTabularToArray(content);

      if (displayMode) {
        // Direct math mode rendering
        const mathBlock = `\\[${processedText}\\]`;
        setHtmlContent(generateHtml(mathBlock, true));
      } else {
        // Mixed mode rendering
        const segments = parseTextAndMath(processedText, displayMode);
        let html = '';

        for (const segment of segments) {
          if (segment.type === 'text') {
            // Process text segment with line breaks
            const textContent = processTextLineBreaks(segment.content);
            html += `<span class="plain-text">${textContent}</span>`;
          } else {
            // Math segment
            const mathDelimiter = segment.displayMode ? '\\[' : '\\(';
            const mathEndDelimiter = segment.displayMode ? '\\]' : '\\)';
            html += `${mathDelimiter}${segment.content}${mathEndDelimiter}`;
          }
        }

        setHtmlContent(generateHtml(html, false));
      }
    } catch (err) {
      const errorMsg = `KaTeX rendering error: ${(err as Error).message}`;
      console.error(errorMsg);
      onError?.(errorMsg);
      setHtmlContent(generateErrorHtml(errorMsg));
    }
  }, [content, displayMode]);

  const generateHtml = (content: string, isDisplayMode: boolean) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" />
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            font-size: 16px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          }
          .plain-text {
            white-space: pre-wrap;
            word-spacing: normal;
            word-break: break-word;
            line-height: 1.5;
          }
          .katex {
            font-size: 1.15em;
          }
          .katex-display {
            font-size: 1.2em;
            margin: 0;
            padding: 0;
          }
          .error-message {
            color: #f44336;
          }
        </style>
      </head>
      <body>
        <div id="math">${content}</div>
        <script>
          document.addEventListener("DOMContentLoaded", function() {
            try {
              renderMathInElement(document.body, {
                delimiters: [
                  {left: "$$", right: "$$", display: true},
                  {left: "\\\\[", right: "\\\\]", display: true},
                  {left: "$", right: "$", display: false},
                  {left: "\\\\(", right: "\\\\)", display: false}
                ],
                throwOnError: false,
                errorColor: '#f44336',
                strict: "ignore"
              });

              const resizeObserver = new ResizeObserver(() => {
                window.ReactNativeWebView.postMessage(
                  document.documentElement.scrollHeight.toString()
                );
              });

              resizeObserver.observe(document.documentElement);
            } catch (e) {
              window.ReactNativeWebView.postMessage('ERROR:' + e.message);
            }
          });
        </script>
      </body>
    </html>
  `;

  const generateErrorHtml = (error: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 8px; }
          .error-message {
            color: #f44336;
            font-weight: 500;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        <div class="error-message">${error}</div>
      </body>
    </html>
  `;

  const handleWebViewMessage = (event: any) => {
    const message = event.nativeEvent.data;

    if (message.startsWith('ERROR:')) {
      const errorMsg = message.substring(6);
      console.error('KaTeX rendering error:', errorMsg);
      onError?.(errorMsg);
      return;
    }

    const height = parseInt(message);
    if (!isNaN(height)) {
      setWebViewHeight(height);
      onHeightMeasured?.(height);
    }
  };

  return (
    <View style={[styles.container, { height: webViewHeight }, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        scrollEnabled={false}
        style={styles.webView}
        javaScriptEnabled
        onMessage={handleWebViewMessage}
        onError={(error) => {
          console.error('WebView error:', error.nativeEvent);
          onError?.(error.nativeEvent.description);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth - 32,
    alignSelf: 'center',
    marginVertical: 8,
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
    ...Platform.select({
      android: {
        // Fix for Android WebView rendering issues
        opacity: 0.99,
      },
    }),
  },
});

export default KatexRendered;