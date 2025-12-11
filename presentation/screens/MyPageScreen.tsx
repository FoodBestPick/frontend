import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// ViewModel & Context
import { useMyPageViewModel } from '../viewmodels/useMyPageViewModel';
import { useAuth } from '../../context/AuthContext';

const MAIN_COLOR = '#FFA847';
const DESTRUCTIVE_COLOR = '#E53935';

/* 메뉴 아이템 컴포넌트 */
interface MenuItemProps {
  text: string;
  onPress?: () => void;
  isLogout?: boolean;
}

const MenuItem = ({ text, onPress, isLogout = false }: MenuItemProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        {
          backgroundColor: '#fff', // 카드 배경색
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 2,
          borderColor: '#eee', // 테두리 색상
          borderWidth: 1, // 테두리 두께
        },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Text style={[styles.menuText, { color: isLogout ? DESTRUCTIVE_COLOR : '#333' }]}>
        {text}
      </Text>
      <Icon
        name={isLogout ? 'alert-circle-outline' : 'chevron-forward'}
        size={20}
        color={isLogout ? DESTRUCTIVE_COLOR : MAIN_COLOR} // 아이콘 색상을 MAIN_COLOR로 변경
      />
    </TouchableOpacity>
  );
};

/* 섹션 컴포넌트 */
const MenuSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

/* 마이 페이지 화면 */
const MyPageScreen = () => {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();

  // ViewModel
  const {
    loading,
    profile,
    loadProfile,
    saveProfile,
  } = useMyPageViewModel();

  // 로컬 상태
  const [tempNickname, setTempNickname] = useState('');
  const [tempStateMessage, setTempStateMessage] = useState(''); // ✨ 상태 메시지 상태 추가
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const inputRef = useRef<TextInput>(null);

  // 1. 화면 포커스 시 데이터 리로드 & 이미지 선택 초기화
  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
      setSelectedImage(null);
    }, [])
  );

  // 2. 프로필 로드되면 닉네임/상태메시지 세팅
  useEffect(() => {
    if (profile) {
      setTempNickname(profile.nickname);
      setTempStateMessage(profile.stateMessage || ""); // ✨ 상태 메시지 초기화
    }
  }, [profile]);

  // 변경 사항이 있는지 감지
  const hasChanges = (selectedImage !== null) || 
                     (profile && tempNickname !== profile.nickname) ||
                     (profile && tempStateMessage !== (profile.stateMessage || "")); // ✨ 상태 메시지 변경 감지

  /* 저장 버튼 클릭 시 실행 */
  const handleSave = async () => {
    if (!hasChanges) return;

    if (tempNickname.trim().length < 2) {
      Alert.alert("알림", "닉네임은 2글자 이상이어야 합니다.");
      return;
    }

    const success = await saveProfile(
      tempNickname,
      tempStateMessage, // ✨ 수정된 상태 메시지 전달
      selectedImage
    );

    if (success) {
      setSelectedImage(null);
    }
  };

  /* 앨범 열기 */
  const handleImageEdit = () => {
    const options = { mediaType: 'photo' as const, selectionLimit: 1 };

    launchImageLibrary(options, (res) => {
      if (res.didCancel) return;
      if (res.errorCode) {
        Alert.alert("에러", res.errorMessage);
        return;
      }
      if (res.assets && res.assets.length > 0) {
        setSelectedImage(res.assets[0]);
      }
    });
  };

  /* 탈퇴 버튼 로직 (화면 이동) */
  const handleDeleteAccount = () => {
    navigation.navigate('DeleteAccount');
  };

  /* 로그아웃 로직 */
  const handleLogout = () => {
    Alert.alert("로그아웃", "로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "확인", onPress: () => logout() }
    ]);
  };

  // 로딩 중
  if (loading && !profile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={MAIN_COLOR} />
      </View>
    );
  }

  // 화면에 보여줄 이미지 처리
  const displayImage = selectedImage
    ? { uri: selectedImage.uri }
    : (profile?.image ? { uri: profile.image } : { uri: 'https://via.placeholder.com/150/FFF4E6/FFA847?text=No+Image' });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>마이 페이지</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* 상태 메시지 말풍선 (프로필 이미지 위) */}
        <View style={styles.speechBubbleContainer}>
          <View style={styles.speechBubble}>
            <TextInput
              style={styles.speechBubbleInput}
              value={tempStateMessage}
              onChangeText={setTempStateMessage}
              placeholder="상태 메시지를 입력하세요 (최대 30자)"
              placeholderTextColor="#999"
              maxLength={30}
              multiline={true}
              blurOnSubmit={true}
            />
          </View>
          <View style={styles.speechBubbleTail} />
        </View>

        {/* 프로필 이미지 영역 */}
        <View style={styles.profileImageContainer}>
          <TouchableOpacity
            style={styles.imageWrapper}
            onPress={handleImageEdit}
            activeOpacity={0.8}
          >
            <Image source={displayImage} style={styles.profileImage} />
            {/* 카메라 뱃지 */}
            <View style={styles.cameraBadge}>
              <Icon name="camera" size={16} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* 정보 입력 영역 */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <TextInput
              ref={inputRef}
              style={styles.nameInput}
              value={tempNickname}
              onChangeText={setTempNickname}
              placeholder="닉네임"
              placeholderTextColor="#CCC"
            />
            <TouchableOpacity
              style={styles.editIconContainer}
              onPress={() => inputRef.current?.focus()}
            >
              <Icon name="pencil-outline" size={18} color="#444" />
            </TouchableOpacity>
          </View>

          <View style={styles.emailRow}>
            <Text style={styles.userEmail}>{profile?.email || ''}</Text>
          </View>
        </View>

        {/* 변경 사항 저장 버튼 */}
        {hasChanges && (
          <TouchableOpacity
            style={localStyles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={localStyles.saveButtonText}>변경 사항 저장하기</Text>
            )}
          </TouchableOpacity>
        )}

        {/* 메뉴 리스트 - 섹션별 그룹화 */}
        <View style={styles.menuSection}>
          <MenuSection title="내 활동">
            <MenuItem
              text="본인 리뷰 작성 조회"
              onPress={() => navigation.navigate('MyReviewsScreen')}
            />
            <MenuItem
              text="맛집 즐겨찾기"
              onPress={() => navigation.navigate('MyLikesScreen')}
            />
          </MenuSection>

          <MenuSection title="설정 및 지원">
            <MenuItem
              text="알림 설정"
              onPress={() => navigation.navigate('NotificationSetting')}
            />
            <MenuItem
              text="비밀번호 변경"
              onPress={() => navigation.navigate('ChangePassword')}
            />
            <MenuItem text="고객센터" onPress={() => { }} />
            <MenuItem text="개인정보 처리방침" onPress={() => { }} />
          </MenuSection>

          <MenuSection title="계정 관리">
            <MenuItem text="로그아웃" onPress={handleLogout} isLogout />
          </MenuSection>

          {/* 회원 탈퇴 버튼 (하단 분리) */}
          <TouchableOpacity 
            style={styles.deleteAccountButton} 
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteAccountText}>회원 탈퇴</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default MyPageScreen;

