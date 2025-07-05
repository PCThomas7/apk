# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

Best Solution: Expo Push Notifications + Periodic Sync
Why This is the Best Approach:
Works offline: Notifications are delivered when device reconnects

App closed/minimized: Handled by OS-level push service

Reliable delivery: Managed by Expo's infrastructure

Low battery impact: No constant connection needed

Alternative Pure React Native Solution (Without Expo)
If you can't use Expo, use react-native-push-notification with FCM/APNs:

{
  "expo": {
    "name": "lms",
    "slug": "lms",
    "version": "1.0.0",
    "orientation": "default",  
    "icon": "./assets/images/icon.png",
    "scheme": "lms",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "requireFullScreen": false, 
      "infoPlist": {
        "UIRequiresFullScreen": false  
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "navigationBar": {
        "visible": "sticky-immersive",
        "backgroundColor": "#FFFFFF"
      },
      "edgeToEdgeEnabled": true,
      "softwareKeyboardLayoutMode": "pan",  
      "windowSoftInputMode": "adjustResize"  
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      "expo-secure-store",
      [
        "expo-screen-orientation",
        {
          "initialOrientation": "DEFAULT" 
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true,
      "tsconfigPaths": true  
    },
    "platforms": ["ios", "android", "web"],
    "extra": {
      "router": {
        "origin": false
      }
    }
  }
}
