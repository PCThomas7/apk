// import { Ionicons } from '@expo/vector-icons';
// import React, { useCallback, useState, useEffect } from 'react';
// import { StyleSheet, TouchableOpacity, View } from 'react-native';
// import courseServiceGet from '@/services/courseServiceGet';

// interface NavPanelProps {
//   showChat: boolean;
//   toggleChat: () => void;
//   params: any;
// }

// const NavPanel: React.FC<NavPanelProps> = ({ showChat, toggleChat, params }) => {
//   const initialBookmark = params.bookmarked === true || params.bookmarked === 'true';
//   const [isBookmarked, setIsBookmarked] = useState(initialBookmark);

//   const toggleBookmark = useCallback(async () => {
//     if (!params.lessonId) return;
//     try {
//       const response = await courseServiceGet.toggleLessonBookmark(params.lessonId);
//       setIsBookmarked(response.bookmarked);
//     } catch (error) {
//       console.error('Bookmark error:', error);
//     }
//   }, [params.lessonId]);

//   return (
//     <View style={styles.navPanel}>
//       <TouchableOpacity
//         style={styles.navButton}
//         onPress={toggleChat}
//         activeOpacity={0.6}
//       >
//         <Ionicons
//           name={showChat ? "chatbubbles" : "chatbubbles-outline"}
//           size={20}
//           style={styles.navButtonIcon}
//         />
//       </TouchableOpacity>

//       {/* Bookmark button with conditional icon */}
//       <TouchableOpacity
//         style={styles.navButton}
//         activeOpacity={0.6}
//         onPress={toggleBookmark}
//       >
//         <Ionicons
//           name={isBookmarked ? "bookmark" : "bookmark-outline"}
//           size={20}
//           style={[styles.navButtonIcon, isBookmarked && { color: '#ffffff' }]}
//         />
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.navButton}
//         activeOpacity={0.6}
//       >
//         <Ionicons
//           name="document-text-outline"
//           size={20}
//           style={styles.navButtonIcon}
//         />
//       </TouchableOpacity>
//     </View>
//   );
// };

// // Keep the same styles as before
// const styles = StyleSheet.create({
//   navPanel: {
//     width: '100%',
//     backgroundColor: 'transparent',
//     flexDirection: 'column',
//     justifyContent: 'center',
//     alignItems: 'center',
//     height: '100%',
//   },
//   navButton: {
//     marginVertical: 15,
//     width: '70%',
//     aspectRatio: 1,
//     borderRadius: 8,
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   navButtonIcon: {
//     color: 'rgba(255, 255, 255, 0.9)',
//   },
// });

// export default NavPanel;

import courseServiceGet from '@/services/courseServiceGet';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Handout {
  id: string;
  title: string;
  link: string;
  sharedAt: string | Date;
  sharedBy: {
    id: string;
    name: string;
    email?: string;
  };
}

export interface NavPanelParams {
  bookmarked?: boolean | string;
  lessonId?: string;
}

interface NavPanelProps {
  activePanel: 'chat' | 'handout' | null;
  togglePanel: (panel: 'chat' | 'handout') => void;
  params: NavPanelParams;
  onExit?: () => void;
  socket?: any;
}

const NavPanel: React.FC<NavPanelProps> = ({
  activePanel,
  togglePanel,
  params,
  onExit,
  socket
}) => {
  const [isBookmarked, setIsBookmarked] = useState(
    params.bookmarked === true || params.bookmarked === 'true'
  );
  const [unseenHandoutsCount, setUnseenHandoutsCount] = useState(0);

  // Socket event listeners for real-time handout updates
  useEffect(() => {
    if (!socket) return;

    const handleNewHandout = () => {
      setUnseenHandoutsCount(prev => prev + 1);
    };

    const handleDeletedHandout = () => {
      setUnseenHandoutsCount(prev => Math.max(0, prev - 1)); // Prevent negative counts
    };

    socket.on('handout-shared', handleNewHandout);
    socket.on('handout-deleted', handleDeletedHandout);

    return () => {
      socket.off('handout-shared', handleNewHandout);
      socket.off('handout-deleted', handleDeletedHandout);
    };
  }, [socket]);

  const toggleBookmark = useCallback(async () => {
    if (!params.lessonId) return;

    try {
      const response = await courseServiceGet.toggleLessonBookmark(params.lessonId);
      setIsBookmarked(response.bookmarked);
      Alert.alert(
        response.bookmarked ? 'Bookmarked!' : 'Bookmark removed',
        response.bookmarked
          ? 'This lesson has been saved to your bookmarks'
          : 'Removed from your bookmarks'
      );
    } catch (error) {
      console.error('Bookmark error:', error);
      Alert.alert('Error', 'Failed to update bookmark. Please try again.');
    }
  }, [params.lessonId]);

  const handleHandoutPress = useCallback(() => {
    // Reset counter when handout panel is opened
    setUnseenHandoutsCount(0);
    togglePanel('handout');
  }, [togglePanel]);

  return (
    <View style={styles.navPanel}>
      {/* Chat Button */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => togglePanel('chat')}
        activeOpacity={0.6}
      >
        <Ionicons
          name={activePanel === 'chat' ? "chatbubbles" : "chatbubbles-outline"}
          size={20}
          color="rgba(255, 255, 255, 0.9)"
        />
      </TouchableOpacity>

      {/* Bookmark Button */}
      <TouchableOpacity
        style={styles.navButton}
        activeOpacity={0.6}
        onPress={toggleBookmark}
      >
        <Ionicons
          name={isBookmarked ? "bookmark" : "bookmark-outline"}
          size={20}
          color={isBookmarked ? '#ffffff' : 'rgba(255, 255, 255, 0.9)'}
        />
      </TouchableOpacity>

      {/* Handout Button with Badge */}
      <TouchableOpacity
        style={styles.navButton}
        activeOpacity={0.6}
        onPress={handleHandoutPress}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={activePanel === 'handout' ? "document-text" : "document-text-outline"}
            size={20}
            color="rgba(255, 255, 255, 0.9)"
          />
          {unseenHandoutsCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unseenHandoutsCount > 9 ? '9+' : unseenHandoutsCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Exit Button */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={onExit}
        activeOpacity={0.6}
      >
        <Ionicons
          name="exit-outline"
          size={20}
          color="rgba(255, 255, 255, 0.9)"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navPanel: {
    width: '100%',
    backgroundColor: 'transparent',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    paddingVertical: 10,
  },
  navButton: {
    marginVertical: 12,
    width: '70%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    width: 15,
    height: 15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default React.memo(NavPanel);