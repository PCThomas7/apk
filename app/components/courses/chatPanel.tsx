import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Message type from backend
type Message = {
  id: string;
  userId: string;
  username: string;
  isAdmin: boolean;
  message: string;
  timestamp: Date;
};

type ChatUser = {
  userId: string;
  username: string;
};

type ChatPanelProps = {
  isChatActive: boolean;
  activeUsers: ChatUser[];
  error: string | null;
  messages: Message[];
  sendMessage: (message: string) => boolean; // ✅ add this
};


const ChatPanel: React.FC<ChatPanelProps> = ({ isChatActive, activeUsers, error, messages , sendMessage}) => {
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (error) console.warn('Socket Error:', error);
  }, [error]);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = () => {
     if (input.trim()) {
    sendMessage(input.trim());
    setInput('');
  }
  };

  const renderItem = ({ item }: { item: Message }) => {
    if (item.userId === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.message}</Text>
        </View>
      );
    }

    const usernameColor = item.username.toLowerCase() === 'support' ? '#FFD700' : '#3ea6ff';

    return (
      <View style={styles.messageRow}>
        <Text style={styles.messageLine}>
          <Text style={[styles.messageUser, { color: usernameColor }]}>{item.username}: </Text>
          <Text style={styles.messageText}>{item.message}</Text>
        </Text>
      </View>
    );
  };

  if (!isChatActive) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.statusRow}>
            <Ionicons name="chatbubbles-outline" size={18} color="#888888" />
            <Text style={styles.statusText}>Chat</Text>
          </View>
        </View>
        <View style={styles.disabledContainer}>
          <Ionicons name="lock-closed" size={33} color="#666666" />
          <Text style={styles.disabledTitle}>Chat is disabled</Text>
          <Text style={styles.disabledSubtitle}>Chat is only available for live classes</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusRow}>
          <Ionicons name="chatbubbles" size={18} color="#ffffff" />
          <Text style={styles.statusText}>Live chat</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.messageList}
        contentContainerStyle={{ paddingBottom: 10 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputBox}
            value={input}
            onChangeText={setInput}
            placeholder="Send a message"
            placeholderTextColor="#AAAAAA"
            multiline={false}
          />
          <TouchableOpacity
            style={[styles.sendButton, { opacity: input.trim() ? 1 : 0.5 }]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0f0f0f',
    overflow: 'hidden',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    borderRightWidth: 1,
    borderRightColor: '#272727',
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#272727',
    backgroundColor: '#212121',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: '#0f0f0f',
  },
  messageRow: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  messageLine: {
    flexWrap: 'wrap',
  },
  messageUser: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#3ea6ff',
  },
  messageText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
  inputContainer: {
    backgroundColor: '#212121',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#272727',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputBox: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderColor: '#3c3c3c',
    borderRadius: 20,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#1f1f1f',
    color: '#ffffff',
  },
  sendButton: {
    width: 38,
    height: 38,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3c3c3c',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  disabledTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  disabledSubtitle: {
    fontSize: 14,
    color: '#aaaaaa',
    textAlign: 'center',
    lineHeight: 20,
  },
  systemMessageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 4,
    borderRadius: 4,
  },
  systemMessageText: {
    fontSize: 13,
    color: '#CCCCCC',
    textAlign: 'center',
  },
});

export default ChatPanel;