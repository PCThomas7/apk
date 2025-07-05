// import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import {
//   StyleSheet,
//   View,
//   Dimensions,
//   ActivityIndicator,
//   Text,
//   TouchableOpacity,
//   Animated,
// } from 'react-native';
// import { WebView, WebViewMessageEvent } from 'react-native-webview';
// import { Asset } from 'expo-asset';
// import * as FileSystem from 'expo-file-system';
// import * as ScreenOrientation from 'expo-screen-orientation';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';
// import courseServiceGet from '@/services/courseServiceGet';

// interface VideoPlayerProps {
//   src?: string;
//   title?: string;
//   aspectRatio?: number;
//   onTimeUpdate?: (currentTime: number, duration: number) => void;
// }

// interface TimeData {
//   currentTime: number;
//   duration: number;
// }

// const PROGRESS_UPDATE_INTERVAL = 20000; // 20 seconds
// const COMPLETION_THRESHOLD = 0.95; // 95% of video
// const MIN_PROGRESS_DIFF = 5; // Minimum seconds difference to trigger update
// const COMPLETION_CHECK_INTERVAL = 5000; // 5 seconds between completion checks

// const VideoPlayer: React.FC<VideoPlayerProps> = ({
//   src = "",
//   title = '',
//   aspectRatio = 16 / 9,
//   onTimeUpdate
// }) => {
//   // Refs
//   const webViewRef = useRef<WebView>(null);
//   const fadeAnim = useRef(new Animated.Value(1)).current;
//   const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const hasMarkedComplete = useRef(false);
//   const lastProgressUpdate = useRef(0);
//   const lastProgressValue = useRef(0);
//   const lastCompletionCheck = useRef(0);

//   // State
//   const [loading, setLoading] = useState(true);
//   const [htmlContent, setHtmlContent] = useState<string | null>(null);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [showControls, setShowControls] = useState(true);
//   const [isBookmarked, setIsBookmarked] = useState(false);
//   const [localStatus, setLocalStatus] = useState('not_started');

//   // Router
//   const router = useRouter();
//   const params = useLocalSearchParams<{
//     video?: string;
//     status?: string;
//     vediotitle?: string;
//     watchTimeSeconds?: string;
//     totalTimeSeconds?: string;
//     viewCount?: string;
//     bookmarked?: string;
//     lessonId?: string;
//     chapterId?: string;
//     sectionId?: string;
//     courseId?: string;
//   }>();

//   // Dimensions
//   const { width } = Dimensions.get('window');
//   const videoHeight = isFullscreen ? Dimensions.get('window').height : width / aspectRatio;

//   // Derived values
//   const screenTitle = useMemo(() => title || params.vediotitle || 'Video', [title, params.vediotitle]);
//   const parsedWatchTime = useMemo(() => 
//     params.watchTimeSeconds ? parseFloat(params.watchTimeSeconds) : 0,
//     [params.watchTimeSeconds]
//   );

//   // Memoized functions
//   const seekToTimeJS = useCallback((seconds: number) => `
//     (function() {
//       const player = document.getElementById('media-player');
//       if (player) player.currentTime = ${seconds};
//       true;
//     })();
//   `, []);

//   // Throttled progress update to server
//   const updateProgress = useCallback(async (currentTime: number, duration: number) => {
//     if (!params.lessonId) return;

//     const now = Date.now();
//     const timeDiff = now - lastProgressUpdate.current;
//     const progressDiff = Math.abs(currentTime - lastProgressValue.current);

//     if (timeDiff >= PROGRESS_UPDATE_INTERVAL && progressDiff >= MIN_PROGRESS_DIFF) {
//       try {
//         const response = await courseServiceGet.updateLessonProgress(params.lessonId, {
//           status: 'in_progress',
//           courseId: params.courseId,
//           sectionId: params.sectionId,
//           chapterId: params.chapterId,
//           lastPosition: currentTime,
//           watchTimeSeconds: currentTime,
//           totalTimeSeconds: duration,
//         });
//         // console.log('Progress updated:', response);
//         lastProgressUpdate.current = now;
//         lastProgressValue.current = currentTime;
//       } catch (error) {
//         console.error('Progress update error:', error);
//       }
//     }
//   }, [params.lessonId, params.courseId, params.sectionId, params.chapterId]);

