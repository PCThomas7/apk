import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,

} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import {useRouter } from 'expo-router';
import {useSafeAreaInsets } from 'react-native-safe-area-context';
import courseServiceGet from '@/services/courseServiceGet';

// interface VideoPlayerProps {
//   src?: string;
// }

interface TimeData {
  currentTime: number;
  duration: number;
}

type VideoPlayerProps = {
 params: {
    video?: string;
    status?: string;
    watchTimeSeconds?: string;
    totalTimeSeconds?: string;
    lessonId?: string;
    chapterId?: string;
    sectionId?: string;
    courseId?: string;
  };
};
const PROGRESS_UPDATE_INTERVAL = 20000; // 20 seconds
const COMPLETION_THRESHOLD = 0.95; // 95% of video
const MIN_PROGRESS_DIFF = 5; // Minimum seconds difference to trigger update
const COMPLETION_CHECK_INTERVAL = 5000; // 5 seconds between completion checks

const VideoPlayer: React.FC<VideoPlayerProps> = ({ params }) => {
  // Refs
  const webViewRef = useRef<WebView>(null);
  const hasMarkedComplete = useRef(false);
  const lastProgressUpdate = useRef(0);
  const lastProgressValue = useRef(0);
  const lastCompletionCheck = useRef(0);
  const insets = useSafeAreaInsets();

  // State
  const [loading, setLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  // Router
  const router = useRouter();
  // const params = useLocalSearchParams<{
  //   video?: string;
  //   status?: string;
  //   watchTimeSeconds?: string;
  //   totalTimeSeconds?: string;
  //   lessonId?: string;
  //   chapterId?: string;
  //   sectionId?: string;
  //   courseId?: string;
  // }>();

  // Lock to landscape on mount
  // useEffect(() => {
  //   const lockToLandscape = async () => {
  //     try {
  //       await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  //     } catch (err) {
  //       console.warn('Failed to lock orientation:', err);
  //     }
  //   };
  //   lockToLandscape();
  //   return () => {
  //     ScreenOrientation.unlockAsync().catch(() => { });
  //   };
  // }, []);

  // Derived values
  const parsedWatchTime = useMemo(() =>
    params.watchTimeSeconds ? parseFloat(params.watchTimeSeconds) : 0,
    [params.watchTimeSeconds]
  );

  // Memoized functions
  const seekToTimeJS = useCallback((seconds: number) => `
    (function() {
      const player = document.getElementById('media-player');
      if (player) player.currentTime = ${seconds};
      true;
    })();
  `, []);

  // Throttled progress update to server
  const updateProgress = useCallback(async (currentTime: number, duration: number) => {
    if (!params.lessonId) return;

    const now = Date.now();
    const timeDiff = now - lastProgressUpdate.current;
    const progressDiff = Math.abs(currentTime - lastProgressValue.current);

    if (timeDiff >= PROGRESS_UPDATE_INTERVAL && progressDiff >= MIN_PROGRESS_DIFF) {
      try {
        const response = await courseServiceGet.updateLessonProgress(params.lessonId, {
          status: 'in_progress',
          courseId: params.courseId,
          sectionId: params.sectionId,
          chapterId: params.chapterId,
          lastPosition: currentTime,
          watchTimeSeconds: currentTime,
          totalTimeSeconds: duration,
        });
        lastProgressUpdate.current = now;
        lastProgressValue.current = currentTime;
      } catch (error) {
        console.error('Progress update error:', error);
      }
    }
  }, [params.lessonId, params.courseId, params.sectionId, params.chapterId]);

  // Mark lesson as complete
  const handleMarkAsComplete = useCallback(async () => {
    if (!params.lessonId || hasMarkedComplete.current) return;

    const now = Date.now();
    if (now - lastCompletionCheck.current < COMPLETION_CHECK_INTERVAL) return;

    lastCompletionCheck.current = now;
    hasMarkedComplete.current = true;

    try {
      const response = await courseServiceGet.markLessonCompleted(params.lessonId, {
        courseId: params.courseId,
        sectionId: params.sectionId,
        chapterId: params.chapterId
      });

    } catch (error) {
      console.error('Completion error:', error);
      hasMarkedComplete.current = false;
    }
  }, [params.lessonId, params.courseId, params.sectionId, params.chapterId]);

  // Message handler
  const onMessage = useCallback((event: WebViewMessageEvent) => {
    const message = event.nativeEvent.data;

    if (message.startsWith('TIME_UPDATE:')) {
      try {
        const timeData: TimeData = JSON.parse(message.substring('TIME_UPDATE:'.length));
        const { currentTime, duration } = timeData;

        updateProgress(currentTime, duration);

        const totalSeconds = parseFloat(params.totalTimeSeconds || duration.toString());
        if (
          totalSeconds > 0 &&
          currentTime >= totalSeconds * COMPLETION_THRESHOLD &&
          params.status !== 'completed'
        ) {
          handleMarkAsComplete();
        }
      } catch (e) {
        console.error('Time parse error:', e);
      }
      return;
    }

    if (message === 'PLAYER_READY' || message === 'CAN_PLAY') {
      setLoading(false);
    }
  }, [params.totalTimeSeconds, params.status, updateProgress, handleMarkAsComplete]);

  // Load HTML template
  useEffect(() => {
    let isMounted = true;

    const loadHtmlTemplate = async () => {
      try {
        const htmlAsset = Asset.fromModule(require('../../../assets/html/index.html'));
        await htmlAsset.downloadAsync();

        if (isMounted && htmlAsset.localUri) {
          const template = await FileSystem.readAsStringAsync(htmlAsset.localUri);
          const content = template
            .replace('const videoSrc = getParameterByName(\'src\') || \'youtube/_cMxraX_5RE\';',
              `const videoSrc = '${ params.video}';`)
            .replace('// <INJECT_START_TIME>', `const startTime = ${parsedWatchTime || 0};`);

          setHtmlContent(content);
        }
      } catch (error) {
        if (isMounted) setLoading(false);
      }
    };

    loadHtmlTemplate();

    return () => {
      isMounted = false;
    };
  }, [params.video, parsedWatchTime]);

  // Seek to saved time when player is ready
  useEffect(() => {
    if (!htmlContent || parsedWatchTime <= 0 || !webViewRef.current) return;

    const timer = setTimeout(() => {
      webViewRef.current?.injectJavaScript(seekToTimeJS(parsedWatchTime));
    }, 1000);

    return () => clearTimeout(timer);
  }, [htmlContent, parsedWatchTime, seekToTimeJS]);

return (
   <View style={styles.container}>
      {loading && (
        <ActivityIndicator
          style={StyleSheet.absoluteFill}
          size="large"
          color="#FFF"
        />
      )}
      {htmlContent && (
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent, baseUrl: 'https://vidstack.io/' }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo={false}
          onLoadEnd={() => setLoading(false)}
          onMessage={onMessage}
          scalesPageToFit={true}  // Add this
        />
      )}
    </View>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerRow: {
    position: 'absolute',
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

});

export default React.memo(VideoPlayer);