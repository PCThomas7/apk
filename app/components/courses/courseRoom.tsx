// import { Ionicons } from '@expo/vector-icons';
// import * as NavigationBar from 'expo-navigation-bar';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import * as ScreenOrientation from 'expo-screen-orientation';
// import { setStatusBarHidden } from 'expo-status-bar';
// import React, { useEffect, useState, useCallback } from 'react';
// import { Platform, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import ChatPanel from './chatPanel';
// import VideoPlayer from './videoPlayer';
// import NavPanel from './navPanel';
// import { useFocusEffect } from '@react-navigation/native';
// import { useSocket } from '../../../hooks/useSocket';

// interface CourseParams {
//   video?: string;
//   status?: string;
//   watchTimeSeconds?: string;
//   totalTimeSeconds?: string;
//   lessonId?: string;
//   chapterId?: string;
//   sectionId?: string;
//   courseId?: string;
//   bookmarked?:Boolean;
// }

// const CourseRoom = () => {
//   const [showChat, setShowChat] = useState(false);
//   const insets = useSafeAreaInsets();
//   const router = useRouter();
//   const params = useLocalSearchParams() as CourseParams;
//   const socketState = useSocket(params.lessonId);

//   const toggleChat = useCallback(() => {
//     setShowChat(prev => !prev);
//   }, []);

//   const enableFullScreen = useCallback(async () => {
//     try {
//       await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
//       setStatusBarHidden(true, 'fade');

//       if (Platform.OS === 'android') {
//         await NavigationBar.setVisibilityAsync("hidden");
//       }
//     } catch (error) {
//       console.warn('Error enabling immersive mode:', error);
//     }
//   }, []);

//   const disableFullScreen = useCallback(async () => {
//     await ScreenOrientation.unlockAsync();
//     setStatusBarHidden(false, 'fade');

//     if (Platform.OS === 'android') {
//       await NavigationBar.setVisibilityAsync("visible");
//     }
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       enableFullScreen();

//       return () => {
//         disableFullScreen();
//       };
//     }, [enableFullScreen, disableFullScreen])
//   );

//   return (
//     <View style={[styles.container, { paddingRight: insets.right }]}>
//       {/* Video Player - Takes 70% when chat is open (reduced from 72%), 95% when closed */}
//       <View style={[
//         styles.videoContainer,
//         {
//           width: showChat ? '70%' : '95%', // Adjusted from 72% to 70%
//         }
//       ]}>
//         <VideoPlayer params={params} />
//       </View>

//       {/* Chat Panel - 25% width when visible (increased from 23%) */}
//       {showChat && (
//         <View style={[
//           styles.chatContainer,
//           {
//             width: '25%', // Increased from 23%
//             height: '100%', // Explicitly set to 100%
//             right: '5%',
//             zIndex: 20
//           }
//         ]}>
//           <ChatPanel {...socketState} />
//         </View>
//       )}

//       {/* Navigation Panel - Fixed 5% width */}
//       <View style={styles.navPanelContainer}>
//         <NavPanel
//           showChat={showChat}
//           toggleChat={toggleChat}
//           params={params}
//         />
//       </View>

//       {/* Back Button */}
//       <TouchableOpacity
//         onPress={router.back}
//         style={[
//           styles.backButton,
//           {
//             left: insets.left + 20,
//             top: insets.top + 20,
//             zIndex: 30,
//           },
//         ]}
//         hitSlop={styles.hitSlop}
//       >
//         <Ionicons name="arrow-back" size={28} color="#FFF" />
//       </TouchableOpacity>