//   // Mark lesson as complete
//   const handleMarkAsComplete = useCallback(async () => {
//     if (!params.lessonId || hasMarkedComplete.current) return;

//     const now = Date.now();
//     if (now - lastCompletionCheck.current < COMPLETION_CHECK_INTERVAL) return;

//     lastCompletionCheck.current = now;
//     hasMarkedComplete.current = true;

//     try {
//       const response = await courseServiceGet.markLessonCompleted(params.lessonId, {
//         courseId: params.courseId,
//         sectionId: params.sectionId,
//         chapterId: params.chapterId
//       });
//       console.log('Marked as complete:', response);
//       setLocalStatus('completed');
//       router.setParams({ ...params, status: 'completed' });
//     } catch (error) {
//       console.error('Completion error:', error);
//       hasMarkedComplete.current = false;
//     }
//   }, [params.lessonId, params.courseId, params.sectionId, params.chapterId, router]);

//   // Message handler
//   const onMessage = useCallback((event: WebViewMessageEvent) => {
//     const message = event.nativeEvent.data;

//     if (message.startsWith('TIME_UPDATE:')) {
//       try {
//         const timeData: TimeData = JSON.parse(message.substring('TIME_UPDATE:'.length));
//         const { currentTime, duration } = timeData;

//         // Update parent component with time
//         onTimeUpdate?.(currentTime, duration);

//         // Throttled progress update
//         updateProgress(currentTime, duration);

//         // Check for completion
//         const totalSeconds = parseFloat(params.totalTimeSeconds || duration.toString());
//         if (
//           totalSeconds > 0 &&
//           currentTime >= totalSeconds * COMPLETION_THRESHOLD &&
//           localStatus !== 'completed'
//         ) {
//           handleMarkAsComplete();
//         }
//       } catch (e) {
//         console.error('Time parse error:', e);
//       }
//       return;
//     }

//     switch (message) {
//       case 'PLAYER_READY':
//       case 'CAN_PLAY':
//         setLoading(false);
//         break;
//       case 'ENTERED_FULLSCREEN':
//         setIsFullscreen(true);
//         break;
//       case 'EXITED_FULLSCREEN':
//         setIsFullscreen(false);
//         break;
//     }
//   }, [onTimeUpdate, params.totalTimeSeconds, localStatus, updateProgress, handleMarkAsComplete]);

//   // Load HTML template
//   useEffect(() => {
//     let isMounted = true;

//     const loadHtmlTemplate = async () => {
//       try {
//         const htmlAsset = Asset.fromModule(require('../../../assets/html/index.html'));
//         await htmlAsset.downloadAsync();

//         if (isMounted && htmlAsset.localUri) {
//           const template = await FileSystem.readAsStringAsync(htmlAsset.localUri);
//           const content = template
//             .replace('const videoSrc = getParameterByName(\'src\') || \'youtube/_cMxraX_5RE\';',
//               `const videoSrc = '${src || params.video}';`)
//             .replace('// <INJECT_START_TIME>', `const startTime = ${parsedWatchTime || 0};`);

//           setHtmlContent(content);
//         }
//       } catch (error) {
//         if (isMounted) setLoading(false);
//       }
//     };

//     loadHtmlTemplate();

//     return () => {
//       isMounted = false;
//     };
//   }, [src, params.video, parsedWatchTime]);

//   // Seek to saved time when player is ready
//   useEffect(() => {
//     if (!htmlContent || parsedWatchTime <= 0 || !webViewRef.current) return;

//     const timer = setTimeout(() => {
//       webViewRef.current?.injectJavaScript(seekToTimeJS(parsedWatchTime));
//     }, 1000);

//     return () => clearTimeout(timer);
//   }, [htmlContent, parsedWatchTime, seekToTimeJS]);

//   // Fullscreen handling
//   useEffect(() => {
//     const handleFullscreenChange = async () => {
//       try {
//         if (isFullscreen) {
//           await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
//         } else {
//           await ScreenOrientation.unlockAsync();
//         }
//       } catch (error) {
//         console.error('Orientation error:', error);
//       }
//     };

//     handleFullscreenChange();
//   }, [isFullscreen]);

