import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
} from 'react-native';

const googleIcon = require('../../assets/images/google-icon.png');

const DividerWithText = () => (
    <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>Or continue with</Text>
        <View style={styles.line} />
    </View>
);

const GoogleSignInButton = ({
    onPress,
    isLoading,
}: {
    onPress: () => void;
    isLoading: boolean;
}) => (
    <TouchableOpacity
        style={[styles.button, isLoading && styles.disabledButton]}
        onPress={onPress}
        disabled={isLoading}
        activeOpacity={0.8}
    >
        {isLoading ? (
            <ActivityIndicator color="#888" />
        ) : (
            <>
                <Image source={googleIcon} style={styles.googleIcon} />
                <Text style={styles.buttonText}>Sign in with Google</Text>
            </>
        )}
    </TouchableOpacity>
);

const AuthOptions = ({
    isLoading,
    handleGoogleSignIn,
}: {
    isLoading: boolean;
    handleGoogleSignIn: () => void;
}) => (
    <View style={styles.container}>
        <DividerWithText />

        <View style={styles.buttonWrapper}>
            <GoogleSignInButton isLoading={isLoading} onPress={handleGoogleSignIn} />
        </View>
    </View>
);

export default AuthOptions;

const styles = StyleSheet.create({
    container: {
        marginBottom:10,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#d1d5db',
    },
    dividerText: {
        marginHorizontal: 8,
        paddingHorizontal: 4,
        backgroundColor: '#f3f4f6',
        color: '#6b7280',
        fontSize: 12,
    },
    buttonWrapper: {
        marginTop: 10,
        marginBottom:10,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderColor: '#d1d5db',
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 24,
    },
    disabledButton: {
        opacity: 0.6,
    },
    googleIcon: {
        width: 24,
        height: 24,
        marginRight: 8,
        resizeMode: 'contain',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1f2937',
    },
});
