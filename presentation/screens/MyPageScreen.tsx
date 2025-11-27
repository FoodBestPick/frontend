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

// 🔥 [수정] Navigation 및 CommonActions Import
import { useNavigation, CommonActions } from '@react-navigation/native';

const MAIN_COLOR = '#FFA847';
const DESTRUCTIVE_COLOR = '#E53935';

// Mock 중복 체크 함수 (기존 유지)
const checkUsernameDuplication = async (username: string): Promise<boolean> => {
  if (username.trim().length < 2) return false;
  const reservedNames = ['test', 'gounn'];
  return !reservedNames.includes(username.toLowerCase());
};


interface MenuItemProps {
  text: string;
  onPress?: () => void;
  isLogout?: boolean;
}

const MenuItem = ({ text, onPress, isLogout = false }: MenuItemProps) => {
  const iconColor = isLogout ? DESTRUCTIVE_COLOR : '#CCC';
  const textColor = isLogout ? DESTRUCTIVE_COLOR : styles.menuText.color;

  // 🔥 Navigation hook은 MyPageScreen에서 가져오고, 여기서는 함수만 정의
  const navigation = useNavigation<any>();

  const handleLogout = () => {
    Alert.alert(
      "로그아웃 확인",
      "정말 로그아웃 하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "확인",
          onPress: () => {
            console.log('--- User Logged Out ---');
            // 1. 사용자 데이터 및 토큰 삭제 로직 (AsyncStorage.clear() 등)

            // 2. 스택 초기화 후 로그인 화면으로 이동
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }], // Login은 Stack Navigator에 등록된 이름이어야 함
              })
            );
          }
        }
      ]
    );
  };


  const handlePress = isLogout
    ? handleLogout
    : (onPress || (() => console.log(`Navigating to ${text}`)));

  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={handlePress}>
      <Text style={[styles.menuText, { color: textColor }]}>{text}</Text>
      <Icon
        name={isLogout ? 'log-out-outline' : 'chevron-forward'}
        size={20}
        color={iconColor}
        style={isLogout && { marginRight: -2 }}
      />
    </TouchableOpacity>
  );
};