// 저장 버튼 스타일만 따로 추가 (제공된 스타일에 없어서 기능 유지를 위해 필요)
const localStyles = StyleSheet.create({
  saveButton: {
    backgroundColor: MAIN_COLOR,
    marginHorizontal: 20,
    marginBottom: 30, // 간격 조정
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

/* -------------------------------------------------------
 * 스타일 (요청하신 고정 스타일)
 * -----------------------------------------------------*/
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  
  /* ... 기존 스타일 ... */

  /* 회원 탈퇴 버튼 스타일 추가 */
  deleteAccountButton: {
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
    padding: 10,
  },
  deleteAccountText: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'underline',
  },

  header: { height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },

  scrollContent: { paddingBottom: 0, paddingHorizontal: 16 }, // 하단 여백을 0으로 줄임
  
  // 말풍선 스타일
  speechBubbleContainer: { alignItems: 'center', marginTop: 20, marginBottom: 5 },
  speechBubble: {
    backgroundColor: '#FFF4E6', // 연한 MAIN_COLOR 배경
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    maxWidth: '80%', // 최대 너비 제한
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  speechBubbleInput: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },
  speechBubbleTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFF4E6', // 말풍선 배경색과 동일
    marginTop: -1, // 말풍선과 꼬리 연결
  },

  profileImageContainer: { alignItems: 'center', marginTop: 5, marginBottom: 30 }, // marginTop 조정
  imageWrapper: {
    width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: MAIN_COLOR, padding: 4,
    justifyContent: 'center', alignItems: 'center', position: 'relative',
  },
  profileImage: { width: '100%', height: '100%', borderRadius: 55, backgroundColor: '#FFF4E6' },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0, backgroundColor: MAIN_COLOR,
    width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },

  infoSection: { paddingHorizontal: 0, marginBottom: 30 },
  nameRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: MAIN_COLOR,
  },

  userName: { fontSize: 17, fontWeight: '700', color: '#000' },

  nameInput: {
    flex: 1,
    height: 30, // 높이 약간 조정
    borderBottomWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginRight: 10,
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },

  editIconContainer: { width: 24, justifyContent: 'center', alignItems: 'flex-end' },

  emailRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: MAIN_COLOR },
  userEmail: { fontSize: 14, color: '#999' },

  menuSection: { paddingHorizontal: 0, marginTop: 20 },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12, // 버튼 높이 줄임
    paddingHorizontal: 20, // MenuItem 자체에 가로 패딩 추가
    marginBottom: 10, // 카드 간 간격
    // borderBottomWidth: 1, // 기존 라인 삭제
    // borderBottomColor: MAIN_COLOR, // 기존 라인 삭제
  },
  menuText: { fontSize: 15, color: '#000', fontWeight: '500' },

  /* 섹션 스타일 추가 */
  sectionContainer: { marginBottom: 0 }, // 섹션 간 하단 여백 제거
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10, marginLeft: 4 },
});