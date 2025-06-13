// import React, { useEffect, useRef, useMemo } from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Dimensions,
//   Animated,
//   Platform,
//   StatusBar,
//   I18nManager
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useColorScheme } from '@/hooks/useColorScheme';


// interface DrawerMenuProps {
//   visible: boolean;
//   onClose: () => void;
// }

// const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
// const isLandscape = screenWidth > screenHeight;
// const DRAWER_WIDTH = isLandscape ? screenWidth * 0.35 : screenWidth * 0.82;
// const ANIMATION_DURATION = 300;

// const DrawerMenu: React.FC<DrawerMenuProps> = ({ visible, onClose }) => {
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === 'dark';
//   const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
//   const opacity = useRef(new Animated.Value(0)).current;

//   const statusBarHeight = Platform.select({
//     ios: 50,
//     android: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 30,
//     default: 20
//   });

//   // Memoize menu items to prevent unnecessary re-renders
//   const menuItems = useMemo(() => [
//     { 
//       icon: 'bar-chart-outline', 
//       title: 'My Performance', 
//       onPress: () => console.log('Performance pressed') 
//     },
//     { 
//       icon: 'chatbubble-ellipses-outline', 
//       title: 'Ask a Doubt', 
//       onPress: () => console.log('Ask a Doubt pressed') 
//     },
//     { 
//       icon: 'people-outline', 
//       title: 'Community', 
//       onPress: () => console.log('Community pressed') 
//     },
//     { 
//       icon: 'share-social-outline', 
//       title: 'Share App', 
//       onPress: () => console.log('Share pressed') 
//     },
//     { 
//       icon: 'bookmark-outline', 
//       title: 'Bookmarks', 
//       onPress: () => console.log('Bookmarks pressed') 
//     },
//     { 
//       icon: 'notifications-outline', 
//       title: 'Notifications', 
//       onPress: () => console.log('Notifications pressed') 
//     },
//     { 
//       icon: 'person-outline', 
//       title: 'Profile', 
//       onPress: () => console.log('Profile pressed') 
//     },
//     { 
//       icon: 'shield-checkmark-outline', 
//       title: 'Privacy Policy', 
//       onPress: () => console.log('Privacy Policy pressed') 
//     },
//     { 
//       icon: 'log-out-outline', 
//       title: 'Logout', 
//       danger: true, 
//       onPress: () => console.log('Logout pressed') 
//     },
//   ], []);

//   const handleMenuItemPress = (item: (typeof menuItems)[0]) => {
//     // Close drawer first with animation
//     Animated.parallel([
//       Animated.timing(translateX, {
//         toValue: -DRAWER_WIDTH,
//         duration: ANIMATION_DURATION,
//         useNativeDriver: true,
//       }),
//       Animated.timing(opacity, {
//         toValue: 0,
//         duration: ANIMATION_DURATION,
//         useNativeDriver: true,
//       })
//     ]).start(() => {
//       onClose();
//       item.onPress();
//     });
//   };

//   useEffect(() => {
//     if (visible) {
//       StatusBar.setBarStyle('light-content');
//       Animated.parallel([
//         Animated.timing(translateX, {
//           toValue: 0,
//           duration: ANIMATION_DURATION,
//           useNativeDriver: true,
//         }),
//         Animated.timing(opacity, {
//           toValue: 1,
//           duration: ANIMATION_DURATION,
//           useNativeDriver: true,
//         })
//       ]).start();
//     } else {
//       StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
//       Animated.timing(translateX, {
//         toValue: -DRAWER_WIDTH,
//         duration: ANIMATION_DURATION,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [visible]);

//   const renderMenuItem = (item: (typeof menuItems)[0], index: number) => {
//     const isSectionDivider = index === 3 || index === 6;