//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: 'row',
//     backgroundColor: '#000',
//   },
//   videoContainer: {
//     backgroundColor: '#000',
//     height: '100%',
//   },
//   chatContainer: {
//     position: 'absolute',
//     backgroundColor: '#1a1a1a',
//   },
//   navPanelContainer: {
//     position: 'absolute',
//     width: '5%',
//     height: '100%',
//     right: 0,
//     backgroundColor: 'rgba(30, 30, 30, 0.85)',
//     borderLeftWidth: 0.5,
//     borderLeftColor: 'rgba(255, 255, 255, 0.1)',
//     zIndex: 10
//   },
//   backButton: {
//     position: 'absolute',
//     padding: 4,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 20,
//   },
//   hitSlop: {
//     top: 40,
//     bottom: 20,
//     left: 20,
//     right: 20,
//   },
// });

// export default CourseRoom;

import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { setStatusBarHidden } from 'expo-status-bar';
import React, { useCallback, useState, useMemo ,useEffect} from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import ChatPanel from './chatPanel';
import VideoPlayer from './videoPlayer';
import NavPanel, { NavPanelParams } from './navPanel'; // Import the interface
import HandoutPanel from './handoutPanel';
import { useSocket } from '../../../hooks/useSocket';

interface CourseParams {
  video?: string;
  lessonId?: string;
  bookmarked?: boolean | string;
  [key: string]: any;
}

const CourseRoom = () => {
  const [activePanel, setActivePanel] = useState<'chat' | 'handout' | null>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams() as CourseParams;
  const socketState = useSocket(params.lessonId);

  const togglePanel = useCallback((panel: 'chat' | 'handout') => {
    setActivePanel(prev => prev === panel ? null : panel);
  }, []);

  const navPanelParams: NavPanelParams = useMemo(() => ({
    bookmarked: params.bookmarked,
    lessonId: params.lessonId
  }), [params.bookmarked, params.lessonId]);

  

  const enableFullScreen = useCallback(async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      setStatusBarHidden(true, 'fade');
      if (Platform.OS === 'android') {
        await NavigationBar.setVisibilityAsync("hidden");
      }
    } catch (error) {
      console.warn('Error enabling immersive mode:', error);
    }
  }, []);

  const disableFullScreen = useCallback(async () => {
    await ScreenOrientation.unlockAsync();
    setStatusBarHidden(false, 'fade');
    if (Platform.OS === 'android') {
      await NavigationBar.setVisibilityAsync("visible");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      enableFullScreen();
      return disableFullScreen;
    }, [enableFullScreen, disableFullScreen])
  );

  return (
    <View style={[styles.container, { paddingRight: insets.right }]}>
      <View style={[styles.videoContainer, { width: activePanel ? '70%' : '95%' }]}>
        <VideoPlayer params={params} />
      </View>

      {activePanel && (
        <View style={styles.sidePanel}>
          {activePanel === 'chat' ? <ChatPanel {...socketState} /> : <HandoutPanel params={params} {...socketState}/>}
        </View>
      )}

      <View style={styles.navPanelContainer}>
        <NavPanel
          activePanel={activePanel}
          togglePanel={togglePanel}
          params={navPanelParams}
          onExit={() => setActivePanel(null)}
          {...socketState}
        />
      </View>

      <TouchableOpacity
        onPress={router.back}
        style={[
          styles.backButton,
          {
            left: insets.left + 20,
            top: insets.top + 20,
          }
        ]}
        hitSlop={styles.hitSlop}
      >
        <Ionicons name="arrow-back" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

// Optimized styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#000',
  },
  videoContainer: {
    height: '100%',
    backgroundColor: '#000',
  },
  navPanelContainer: {
    position: 'absolute',
    width: '5%',
    height: '100%',
    right: 0,
    backgroundColor: 'rgba(30, 30, 30, 0.85)',
    borderLeftWidth: 0.5,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10
  },
  sidePanel: {
    width: '25%',
    height: '100%',
    right: '5%',
    position: 'absolute',
    zIndex: 20,
    backgroundColor: '#1a1a1a',
  },
  backButton: {
    position: 'absolute',
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    zIndex: 30,
  },
  hitSlop: {
    top: 40,
    bottom: 20,
    left: 20,
    right: 20,
  },
});

export default React.memo(CourseRoom);