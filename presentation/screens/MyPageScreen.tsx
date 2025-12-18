import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Header } from '../components/Header';

// ViewModel & Context
import { useMyPageViewModel } from '../viewmodels/useMyPageViewModel';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';

const { width } = Dimensions.get('window');
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
      style={styles.menuItem}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Text style={[styles.menuText, { color: isLogout ? DESTRUCTIVE_COLOR : '#333' }]}>
        {text}
      </Text>
      <Icon
        name={isLogout ? 'alert-circle-outline' : 'chevron-forward'}
        size={20}
        color={isLogout ? DESTRUCTIVE_COLOR : '#CCC'}
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
  const { showAlert } = useAlert();

  // ViewModel
  const {
    loading,
    profile,
    loadProfile,
    saveProfile,
  } = useMyPageViewModel();

  // 로컬 상태
  const [tempNickname, setTempNickname] = useState('');
  const [tempStateMessage, setTempStateMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [isNicknameEditable, setIsNicknameEditable] = useState(false);

  const inputRef = useRef<TextInput>(null);

  // 1. 화면 포커스 시 데이터 리로드
  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
      setSelectedImage(null);
      setIsNicknameEditable(false);
    }, [])
  );

  // 2. 프로필 로드 시 상태 반영
  useEffect(() => {
    if (profile) {
      setTempNickname(profile.nickname);
      setTempStateMessage(profile.stateMessage || "");
    }
  }, [profile]);

  // 변경 사항 감지 변수
  const hasChanges = (selectedImage !== null) || 
                     (profile && tempNickname !== profile.nickname) ||
                     (profile && tempStateMessage !== (profile.stateMessage || ""));

  /* 저장 버튼 클릭 시 실행 */
  const handleSave = async () => {
    if (!hasChanges) return;

    if (tempNickname.trim().length < 2) {
      showAlert({ title: "알림", message: "닉네임은 2글자 이상이어야 합니다." });
      return;
    }

    const success = await saveProfile(
      tempNickname,
      tempStateMessage,
      selectedImage
    );
  };

  /* 앨범 열기 */
  const handleImageEdit = () => {
    const options = { mediaType: 'photo' as const, selectionLimit: 1 };
    launchImageLibrary(options, (res) => {
      if (res.didCancel) return;
      if (res.errorCode) {
        showAlert({ title: "에러", message: res.errorMessage || "이미지를 불러오는데 실패했습니다." });
        return;
      }
      if (res.assets && res.assets.length > 0) {
        setSelectedImage(res.assets[0]);
      }
    });
  };

  /* 로그아웃 처리 */
  const handleLogout = () => {
    showAlert({
      title: "로그아웃",
      message: "정말 로그아웃 하시겠습니까?",
      showCancel: true,
      onConfirm: logout
    });
  };

  if (loading && !profile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={MAIN_COLOR} />
      </View>
    );
  }

  const displayImage = selectedImage
    ? { uri: selectedImage.uri }
    : (profile?.image ? { uri: profile.image } : { uri: 'https://via.placeholder.com/150/FFF4E6/FFA847?text=No+Image' });

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header title="마이 페이지" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20 }}>
        
        {/* 상태 메시지 */}
        <View style={styles.speechBubbleContainer}>
          <View style={styles.speechBubble}>
            <TextInput
              style={styles.speechBubbleInput}
              value={tempStateMessage}
              onChangeText={setTempStateMessage}
              placeholder="상태 메시지를 입력하세요"
              placeholderTextColor="#999"
              maxLength={30}
              multiline={true}
              blurOnSubmit={true}
            />
          </View>
          <View style={styles.speechBubbleTail} />
        </View>

        {/* 프로필 이미지 */}
        <View style={styles.profileImageContainer}>
          <TouchableOpacity
            style={styles.imageWrapper}
            onPress={handleImageEdit}
            activeOpacity={0.8}
          >
            <Image source={displayImage} style={styles.profileImage} />
            <View style={styles.cameraBadge}>
              <Icon name="camera" size={16} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* 닉네임 / 이메일 */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <TextInput
              ref={inputRef}
              style={[styles.nameInput, !isNicknameEditable && { color: '#333' }]}
              value={tempNickname}
              onChangeText={setTempNickname}
              placeholder="닉네임"
              placeholderTextColor="#CCC"
              editable={isNicknameEditable}
            />
            <TouchableOpacity
              style={styles.editIconContainer}
              onPress={() => {
                setIsNicknameEditable(true);
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
            >
              <Icon name="pencil-outline" size={18} color={MAIN_COLOR} />
            </TouchableOpacity>
          </View>
          <View style={styles.emailRow}>
            <Text style={styles.userEmail}>{profile?.email || ''}</Text>
          </View>
        </View>

        {/* 저장 버튼 - 여백을 대폭 늘림 (40px) */}
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

        {/* 메뉴 섹션 - 여백을 대폭 늘림 (40px) */}
        <MenuSection title="내 활동">
          <MenuItem text="본인 리뷰 작성 조회" onPress={() => navigation.navigate('MyReviewsScreen')} />
          <MenuItem text="맛집 즐겨찾기" onPress={() => navigation.navigate('MyLikesScreen')} />
        </MenuSection>

        <MenuSection title="설정 및 지원">
          <MenuItem text="알림 설정" onPress={() => navigation.navigate('NotificationSetting')} />
          <MenuItem text="고객센터" onPress={() => navigation.navigate('CustomerService')} />
          <MenuItem text="개인정보 처리방침" onPress={() => navigation.navigate('PrivacyPolicy')} />
        </MenuSection>

        <MenuSection title="계정 관리">
          <MenuItem text="비밀번호 변경" onPress={() => navigation.navigate('ChangePassword')} />
          <MenuItem text="로그아웃" onPress={handleLogout} isLogout />
        </MenuSection>

        <TouchableOpacity 
          style={styles.deleteAccountButton} 
          onPress={() => navigation.navigate('DeleteAccount')}
        >
          <Text style={styles.deleteAccountText}>회원 탈퇴</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  saveButton: {
    backgroundColor: MAIN_COLOR,
    marginHorizontal: 40, // 💡 테스트를 위해 40px로 대폭 확대
    marginBottom: 35, 
    height: 56,
    borderRadius: 28, 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: MAIN_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  saveButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  deleteAccountButton: {
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 40,
    padding: 10,
  },
  deleteAccountText: {
    fontSize: 13,
    color: '#BBB',
    textDecorationLine: 'underline',
  },
  speechBubbleContainer: { 
    alignItems: 'center', 
    marginTop: 15, 
    marginBottom: 10,
    marginHorizontal: 40, // 💡 40px 적용
  },
  speechBubble: {
    backgroundColor: '#FFF4E6', 
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20, 
    maxWidth: '90%', 
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speechBubbleInput: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },
  speechBubbleTail: {
    width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid',
    borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 10,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: '#FFF4E6', marginTop: -1, 
  },
  profileImageContainer: { 
    alignItems: 'center', 
    marginTop: 10, 
    marginBottom: 25,
    marginHorizontal: 40, // 💡 40px 적용
  },
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
  infoSection: { 
    marginBottom: 30, 
    alignItems: 'center',
    marginHorizontal: 40, // 💡 40px 적용
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    alignSelf: 'center',
  },
  nameInput: {
    textAlign: 'center',
    height: 40,
    paddingVertical: 0,
    paddingHorizontal: 8,
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
  },
  editIconContainer: { marginLeft: 6, justifyContent: 'center', alignItems: 'center' },
  emailRow: { paddingVertical: 10, alignItems: 'center', width: '100%' },
  userEmail: { fontSize: 15, color: '#999' },
  sectionContainer: { 
    marginBottom: 25,
    marginHorizontal: 40, // 💡 테스트를 위해 40px로 대폭 확대
  },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: '#000', marginBottom: 12 },
  menuItem: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1, 
    borderBottomColor: '#F8F8F8',
  },
  menuText: { fontSize: 17, color: '#333', fontWeight: '500' },
});

export default MyPageScreen;
