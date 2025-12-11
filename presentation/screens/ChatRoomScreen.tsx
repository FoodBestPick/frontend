import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    TextInput,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';

const MAIN_COLOR = '#FFA847';
const GRAY_BG = '#F2F2F2';

const MOCK_MESSAGES = [
    { id: '1', type: 'system', text: '매칭이 성사되었습니다! 맛있는 식사 하세요.', time: '' },
    { id: '2', type: 'user', senderId: 'other1', name: '맛잘알', text: '안녕하세요! 어디서 만날까요?', time: '12:01', avatar: 'https://via.placeholder.com/50/FFCDD2/000000?text=M' },
];

const ChatRoomScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { roomTitle, peopleCount } = route.params || { roomTitle: '채팅방', peopleCount: 4 };

    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            Alert.alert(
                "⏰ 시간 종료",
                "매칭 시간이 종료되어 방이 폭파되었습니다.",
                [
                    {
                        text: "확인",
                        onPress: () => {
                            navigation.dispatch(
                                CommonActions.reset({
                                    index: 0,
                                    routes: [{ name: 'UserMain' }],
                                })
                            );
                        }
                    }
                ],
                { cancelable: false }
            );
        }, 3600000); // 1시간

        return () => clearTimeout(timer);
    }, []);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMsg = {
            id: Date.now().toString(),
            type: 'user',
            senderId: 'me',
            name: '나',
            text: inputText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            avatar: ''
        };
        setMessages([...messages, newMsg]);
        setInputText('');
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const renderItem = ({ item }: { item: any }) => {
        if (item.type === 'system') {
            return (
                <View style={styles.systemMessageContainer}>
                    <Text style={styles.systemMessageText}>{item.text}</Text>
                </View>
            );
        }
        const isMe = item.senderId === 'me';
        return (
            <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
                {!isMe && <Image source={{ uri: item.avatar }} style={styles.avatar} />}
                <View style={styles.bubbleContainer}>
                    {!isMe && <Text style={styles.senderName}>{item.name}</Text>}
                    <View style={{ flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
                            <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
                                {item.text}
                            </Text>
                        </View>
                        <Text style={styles.timeText}>{item.time}</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* 🔥 [수정] 헤더: 햄버거 삭제, 좌우 대칭 맞춤 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>{roomTitle}</Text>
                    <Text style={styles.headerSub}>참여자 {peopleCount}명</Text>
                </View>

                {/* 오른쪽 빈 공간 (타이틀 중앙 정렬용) */}
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.chatList}
                showsVerticalScrollIndicator={false}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style={styles.inputArea}>
                    <TouchableOpacity style={styles.plusBtn}>
                        <Icon name="add" size={24} color="#888" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="메시지를 입력하세요"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                    >
                        <Icon name="arrow-up" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#fff' }} />
        </SafeAreaView>
    );
};

export default ChatRoomScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: '#fff' },
    backBtn: { width: 40 },
    headerCenter: { alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#000' },
    headerSub: { fontSize: 12, color: '#888', marginTop: 2 },
    chatList: { paddingHorizontal: 16, paddingBottom: 20, backgroundColor: '#F7F7F7', flexGrow: 1 },
    systemMessageContainer: { alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.05)', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 14, marginVertical: 16 },
    systemMessageText: { fontSize: 12, color: '#666', textAlign: 'center' },
    messageRow: { flexDirection: 'row', marginBottom: 12 },
    myMessageRow: { justifyContent: 'flex-end' },
    otherMessageRow: { justifyContent: 'flex-start' },
    avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10, backgroundColor: '#EEE' },
    bubbleContainer: { maxWidth: '75%' },
    senderName: { fontSize: 12, color: '#666', marginBottom: 4, marginLeft: 4 },
    bubble: { padding: 12, borderRadius: 16 },
    myBubble: { backgroundColor: MAIN_COLOR, borderTopRightRadius: 2 },
    otherBubble: { backgroundColor: '#FFF', borderTopLeftRadius: 2, borderWidth: 1, borderColor: '#EEE' },
    messageText: { fontSize: 15, lineHeight: 20 },
    myMessageText: { color: '#fff' },
    otherMessageText: { color: '#333' },
    timeText: { fontSize: 10, color: '#AAA', marginHorizontal: 6, marginBottom: 2 },
    inputArea: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EEE' },
    plusBtn: { padding: 8 },
    input: { flex: 1, minHeight: 40, maxHeight: 100, backgroundColor: GRAY_BG, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, marginHorizontal: 10, fontSize: 15, color: '#000' },
    sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: MAIN_COLOR, justifyContent: 'center', alignItems: 'center' },
    sendBtnDisabled: { backgroundColor: '#DDD' },
});