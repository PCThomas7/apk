// import { Tabs } from 'expo-router';
// import React from 'react';
// import { Platform } from 'react-native';
// import { HapticTab } from '@/components/HapticTab';
// import { Ionicons } from '@expo/vector-icons';
// import { Colors } from '@/constants/Colors';
// import { useColorScheme } from '@/hooks/useColorScheme';
// import { useWindowDimensions, StyleSheet } from 'react-native';
// import { StatusBar } from 'expo-status-bar';
// import { SafeAreaView } from 'react-native-safe-area-context';

// export default function TabLayout() {
//   const colorScheme = useColorScheme();
//   const { width, height } = useWindowDimensions();
//   const isLandscape = width > height;
//   const isAndroid = Platform.OS === 'android';

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'bottom']}>
//       <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
//       <Tabs
//         screenOptions={{
//            tabBarActiveTintColor: '#6366F1', // Indigo color for focused icon + label
//           tabBarInactiveTintColor: '#888',
//           headerShown: false,
//           tabBarButton: HapticTab,
//           tabBarStyle: {
//             height: isLandscape ? 50 : 70,
//             paddingBottom: isAndroid ? (isLandscape ? 0 : 4) : (isLandscape ? 0 : 16),
//             paddingTop: 8,
//             borderTopWidth: 0,
//             backgroundColor: '#fff', // Pure white background
//             borderTopColor: 'transparent',
//             elevation: 0,
//             shadowOpacity: 0,
//           },
//           tabBarLabelStyle: {
//             fontSize: isLandscape ? 10 : 12,
//             marginBottom: isLandscape ? 0 : 4,
//             fontWeight: '500',
//           },
//           tabBarItemStyle: {
//             marginHorizontal: isLandscape ? 2 : 4,
//             height: isLandscape ? 50 : 60,
//             justifyContent: 'center',
//             alignItems: 'center',
//           },
//         }}>

//         <Tabs.Screen
//           name="index"
//           options={{
//             title: 'Home',
//             tabBarIcon: ({ color, focused }) => (
//               <Ionicons
//                 name={focused ? 'home' : 'home-outline'}
//                 size={isLandscape ? 22 : 24}
//                 color={color}
//               />
//             ),
//           }}
//         />

//         <Tabs.Screen
//           name="explore"
//           options={{
//             title: 'Quizzes',
//             tabBarIcon: ({ color, focused }) => (
//               <Ionicons
//                 name={focused ? 'help-circle' : 'help-circle-outline'}
//                 size={isLandscape ? 22 : 24}
//                 color={color}
//               />
//             ),
//           }}
//         />

//         <Tabs.Screen
//           name="courses"
//           options={{
//             title: 'Courses',
//             tabBarIcon: ({ color, focused }) => (
//               <Ionicons
//                 name={focused ? 'book' : 'book-outline'}
//                 size={isLandscape ? 22 : 24}
//                 color={color}
//               />
//             ),
//           }}
//         />

//         <Tabs.Screen
//           name="more"
//           options={{
//             title: 'Menu',
//             tabBarIcon: ({ color, focused }) => (
//               <Ionicons
//                 name={focused ? 'menu' : 'menu-outline'}
//                 size={isLandscape ? 22 : 24}
//                 color={color}
//               />
//             ),
//           }}
//         />
//       </Tabs>
//     </SafeAreaView>
//   );
// }

import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { HapticTab } from '../components/HapticTab';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import DrawerMenu from '../components/DrawerMenu';
import { EventRegister } from 'react-native-event-listeners';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

const MenuTabButton = ({ children, style }: BottomTabBarButtonProps) => {
  return (
    <TouchableOpacity
      style={[style, { justifyContent: 'center', alignItems: 'center' }]}
      onPress={() => EventRegister.emit('toggleMenu')}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isAndroid = Platform.OS === 'android';
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const listener = EventRegister.addEventListener('toggleMenu', () => {
      setDrawerVisible((prev) => !prev);
    });

    return () => {
      // Cast to any if needed to suppress TS error
      (EventRegister.removeEventListener as any)(listener);
    };
  }, []);



  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'bottom', 'left', 'right']}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#6366F1',
            tabBarInactiveTintColor: '#888',
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarStyle: {
              height: isLandscape ? 50 : 70,
              paddingBottom: isAndroid ? (isLandscape ? 0 : 4) : (isLandscape ? 0 : 16),
              paddingTop: 8,
              borderTopWidth: 0,
              backgroundColor: '#fff',
              borderTopColor: 'transparent',
              elevation: 0,
              shadowOpacity: 0,
            },
            tabBarLabelStyle: {
              fontSize: isLandscape ? 10 : 12,
              marginBottom: isLandscape ? 0 : 4,
              fontWeight: '500',
            },
            tabBarItemStyle: {
              marginHorizontal: isLandscape ? 2 : 4,
              height: isLandscape ? 50 : 60,
              justifyContent: 'center',
              alignItems: 'center',
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'home' : 'home-outline'} size={isLandscape ? 22 : 24} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="quizzes"
            options={{
              title: 'Quizzes',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'help-circle' : 'help-circle-outline'} size={isLandscape ? 22 : 24} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="courses"
            options={{
              title: 'Courses',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'book' : 'book-outline'} size={isLandscape ? 22 : 24} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="more"
            options={{
              title: 'Menu',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'menu' : 'menu-outline'} size={isLandscape ? 22 : 24} color={color} />
              ),
              tabBarButton: (props) => <MenuTabButton {...props} />,
            }}
          />
        </Tabs>
      </SafeAreaView>

      {/* Render Drawer Outside SafeAreaView so it overlays all tabs */}
      <DrawerMenu visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </>
  );
}



