import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import { TouchableOpacity, View, Text, Alert, ActivityIndicator } from 'react-native';
import React from 'react';

export default function AuthOptions({ isLoading, handleGoogleSignIn }) {
    // Configure Google Sign-In (should only run once)
    React.useEffect(() => {
        GoogleSignin.configure({
            scopes: [
                'profile',          // Gets basic profile info
                'email',           // Gets email address
                'openid'          // Gets OpenID information
            ],
            webClientId: '725112630139-rgj27jcug4ggeco8ggujmn415j2ptr39.apps.googleusercontent.com',
            offlineAccess: true, // If you need server-side access
        });
    }, []);

    const handleGoogleSignInPress = async () => {
        if (isLoading) return;

        // setIsLoading(true);
        try {
            // 1. Check if Play Services are available
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // 2. Perform the sign-in
            const response = await GoogleSignin.signIn();

            // 3. Call the parent handler with the relevant data
            handleGoogleSignIn({
                email: response.data.user.email,
                name: response.data.user.name,
                sub: response.data.user.id,
            });

        } catch (error) {
            handleAuthError(error);
        } finally {
        }
    };

    const handleAuthError = (error: any) => {
        switch (error.code) {
            case statusCodes.SIGN_IN_CANCELLED:
                // User cancelled, no need to show alert
                break;
            case statusCodes.IN_PROGRESS:
                console.log('Signin in progress');
                break;
            case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                Alert.alert('Error', 'Google Play services are not available or outdated');
                break;
            default:
                console.log('Google Sign-In Error:', error);
                Alert.alert('Error', 'Unable to sign in with Google');
        }
    };

    return (
        <View style={styles.container}>
            <GoogleSigninButton
                style={styles.googleButton}
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={handleGoogleSignInPress}
                disabled={isLoading}
            />
            {isLoading && <ActivityIndicator style={styles.loader} />}
        </View>
    );
}

const styles = {
    container: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 20,
    },
    googleButton: {
        width: '100%',
        height: 48,
    },
    loader: {
        marginTop: 10,
    },
};