//   // Controls visibility timeout
//   useEffect(() => {
//     if (!isFullscreen) return;

//     controlsTimeout.current = setTimeout(() => {
//       Animated.timing(fadeAnim, {
//         toValue: 0,
//         duration: 500,
//         useNativeDriver: true,
//       }).start(() => setShowControls(false));
//     }, 3000);

//     return () => {
//       if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
//     };
//   }, [isFullscreen, fadeAnim]);

//   // Initialize states from params
//   useEffect(() => {
//     setIsBookmarked(params.bookmarked === 'true');
//     setLocalStatus(params.status || 'not_started');
//   }, [params.bookmarked, params.status]);

//   // Event handlers
//   const handleTap = useCallback(() => {
//     if (!isFullscreen) return;

//     setShowControls(prev => {
//       Animated.timing(fadeAnim, {
//         toValue: prev ? 0 : 1,
//         duration: 300,
//         useNativeDriver: true,
//       }).start();
//       return !prev;
//     });
//   }, [isFullscreen, fadeAnim]);

//   const handleBack = useCallback(() => {
//     if (isFullscreen) setIsFullscreen(false);
//     else router.back();
//   }, [isFullscreen, router]);

//   const formatViewCount = useCallback((count: number = 0): string => {
//     if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
//     if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
//     return `${count}`;
//   }, []);

//   const toggleBookmark = useCallback(async () => {
//     if (!params.lessonId) return;
//     try {
//       const response = await courseServiceGet.toggleLessonBookmark(params.lessonId);
//       setIsBookmarked(response.bookmarked);
//     } catch (error) {
//       console.error('Bookmark error:', error);
//     }
//   }, [params.lessonId]);

//   if (!htmlContent) {
//     return (
//       <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
//         <View style={styles.container}>
//           <View style={styles.header}>
//             <TouchableOpacity onPress={handleBack} style={styles.backButton}>
//               <Ionicons name="arrow-back" size={24} color="#000" />
//             </TouchableOpacity>
//             <Text style={styles.headerTitle}>{screenTitle}</Text>
//           </View>
//           <View style={[styles.playerWrapper, { height: videoHeight }]}>
//             <ActivityIndicator size="large" color="#FF0000" />
//           </View>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
//       <View style={styles.container}>
//         {!isFullscreen && (
//           <View style={styles.header}>
//             <TouchableOpacity onPress={handleBack} style={styles.backButton}>
//               <Ionicons name="arrow-back" size={24} color="#000" />
//             </TouchableOpacity>
//             <Text style={styles.headerTitle} numberOfLines={1}>{screenTitle}</Text>
//           </View>
//         )}

//         <View style={[styles.playerWrapper, { height: videoHeight }]} onTouchStart={handleTap}>
//           <WebView
//             ref={webViewRef}
//             source={{ html: htmlContent, baseUrl: 'https://vidstack.io/' }}
//             style={styles.webview}
//             javaScriptEnabled
//             allowsInlineMediaPlayback
//             mediaPlaybackRequiresUserAction={false}
//             allowsFullscreenVideo
//             onMessage={onMessage}
//           />

//           {isFullscreen && showControls && (
//             <Animated.View style={[styles.fullscreenControls, { opacity: fadeAnim }]}>
//               <TouchableOpacity onPress={handleBack} style={styles.fullscreenBackButton}>
//                 <Ionicons name="arrow-back" size={28} color="#FFF" />
//               </TouchableOpacity>
//               <Text style={styles.fullscreenTitle} numberOfLines={1}>{screenTitle}</Text>
//             </Animated.View>
//           )}

//           {loading && (
//             <View style={styles.loaderContainer}>
//               <ActivityIndicator size="large" color="#FF0000" />
//             </View>
//           )}
//         </View>

//         {!isFullscreen && (
//           <View style={styles.infoContainer}>
//             <Text style={styles.videoTitle}>{screenTitle}</Text>

//             <View style={styles.statsContainer}>
//               <Text style={styles.viewCount}>{formatViewCount(Number(params.viewCount))} times viewed.</Text>
//               <View style={styles.statusBadge}>
//                 <Text style={styles.statusText}>{localStatus === 'completed' ? 'Completed' : 'In Progress'}</Text>
//               </View>
//             </View>

