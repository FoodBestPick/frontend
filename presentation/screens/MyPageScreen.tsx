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

import { useNavigation } from '@react-navigation/native';
import { useAuth } from "../../context/AuthContext";   // 🔥 추가: AuthContext

const MAIN_COLOR = '#FFA847';
const DESTRUCTIVE_COLOR = '#E53935';


// Mock 중복 체크 함수
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

/* -------------------------------------------------------
 * 🔥 로그아웃 기능 포함된 MenuItem 컴포넌트
 * -----------------------------------------------------*/
const MenuItem = ({ text, onPress, isLogout = false }: MenuItemProps) => {
  const navigation = useNavigation<any>();
  const { logout } = useAuth(); // 🔥 AuthContext 사용

  // 로그아웃 처리
  const handleLogout = () => {
    Alert.alert(
      "로그아웃",
      "정말 로그아웃 하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "확인",
          onPress: async () => {
            console.log("--- User Logged Out ---");
            await logout();  // 🔥 자동로그인 토큰 삭제 + isLoggedIn=false 전환
            // ❗ navigation.reset 필요 없음 (AuthContext가 네비 자동 변경)
          }
        }
      ]
    );
  };

  const handlePress = isLogout ? handleLogout : onPress;

  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={handlePress}>
      <Text style={[styles.menuText, { color: isLogout ? DESTRUCTIVE_COLOR : '#000' }]}>
        {text}
      </Text>
      <Icon
        name={isLogout ? 'log-out-outline' : 'chevron-forward'}
        size={20}
        color={isLogout ? DESTRUCTIVE_COLOR : '#CCC'}
      />
    </TouchableOpacity>
  );
};


/* -------------------------------------------------------
 * 🔥 MyPageScreen (전체)
 * -----------------------------------------------------*/
const MyPageScreen = () => {
  const navigation = useNavigation<any>();

  const [savedUsername, setSavedUsername] = useState('abcdefg');
  const [tempUsername, setTempUsername] = useState('abcdefg');
  const [isEditing, setIsEditing] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const inputRef = useRef<TextInput>(null);

  // 프로필 이미지 (Mock)
  const [profileImage, setProfileImage] = useState<string>(
    'https://via.placeholder.com/150/FFF4E6/FFA847?text=Snowman'
  );

  /* 🔥 Debounce 닉네임 중복 체크 */
  useEffect(() => {
    if (tempUsername === savedUsername || !tempUsername.trim()) {
      setIsValid(true);
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    setIsValid(false);

    const timeout = setTimeout(async () => {
      const isUnique = await checkUsernameDuplication(tempUsername);

      if (!isUnique) {
        Alert.alert("닉네임 중복", `"${tempUsername}"는 이미 사용 중입니다.`);
      }

      setIsValid(isUnique);
      setIsChecking(false);
    }, 800);

    return () => clearTimeout(timeout);
  }, [tempUsername]);

  /* 🔥 닉네임 저장 */
  const handleSave = () => {
    if (isChecking || !isValid) {
      setIsEditing(false);
      return;
    }

    if (tempUsername.trim() !== savedUsername) {
      setSavedUsername(tempUsername.trim());
      Alert.alert("변경 완료", "닉네임이 변경되었습니다.");
    }

    setIsEditing(false);
  };

  /* 🔥 프로필 이미지 변경 */
  const handleImageEdit = () => {
    Alert.alert("프로필 사진 변경", "앨범에서 사진을 선택하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "선택하기",
        onPress: async () => {
          const res = await launchImageLibrary({ mediaType: "photo" });
          if (res.assets && res.assets[0]?.uri) {
            setProfileImage(res.assets[0].uri);
          }
        }
      }
    ]);
  };

  /* 🔥 닉네임 옆 아이콘 출력 */
  const renderEditIcon = () => {
    if (isChecking) return <ActivityIndicator size="small" color={MAIN_COLOR} />;

    if (tempUsername.trim() !== savedUsername && isValid && !isChecking) {
      return (
        <TouchableOpacity onPress={handleSave}>
          <Icon name="checkmark-circle-outline" size={22} color="#00C853" />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => {
          if (!isEditing) {
            setIsEditing(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
      >
        <Icon name="pencil-outline" size={18} color="#444" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>마이 페이지</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* 프로필 이미지 */}
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

        {/* 유저 정보 */}
        <View style={styles.infoSection}>
          {/* 닉네임 */}
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
            />

            <View style={styles.editIconContainer}>
              {renderEditIcon()}
            </View>
          </View>

          {/* 닉네임 경고 */}
          {tempUsername.trim() !== savedUsername && !isValid && !isChecking && (
            <Text style={styles.warningText}>사용할 수 없는 닉네임입니다.</Text>
          )}

          {/* 이메일 */}
          <View style={styles.emailRow}>
            <Text style={styles.userEmail}>abcdefg@email.com
            </Text>
          </View>
        </View>

        {/* 메뉴 */}
        <View style={styles.menuSection}>
          <MenuItem 
            text="본인 리뷰 작성 조회" 
            onPress={() => navigation.navigate('MyReviewsScreen')} 
          />
          <MenuItem 
            text="맛집 즐겨찾기" 
            onPress={() => navigation.navigate('MyLikesScreen')} 
          />
          <MenuItem text="알림 설정" />
          <MenuItem text="고객센터" />
          <MenuItem text="앱 버전 정보" />
          <MenuItem text="개인정보 처리방침" />
          <MenuItem text="서비스 이용약관" />

          {/* 🔥 로그아웃 버튼 */}
          <MenuItem text="로그아웃" isLogout />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default MyPageScreen;


/* -------------------------------------------------------
 * 스타일
 * -----------------------------------------------------*/
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
  profileImage: { width: '100%', height: '100%', borderRadius: 55, backgroundColor: '#FFF4E6' },
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

  editIconContainer: { width: 24, justifyContent: 'center', alignItems: 'flex-end' },

  warningText: { color: DESTRUCTIVE_COLOR, fontSize: 12, marginTop: 5 },

  inputError: { color: DESTRUCTIVE_COLOR },

  emailRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: MAIN_COLOR },
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
