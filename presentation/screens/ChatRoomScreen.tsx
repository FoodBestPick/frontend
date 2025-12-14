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
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useChatViewModel } from "../../presentation/viewmodels/ChatViewModel";
import { useAuth } from "../../context/AuthContext";
import { launchImageLibrary } from 'react-native-image-picker';
import { ChatRepositoryImpl } from '../../data/repositoriesImpl/ChatRepositoryImpl';

const MAIN_COLOR = '#FFA847';
const GRAY_BG = '#F2F2F2';

const ChatRoomScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { roomId, roomTitle = "채팅방", peopleCount = 0 } = route.params;

    const { currentUserId, token, checkActiveRoom } = useAuth();
    const { messages, sendMessage } = useChatViewModel(roomId);

    const [inputText, setInputText] = useState('');
    const [uploading, setUploading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    /* 메시지 변경 시 자동 스크롤 */
    useEffect(() => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        sendMessage(inputText);
        setInputText('');
    };

    const handleImagePick = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
        });

        if (result.didCancel || !result.assets || result.assets.length === 0) return;

        const asset = result.assets[0];
        if (!token) return;

        setUploading(true);
        try {
            const uploadedUrl = await ChatRepositoryImpl.uploadImage(token, {
                uri: asset.uri,
                type: asset.type,
                fileName: asset.fileName,
            });

            if (uploadedUrl) {
                sendMessage(uploadedUrl); // URL 전송
            } else {
                Alert.alert("업로드 실패", "이미지 업로드 중 오류가 발생했습니다.");
            }
        } catch (e) {
            console.error(e);
            Alert.alert("오류", "이미지 전송 실패");
        } finally {
            setUploading(false);
        }
    };

    const handleLeave = () => {
        Alert.alert(
            "채팅방 나가기",
            "현재 나가기 기능은 서버 미지원으로, 화면만 닫힙니다. (방은 유지됨)",
            [
                { text: "취소", style: "cancel" },
                { 
                    text: "나가기", 
                    style: "destructive",
                    onPress: () => {
                        navigation.goBack();
                        checkActiveRoom(); // 상태 갱신 시도
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => {
        const isMe = item.senderId === currentUserId;
        const isImage = item.content.startsWith("http"); // 간단한 URL 체크

        return (
            <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
                {!isMe && item.senderAvatar && (
                    <Image source={{ uri: item.senderAvatar }} style={styles.avatar} />
                )}

                <View style={styles.bubbleContainer}>
                    {!isMe && item.senderName && <Text style={styles.senderName}>{item.senderName}</Text>}

                    <View style={{ flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble, isImage && { padding: 0, backgroundColor: 'transparent', borderWidth: 0 }]}>
                            {isImage ? (
                                <Image 
                                    source={{ uri: item.content }} 
                                    style={{ width: 200, height: 200, borderRadius: 10 }} 
                                    resizeMode="cover"
                                />
                            ) : (
                                <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
                                    {item.content}
                                </Text>
                            )}
                        </View>

                        <Text style={styles.timeText}>{item.formattedTime}</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>{roomTitle}</Text>
                    {peopleCount > 0 && <Text style={styles.headerSub}>참여자 {peopleCount}명</Text>}
                </View>

                {/* 나가기 버튼 */}
                <TouchableOpacity onPress={handleLeave} style={styles.backBtn}>
                    <Icon name="exit-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
            </View>

            {/* 메시지 리스트 */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(_, idx) => idx.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.chatList}
                showsVerticalScrollIndicator={false}
            />

            {/* 입력창 */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                <View style={styles.inputArea}>
                    <TouchableOpacity style={styles.plusBtn} onPress={handleImagePick} disabled={uploading}>
                        {uploading ? <ActivityIndicator size="small" color={MAIN_COLOR} /> : <Icon name="add" size={24} color="#888" />}
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
    chatList: { paddingHorizontal: 16, paddingBottom: 20, paddingTop: 20, backgroundColor: '#F7F7F7', flexGrow: 1 },

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