//             <View style={styles.actionRow}>
//               {localStatus !== 'completed' && (
//                 <TouchableOpacity style={styles.actionButton} onPress={handleMarkAsComplete}>
//                   <View style={styles.buttonContent}>
//                     <Ionicons name="checkmark-circle" size={24} color="#606060" />
//                     <Text style={styles.actionText}>Mark as completed</Text>
//                   </View>
//                 </TouchableOpacity>
//               )}

//               <TouchableOpacity style={styles.actionButton} onPress={toggleBookmark}>
//                 <View style={styles.buttonContent}>
//                   <Ionicons
//                     name={isBookmarked ? "bookmark" : "bookmark-outline"}
//                     size={24}
//                     color={isBookmarked ? "#065fd4" : "#606060"}
//                   />
//                   <Text style={[styles.actionText, isBookmarked && styles.bookmarkedText]}>
//                     {isBookmarked ? 'Saved' : 'Save'}
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: '#FFF' },
//   container: { flex: 1, backgroundColor: '#FFF' },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e5e5e5',
//   },
//   backButton: { padding: 4, marginRight: 12 },
//   headerTitle: { fontSize: 16, fontWeight: '500', flex: 1 },
//   playerWrapper: { width: '100%', backgroundColor: '#000' },
//   webview: { flex: 1 },
//   loaderContainer: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.7)',
//   },
//   fullscreenControls: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     paddingTop: 20,
//     paddingHorizontal: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     zIndex: 10,
//   },
//   fullscreenBackButton: { padding: 8, marginRight: 16 },
//   fullscreenTitle: { color: '#FFF', fontSize: 16, fontWeight: '500', flex: 1 },
//   infoContainer: { padding: 16 },
//   videoTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
//   statsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   viewCount: { fontSize: 14, color: '#606060', marginRight: 12 },
//   statusBadge: {
//     backgroundColor: '#E0F2FE',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//   },
//   statusText: { color: '#0369A1', fontSize: 12, fontWeight: '500' },
//   actionRow: {
//     flexDirection: 'row',
//     justifyContent: 'flex-start',
//     paddingVertical: 8,
//     gap: 24,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//     borderColor: '#e5e5e5',
//     marginBottom: 16,
//   },
//   actionButton: {},
//   buttonContent: {
//     alignItems: 'center',
//     flexDirection: 'row',
//     gap: 6,
//   },
//   actionText: { fontSize: 14, color: '#606060', fontWeight: '500' },
//   bookmarkedText: { color: '#065fd4' },
// });

// export default React.memo(VideoPlayer);



import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import courseServiceGet from '@/services/courseServiceGet';

