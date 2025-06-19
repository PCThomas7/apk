import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

interface KatexRenderedProps {
  content: string;
  displayMode?: boolean;
  style?: object;
  onHeightMeasured?: (height: number) => void;
}

const screenWidth = Dimensions.get('window').width;

const KatexRendered: React.FC<KatexRenderedProps> = ({
  content,
  displayMode = false,
  style = {},
  onHeightMeasured,
}) => {
  const [webViewHeight, setWebViewHeight] = useState(1);

  const mathBlock = displayMode
    ? `\\[${content}\\]`
    : content;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" />
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
        <style>
          body { margin: 0; padding: 0; font-size: 16px; }
          .katex { font-size: 1.15em; font-weight: 500; }
          .katex-display { font-size: 1.2em; font-weight: 500; }
        </style>
      </head>
      <body>
        <div id="math">${mathBlock}</div>
        <script>
          document.addEventListener("DOMContentLoaded", function() {
            renderMathInElement(document.body, {
              delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "\\\\[", right: "\\\\]", display: true},
                {left: "$", right: "$", display: false}
              ],
              throwOnError: false
            });

            const resizeObserver = new ResizeObserver(() => {
              window.ReactNativeWebView.postMessage(
                document.documentElement.scrollHeight.toString()
              );
            });

            resizeObserver.observe(document.documentElement);
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, { height: webViewHeight }, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        scrollEnabled={false}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        javaScriptEnabled
        onMessage={(event) => {
          const height = parseInt(event.nativeEvent.data);
          if (!isNaN(height)) {
            setWebViewHeight(height);
            onHeightMeasured?.(height);
          }
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
});

export default KatexRendered;