//     return (
//       <View key={index}>
//         {isSectionDivider && (
//           <View style={[
//             styles.sectionDivider, 
//             { backgroundColor: isDark ? '#333' : '#f0f0f0' }
//           ]} />
//         )}
//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => handleMenuItemPress(item)}
//           activeOpacity={0.6}
//         >
//           <View style={styles.menuItemContent}>
//             <Ionicons
//               name={item.icon as any}
//               size={24}
//               color={item.danger ? '#ff4d4d' : isDark ? '#a0a0a0' : '#666'}
//               style={styles.icon}
//             />
//             <Text
//               style={[
//                 styles.menuItemText,
//                 {
//                   color: item.danger ? '#ff4d4d' : isDark ? '#f5f5f5' : '#333',
//                 },
//               ]}
//             >
//               {item.title}
//             </Text>
//           </View>
//           <Ionicons
//             name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"}
//             size={20}
//             color={isDark ? '#555' : '#aaa'}
//           />
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   return (
//     <Modal
//       visible={visible}
//       transparent
//       onRequestClose={onClose}
//       statusBarTranslucent={true}
//       animationType="none"
//     >
//       <Animated.View style={[
//         styles.overlay, 
//         { opacity }
//       ]}>
//         {/* Backdrop with fade animation */}
//         <TouchableOpacity 
//           style={styles.backdrop} 
//           activeOpacity={1} 
//           onPress={onClose}
//         />

//         {/* Animated Drawer from Left */}
//         <Animated.View style={[
//           styles.drawer,
//           {
//             transform: [{ translateX }],
//             width: DRAWER_WIDTH,
//             backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
//             borderRightColor: isDark ? '#2a2a2a' : '#e0e0e0',
//             paddingTop: statusBarHeight,
//           }
//         ]}>
//           {/* Header with subtle shadow */}
//           <View style={[
//             styles.header,
//             {
//               borderBottomColor: isDark ? '#2a2a2a' : '#f0f0f0',
//               backgroundColor: isDark ? '#252525' : '#f9f9f9',
//             }
//           ]}>
//             <Text style={[
//               styles.title, 
//               { color: isDark ? '#f5f5f5' : '#222' }
//             ]}>
//               Menu
//             </Text>
//             <TouchableOpacity 
//               onPress={onClose} 
//               style={styles.closeButton}
//               hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
//             >
//               <Ionicons 
//                 name="close" 
//                 size={26} 
//                 color={isDark ? '#a0a0a0' : '#666'} 
//               />
//             </TouchableOpacity>
//           </View>

//           {/* Menu List with optimized rendering */}
//           <ScrollView 
//             style={styles.menuContainer}
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.menuContentContainer}
//           >
//             {menuItems.map(renderMenuItem)}
//           </ScrollView>