interface VideoPlayerProps {
  src?: string;
  title?: string;
  aspectRatio?: number;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

interface TimeData {
  currentTime: number;
  duration: number;
}

const PROGRESS_UPDATE_INTERVAL = 20000;
const COMPLETION_THRESHOLD = 0.95;
const MIN_PROGRESS_DIFF = 5;
const COMPLETION_CHECK_INTERVAL = 5000;

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src = "",
  title = '',
  aspectRatio = 16 / 9,
  onTimeUpdate
}) => {
  // Refs
  const webViewRef = useRef<WebView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMarkedComplete = useRef(false);
  const lastProgressUpdate = useRef(0);
  const lastProgressValue = useRef(0);
  const lastCompletionCheck = useRef(0);

  // State
  const [loading, setLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [localStatus, setLocalStatus] = useState('not_started');

  // Router params with safe defaults
  const params = useLocalSearchParams<{
    video?: string;
    status?: string;
    vediotitle?: string;
    watchTimeSeconds?: string;
    totalTimeSeconds?: string;
    viewCount?: string;
    bookmarked?: string;
    lessonId?: string;
    chapterId?: string;
    sectionId?: string;
    courseId?: string;
  }>();

  // Safe parameter extraction with defaults
  const video = params.video || '';
  const status = params.status || 'not_started';
  const vediotitle = params.vediotitle || '';
  const watchTimeSeconds = params.watchTimeSeconds || '0';
  const totalTimeSeconds = params.totalTimeSeconds || '0';
  const viewCount = params.viewCount || '0';
  const bookmarked = params.bookmarked || 'false'; // Default to 'false' if undefined/null
  const lessonId = params.lessonId || '';
  const chapterId = params.chapterId || '';
  const sectionId = params.sectionId || '';
  const courseId = params.courseId || '';

  // Dimensions
  const { width } = Dimensions.get('window');
  const videoHeight = isFullscreen ? Dimensions.get('window').height : width / aspectRatio;

  // Derived values with safe parsing
  const screenTitle = useMemo(() => title || vediotitle || 'Video', [title, vediotitle]);
  const parsedWatchTime = useMemo(() => {
    const parsed = parseFloat(watchTimeSeconds);
    return isNaN(parsed) ? 0 : parsed;
  }, [watchTimeSeconds]);

  const parsedViewCount = useMemo(() => {
    const parsed = parseInt(viewCount, 10);
    return isNaN(parsed) ? 0 : parsed;
  }, [viewCount]);

  const router = useRouter();

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
    if (!lessonId) return;

    const now = Date.now();
    const timeDiff = now - lastProgressUpdate.current;
    const progressDiff = Math.abs(currentTime - lastProgressValue.current);

    if (timeDiff >= PROGRESS_UPDATE_INTERVAL && progressDiff >= MIN_PROGRESS_DIFF) {
      try {
        await courseServiceGet.updateLessonProgress(lessonId, {
          status: 'in_progress',
          courseId,
          sectionId,
          chapterId,
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
  }, [lessonId, courseId, sectionId, chapterId]);

  // Mark lesson as complete
  const handleMarkAsComplete = useCallback(async () => {
    if (!lessonId || hasMarkedComplete.current) return;

    const now = Date.now();
    if (now - lastCompletionCheck.current < COMPLETION_CHECK_INTERVAL) return;

    lastCompletionCheck.current = now;
    hasMarkedComplete.current = true;

    try {
      await courseServiceGet.markLessonCompleted(lessonId, {
        courseId,
        sectionId,
        chapterId
      });
      setLocalStatus('completed');
    } catch (error) {
      console.error('Completion error:', error);
      hasMarkedComplete.current = false;
    }
  }, [lessonId, courseId, sectionId, chapterId]);

  // Message handler
  const onMessage = useCallback((event: WebViewMessageEvent) => {
    const message = event.nativeEvent.data;

    if (message.startsWith('TIME_UPDATE:')) {
      try {
        const timeData: TimeData = JSON.parse(message.substring('TIME_UPDATE:'.length));
        const { currentTime, duration } = timeData;

        onTimeUpdate?.(currentTime, duration);
        updateProgress(currentTime, duration);

        const totalSeconds = parseFloat(totalTimeSeconds || duration.toString());
        if (
          totalSeconds > 0 &&
          currentTime >= totalSeconds * COMPLETION_THRESHOLD &&
          localStatus !== 'completed'
        ) {
          handleMarkAsComplete();
        }
      } catch (e) {
        console.error('Time parse error:', e);
      }
      return;
    }

    switch (message) {
      case 'PLAYER_READY':
      case 'CAN_PLAY':
        setLoading(false);
        break;
      case 'ENTERED_FULLSCREEN':
        setIsFullscreen(true);
        break;
      case 'EXITED_FULLSCREEN':
        setIsFullscreen(false);
        break;
    }
  }, [onTimeUpdate, totalTimeSeconds, localStatus, updateProgress, handleMarkAsComplete]);

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
              `const videoSrc = '${src || video}';`)
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
  }, [src, video, parsedWatchTime]);

  // Seek to saved time when player is ready
  useEffect(() => {
    if (!htmlContent || parsedWatchTime <= 0 || !webViewRef.current) return;

    const timer = setTimeout(() => {
      webViewRef.current?.injectJavaScript(seekToTimeJS(parsedWatchTime));
    }, 1000);

    return () => clearTimeout(timer);
  }, [htmlContent, parsedWatchTime, seekToTimeJS]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = async () => {
      try {
        if (isFullscreen) {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        } else {
          await ScreenOrientation.unlockAsync();
        }
      } catch (error) {
        console.error('Orientation error:', error);
      }
    };

    handleFullscreenChange();
  }, [isFullscreen]);

  // Controls visibility timeout
  useEffect(() => {
    if (!isFullscreen) return;

    controlsTimeout.current = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setShowControls(false));
    }, 3000);

    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, [isFullscreen, fadeAnim]);

  // Initialize states from params
  useEffect(() => {
    setIsBookmarked(bookmarked === 'true');
    setLocalStatus(status);
  }, [bookmarked, status]);

  // Event handlers
  const handleTap = useCallback(() => {
    if (!isFullscreen) return;

    setShowControls(prev => {
      Animated.timing(fadeAnim, {
        toValue: prev ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      return !prev;
    });
  }, [isFullscreen, fadeAnim]);

  const handleBack = useCallback(() => {
    if (isFullscreen) setIsFullscreen(false);
    else router.back();
  }, [isFullscreen, router]);

  const formatViewCount = useCallback((count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return `${count}`;
  }, []);

  const toggleBookmark = useCallback(async () => {
    if (!lessonId) return;
    try {
      const response = await courseServiceGet.toggleLessonBookmark(lessonId);
      setIsBookmarked(response.bookmarked);
    } catch (error) {
      console.error('Bookmark error:', error);
    }
  }, [lessonId]);

  if (!htmlContent) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{screenTitle}</Text>
          </View>
          <View style={[styles.playerWrapper, { height: videoHeight }]}>
            <ActivityIndicator size="large" color="#FF0000" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.container}>
        {!isFullscreen && (
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{screenTitle}</Text>
          </View>
        )}

        <View style={[styles.playerWrapper, { height: videoHeight }]} onTouchStart={handleTap}>
          <WebView
            ref={webViewRef}
            source={{ html: htmlContent, baseUrl: 'https://vidstack.io/' }}
            style={styles.webview}
            javaScriptEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            allowsFullscreenVideo
            onMessage={onMessage}
          />

          {isFullscreen && showControls && (
            <Animated.View style={[styles.fullscreenControls, { opacity: fadeAnim }]}>
              <TouchableOpacity onPress={handleBack} style={styles.fullscreenBackButton}>
                <Ionicons name="arrow-back" size={28} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.fullscreenTitle} numberOfLines={1}>{screenTitle}</Text>
            </Animated.View>
          )}

          {loading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#FF0000" />
            </View>
          )}
        </View>

        {!isFullscreen && (
          <View style={styles.infoContainer}>
            <Text style={styles.videoTitle}>{screenTitle}</Text>

            <View style={styles.statsContainer}>
              <Text style={styles.viewCount}>{formatViewCount(parsedViewCount)} times viewed.</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{localStatus === 'completed' ? 'Completed' : 'In Progress'}</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              {localStatus !== 'completed' && (
                <TouchableOpacity style={styles.actionButton} onPress={handleMarkAsComplete}>
                  <View style={styles.buttonContent}>
                    <Ionicons name="checkmark-circle" size={24} color="#606060" />
                    <Text style={styles.actionText}>Mark as completed</Text>
                  </View>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.actionButton} onPress={toggleBookmark}>
                <View style={styles.buttonContent}>
                  <Ionicons
                    name={isBookmarked ? "bookmark" : "bookmark-outline"}
                    size={24}
                    color={isBookmarked ? "#065fd4" : "#606060"}
                  />
                  <Text style={[styles.actionText, isBookmarked && styles.bookmarkedText]}>
                    {isBookmarked ? 'Saved' : 'Save'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 16, fontWeight: '500', flex: 1 },
  playerWrapper: { width: '100%', backgroundColor: '#000' },
  webview: { flex: 1 },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  fullscreenControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  fullscreenBackButton: { padding: 8, marginRight: 16 },
  fullscreenTitle: { color: '#FFF', fontSize: 16, fontWeight: '500', flex: 1 },
  infoContainer: { padding: 16 },
  videoTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewCount: { fontSize: 14, color: '#606060', marginRight: 12 },
  statusBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: { color: '#0369A1', fontSize: 12, fontWeight: '500' },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 8,
    gap: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e5e5',
    marginBottom: 16,
  },
  actionButton: {},
  buttonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  actionText: { fontSize: 14, color: '#606060', fontWeight: '500' },
  bookmarkedText: { color: '#065fd4' },
});

export default React.memo(VideoPlayer);