const MyPageScreen = () => {
  const [savedUsername, setSavedUsername] = useState('abcdefg');
  const [tempUsername, setTempUsername] = useState('abcdefg');
  const [isEditing, setIsEditing] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const inputRef = useRef<TextInput>(null);

  // 🔥 Navigation hook은 여기에 정의 (컴포넌트 스코프)
  const navigation = useNavigation<any>();

  // Debounce 및 유효성 검사 로직 (기존 유지)
  useEffect(() => {
    if (tempUsername === savedUsername || !tempUsername.trim()) {
      setIsValid(true);
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    setIsValid(false);

    const delayDebounceFn = setTimeout(async () => {
      const isUnique = await checkUsernameDuplication(tempUsername);

      if (!isUnique) {
        Alert.alert("닉네임 중복", `"${tempUsername}"는 이미 사용 중이거나 너무 짧습니다.`);
      }

      setIsValid(isUnique);
      setIsChecking(false);
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [tempUsername]);

  // 저장 로직 (onBlur 시 실행)
  const handleSave = () => {
    if (isChecking || !isValid) {
      setIsEditing(false);
      return;
    }

    if (tempUsername.trim() !== savedUsername) {
      setSavedUsername(tempUsername.trim());
      setIsEditing(false);
      Alert.alert("저장 완료", `닉네임이 "${tempUsername.trim()}"으로 변경되었습니다.`);
    } else {
      setIsEditing(false);
    }
  };

  // 프로필 이미지 로직 (기존 유지)
  const [profileImage, setProfileImage] = useState<string>(
    'https://via.placeholder.com/150/FFF4E6/FFA847?text=Snowman'
  );

  const handleImageEdit = () => {
    Alert.alert("프로필 사진 변경", "앨범에서 사진을 선택하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "선택하기",
        onPress: async () => {
          // launchImageLibrary 로직
        }
      }
    ]);
  };


  const renderEditIcon = () => {
    let iconColor = '#000';

    if (isChecking) {
      return <ActivityIndicator size="small" color={MAIN_COLOR} />;
    }

    if (tempUsername.trim() !== savedUsername && isValid && !isChecking) {
      return (
        <TouchableOpacity onPress={handleSave}>
          <Icon name="pencil-outline" size={20} color="#00C853" />
        </TouchableOpacity>
      );
    }

    if (tempUsername.trim() !== savedUsername && !isValid) {
      iconColor = DESTRUCTIVE_COLOR;
    }

    return (
      <TouchableOpacity onPress={() => {
        if (!isEditing) {
          setIsEditing(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }
      }}>
        <Icon name="pencil-outline" size={18} color={iconColor} />
      </TouchableOpacity>
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>마이 페이지</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.profileImageContainer}>
          <TouchableOpacity
            style={styles.imageWrapper}
            onPress={handleImageEdit}
            activeOpacity={0.8}
          >
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
            <View style={styles.cameraBadge}>
              <Icon name="camera" size={14} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* 유저 정보 섹션 */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <TextInput
              ref={inputRef}
              style={[
                styles.userName,
                styles.nameInput,
                (tempUsername !== savedUsername && !isValid && !isChecking) && styles.inputError
              ]}
              value={tempUsername}
              onChangeText={setTempUsername}
              onFocus={() => setIsEditing(true)}
              onBlur={handleSave}
              editable={isEditing}
              placeholder="닉네임"
            />

            <View style={styles.editIconContainer}>
              {renderEditIcon()}
            </View>
          </View>

          {/* 유효성 경고 메시지 */}
          {tempUsername.trim() !== savedUsername && !isValid && !isChecking && (
            <Text style={styles.warningText}>사용할 수 없는 닉네임입니다.</Text>
          )}

          <View style={styles.emailRow}>
            <Text style={styles.userEmail}>abcdefg@email.com</Text>
          </View>
        </View>

        {/* 메뉴 리스트 */}
        <View style={styles.menuSection}>
          <MenuItem text="본인 리뷰 작성 조회" />
          <MenuItem text="맛집 즐겨찾기" />
          <MenuItem text="알림 설정" />
          <MenuItem text="고객센터" />
          <MenuItem text="앱 버전 정보" />
          <MenuItem text="개인정보 처리방침" />
          <MenuItem text="서비스 이용약관" />

          <MenuItem text="로그아웃" isLogout={true} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};


export default MyPageScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: { height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },

  scrollContent: { paddingBottom: 80 },

  profileImageContainer: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  imageWrapper: {
    width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: MAIN_COLOR, padding: 4,
    justifyContent: 'center', alignItems: 'center', position: 'relative',
  },
  profileImage: { width: '100%', height: '100%', borderRadius: 50, backgroundColor: '#FFF4E6' },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0, backgroundColor: MAIN_COLOR,
    width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },

  infoSection: { paddingHorizontal: 20, marginBottom: 30 },
  nameRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: MAIN_COLOR,
  },
  userName: { fontSize: 17, fontWeight: '700', color: '#000' },
  // Input Style
  nameInput: {
    flex: 1,
    height: 24,
    borderBottomWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginRight: 10,
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  editIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  warningText: {
    color: DESTRUCTIVE_COLOR,
    fontSize: 12,
    marginTop: 5,
  },
  inputError: {
    color: DESTRUCTIVE_COLOR,
  },
  emailRow: {
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: MAIN_COLOR,
  },
  userEmail: { fontSize: 14, color: '#999' },

  menuSection: { paddingHorizontal: 20 },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: MAIN_COLOR,
  },
  menuText: { fontSize: 15, color: '#000', fontWeight: '500' },
});