//           {/* Footer with app version */}
//           <View style={styles.footer}>
//             <Text style={[
//               styles.versionText,
//               { color: isDark ? '#666' : '#999' }
//             ]}>
//               v1.0.0
//             </Text>
//           </View>
//         </Animated.View>
//       </Animated.View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     flexDirection: 'row',
//   },
//   backdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.6)',
//   },
//   drawer: {
//     position: 'absolute',
//     height: '100%',
//     borderRightWidth: 1,
//     elevation: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 4, height: 0 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 18,
//     paddingHorizontal: 20,
//     borderBottomWidth: 1,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     zIndex: 1,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '700',
//     letterSpacing: 0.5,
//   },
//   closeButton: {
//     padding: 4,
//   },
//   menuContainer: {
//     flex: 1,
//   },
//   menuContentContainer: {
//     paddingBottom: 20,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//   },
//   menuItemContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   icon: {
//     width: 28,
//     textAlign: 'center',
//     marginRight: 16,
//   },
//   menuItemText: {
//     fontSize: 15,
//     fontWeight: '400',
//     letterSpacing: 0.2,
//   },
//   sectionDivider: {
//     height: 8,
//     marginVertical: 8,
//   },
//   footer: {
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   versionText: {
//     fontSize: 13,
//     textAlign: 'center',
//   },
// });

// export default React.memo(DrawerMenu);

import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
  I18nManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import LogoutModal from './LogoutModal';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isLandscape = screenWidth > screenHeight;
const DRAWER_WIDTH = isLandscape ? screenWidth * 0.35 : screenWidth * 0.82;

const ANIMATION_DURATION = 300;

const DrawerMenu: React.FC<DrawerMenuProps> = ({ visible, onClose }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const statusBarHeight = Platform.OS === 'ios'
    ? 50
    : StatusBar.currentHeight
      ? StatusBar.currentHeight + 10
      : 30;

  const menuItems = [
    { icon: 'bar-chart-outline', title: 'My Performance', onPress: () => console.log('Performance pressed') },
    { icon: 'chatbubble-ellipses-outline', title: 'Ask a Doubt', onPress: () => console.log('Ask a Doubt pressed') },
    { icon: 'people-outline', title: 'Community', onPress: () => console.log('Community pressed') },
    { icon: 'share-social-outline', title: 'Share App', onPress: () => console.log('Share pressed') },
    { icon: 'bookmark-outline', title: 'Bookmarks', onPress: () => console.log('Bookmarks pressed') },
    { icon: 'notifications-outline', title: 'Notifications', onPress: () => console.log('Notifications pressed') },
    { icon: 'person-outline', title: 'Profile', onPress: () => console.log('Profile pressed') },
    { icon: 'shield-checkmark-outline', title: 'Privacy Policy', onPress: () => console.log('Privacy Policy pressed') },
    { icon: 'log-out-outline', title: 'Logout', danger: true, onPress: () => setShowLogoutModal(true) },
  ];

  const handleMenuItemPress = (item: typeof menuItems[number]) => {
    // Don't close drawer for logout, just show modal
    if (item.title === 'Logout') {
      item.onPress();
      return;
    }

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
      item.onPress();
    });
  };

  const handleLogoutConfirm = async () => {
    try {
      setShowLogoutModal(false);
      
      // Close the drawer with animation
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        })
      ]).start(async () => {
        onClose();
        
        try {
          // Delete the auth token
          await SecureStore.deleteItemAsync('authToken');
          
          // Navigate to AuthScreen using expo-router
          router.replace('/components/auth/AuthScreen');
        } catch (error) {
          console.error('Error during logout:', error);
          // Still navigate even if token deletion fails
           router.replace('/components/auth/AuthScreen');
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  React.useEffect(() => {
    if (visible) {
      StatusBar.setBarStyle('light-content');
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const renderMenuItem = (item: typeof menuItems[number], index: number) => {
    const showDivider = index === 3 || index === 6;
    return (
      <View key={index}>
        {showDivider && (
          <View style={[
            styles.sectionDivider,
            { backgroundColor: isDark ? '#333' : '#f0f0f0' }
          ]} />
        )}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleMenuItemPress(item)}
          activeOpacity={0.6}
        >
          <View style={styles.menuItemContent}>
            <Ionicons
              name={item.icon as any}
              size={24}
              color={item.danger ? '#ff4d4d' : isDark ? '#a0a0a0' : '#666'}
              style={styles.icon}
            />
            <Text style={[
              styles.menuItemText,
              { color: item.danger ? '#ff4d4d' : isDark ? '#f5f5f5' : '#333' }
            ]}>
              {item.title}
            </Text>
          </View>
          <Ionicons
            name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"}
            size={20}
            color={isDark ? '#555' : '#aaa'}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        onRequestClose={onClose}
        statusBarTranslucent
        animationType="none"
      >
        <Animated.View style={[styles.overlay, { opacity }]}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={onClose}
          />
          <Animated.View style={[
            styles.drawer,
            {
              transform: [{ translateX }],
              width: DRAWER_WIDTH,
              backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
              borderRightColor: isDark ? '#2a2a2a' : '#e0e0e0',
              paddingTop: statusBarHeight,
            }
          ]}>
            <View style={[
              styles.header,
              {
                borderBottomColor: isDark ? '#2a2a2a' : '#f0f0f0',
                backgroundColor: isDark ? '#252525' : '#f9f9f9',
              }
            ]}>
              <Text style={[styles.title, { color: isDark ? '#f5f5f5' : '#222' }]}>
                Menu
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={[
                  styles.closeButton,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    borderRadius: 20,
                    padding: 5,
                  }
                ]}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={isDark ? '#f5f5f5' : '#333'}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.menuContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.menuContentContainer}
            >
              {menuItems.map(renderMenuItem)}
            </ScrollView>

            <View style={styles.footer}>
              <Text style={[
                styles.versionText,
                { color: isDark ? '#666' : '#999' }
              ]}>
                v1.0.0
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      <LogoutModal
        visible={showLogoutModal}
        onCancel={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  drawer: {
    position: 'absolute',
    height: '100%',
    borderRightWidth: 1,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 4,
  },
  menuContainer: {
    flex: 1,
  },
  menuContentContainer: {
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    width: 28,
    textAlign: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  sectionDivider: {
    height: 8,
    marginVertical: 8,
  },
  footer: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  versionText: {
    fontSize: 13,
    textAlign: 'center',
  },
});

export default React.memo(DrawerMenu);