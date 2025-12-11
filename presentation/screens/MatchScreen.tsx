import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const AppLogo = require('../../assets/logo.png');

const { width } = Dimensions.get('window');
const MAIN_COLOR = '#FFA847';

// 🔥 [FIX] 1. 채팅방 데이터 타입 정의 (빈 배열일 때도 타입을 알 수 있도록 함)
interface ChatItem {
  id: string;
  title: string;
  peopleCount: number;
  status: string;
  time: string;
}

// 🔥 [FIX] 2. 목업 데이터에 타입 명시 (이제 안의 내용을 다 지워도 에러 안 남)
const MY_ACTIVE_CHATS: ChatItem[] = [
  //{ id: '1', title: '홍대 쉑쉑버거 팟', peopleCount: 4, status: '식사 중', time: '42분 남음' },
  //{ id: '2', title: '식사 후 탕후루', peopleCount: 2, status: '모집 중', time: '58분 남음' },
];

const MatchingScreen = () => {
  const navigation = useNavigation<any>();
  const [isChatListVisible, setIsChatListVisible] = useState(false);

  // 매칭 조건 설정으로 이동
  const handleStartMatch = () => {
    navigation.navigate("MatchingSetupScreen" as never);
  };

  // FAB 클릭 -> 팝업 열기
  const handleFabPress = () => {
    setIsChatListVisible(true);
  };

  // 채팅방 입장
  const enterChatRoom = (chat: ChatItem) => {
    setIsChatListVisible(false);
    navigation.navigate("ChatRoomScreen", {
      roomTitle: chat.title,
      peopleCount: chat.peopleCount
    });
  };

  // 🔥 [FIX] 3. 렌더 함수에서 추론 대신 명시된 타입(ChatItem) 사용
  const renderChatItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => enterChatRoom(item)}
      activeOpacity={0.7}
    >
      <View style={styles.chatInfo}>
        <Text style={styles.chatTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.chatSub}>
          <Text style={{ color: MAIN_COLOR, fontWeight: 'bold' }}>{item.time}</Text> · {item.peopleCount}명
        </Text>
      </View>
      <Icon name="chevron-forward" size={16} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>매칭하기</Text>
      </View>

      <View style={styles.mainContent}>
        <Image source={AppLogo} style={styles.appLogo} resizeMode="contain" />

        <Text style={styles.sloganTitle}>
          함께 맛있는 음식을 나눌 팀원 모집!
        </Text>
        <Text style={styles.sloganSubtitle}>
          원하는 메뉴, 인원, 시간을 설정하고 매칭을 시작하세요.
        </Text>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleStartMatch}
          activeOpacity={0.9}
        >
          <Icon name="search-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.ctaButtonText}>매칭 시작</Text>
        </TouchableOpacity>
      </View>

      {/* FAB 버튼 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleFabPress}
        activeOpacity={0.9}
      >
        <Icon name="chatbubbles-outline" size={28} color="#fff" />
        {/* 뱃지 */}
        {MY_ACTIVE_CHATS.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{MY_ACTIVE_CHATS.length}</Text>
          </View>
        )}
      </TouchableOpacity>


      {/* 🔥 [팝업 리스트] FAB 바로 위에 뜸 */}
      <Modal
        transparent={true}
        visible={isChatListVisible}
        animationType="fade"
        onRequestClose={() => setIsChatListVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsChatListVisible(false)}
        >
          <TouchableWithoutFeedback>
            {/* 형님이 주신 스타일 적용된 팝업 컨테이너 */}
            <View style={styles.popupContainer}>

              {/* 팝업 헤더 */}
              <View style={styles.popupHeader}>
                <Text style={styles.popupTitle}>내 채팅방 ({MY_ACTIVE_CHATS.length})</Text>
              </View>

              {/* 채팅방 리스트 */}
              {MY_ACTIVE_CHATS.length > 0 ? (
                <FlatList
                  data={MY_ACTIVE_CHATS}
                  keyExtractor={item => item.id}
                  renderItem={renderChatItem}
                  style={{ maxHeight: 200 }}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>참여 중인 방이 없습니다.</Text>
                </View>
              )}

              {/* 말풍선 꼬리 (Triangle) */}
              <View style={styles.triangle} />
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

export default MatchingScreen;

// 🔥 형님이 주신 스타일 그대로 적용
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { height: 50, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },

  mainContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, paddingBottom: 100 },
  appLogo: { width: width * 0.6, height: width * 0.6 * (220 / 300), marginBottom: 30 },
  sloganTitle: { fontSize: 19, fontWeight: '800', color: '#333', marginBottom: 8, textAlign: 'center' },
  sloganSubtitle: { fontSize: 14, color: '#666', marginBottom: 40, textAlign: 'center' },

  ctaButton: { flexDirection: 'row', backgroundColor: MAIN_COLOR, paddingHorizontal: 35, paddingVertical: 14, borderRadius: 12, alignItems: 'center', shadowColor: MAIN_COLOR, },
  ctaButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },

  fab: { position: 'absolute', bottom: 35, right: 27, width: 56, height: 56, borderRadius: 28, backgroundColor: MAIN_COLOR, justifyContent: 'center', alignItems: 'center', },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#FF3B30', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  // 🔥 [팝업 스타일] FAB 위에 뜨는 리스트
  modalOverlay: { flex: 1, backgroundColor: 'transparent' }, // 배경 투명

  popupContainer: {
    position: 'absolute',
    bottom: 155, // FAB(35) + FAB높이(56) + 여백
    right: 20,
    width: 250,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,

    // 진한 그림자 (팝업 느낌)
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  popupHeader: {
    paddingHorizontal: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    marginBottom: 5,
  },
  popupTitle: { fontSize: 14, fontWeight: 'bold', color: MAIN_COLOR },

  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#FAFAFA'
  },
  chatInfo: { flex: 1 },
  chatTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 2 },
  chatSub: { fontSize: 11, color: '#888' },

  emptyState: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 13 },

  // 말풍선 꼬리 (Optional)
  triangle: {
    position: 'absolute',
    bottom: -10,
    right: 20,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff', // 팝업 배경색과 동일
    // 그림자 없음 (자연스럽게 연결)
  },
});