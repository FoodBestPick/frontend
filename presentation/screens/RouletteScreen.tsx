import React, { useRef, useState, useMemo, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get("window");
const WHEEL_SIZE = width * 0.8;
const MAIN_COLOR = '#FFA847';

const CATEGORIES = [
  "한식", "중식", "일식", "양식", "분식", "야식", "카페", "아시안"
];

const DEFAULT_MENUS = [
  "치킨", "피자", "삼겹살", "떡볶이", "마라탕", "초밥", "햄버거", "국밥", "파스타", "족발"
];

const MIN_ITEMS = 2;
const MAX_ITEMS = 12;

// 메모이제이션된 모달 (코드는 유지)
interface EditModalProps {
  isVisible: boolean;
  onClose: () => void;
  userMenus: string[];
  setUserMenus: React.Dispatch<React.SetStateAction<string[]>>;
}

const EditMenuContent = ({
  isVisible, onClose, userMenus, setUserMenus
}: EditModalProps) => {
  // ... (편집 모달 로직 유지) ...
  const [newMenuItem, setNewMenuItem] = useState('');

  const handleAddItem = () => {
    if (newMenuItem.trim()) {
      if (userMenus.length < MAX_ITEMS) {
        setUserMenus([...userMenus, newMenuItem.trim()]);
        setNewMenuItem('');
      } else {
        Alert.alert("등록 불가", `메뉴는 최대 ${MAX_ITEMS}개까지만 등록 가능합니다.`);
      }
    }
  };

  const handleDeleteItem = (indexToDelete: number) => {
    if (userMenus.length > MIN_ITEMS) {
      const newMenus = userMenus.filter((_, index) => index !== indexToDelete);
      setUserMenus(newMenus);
    } else {
      Alert.alert("삭제 불가", `메뉴는 최소 ${MIN_ITEMS}개 이상 유지해야 합니다.`);
    }
  };

  return (
    <View style={styles.modalOverlayEdit}>
      <View style={styles.modalContentEdit}>
        <Text style={styles.editTitle}>
          메뉴 목록 편집 ({userMenus.length} / {MAX_ITEMS}개)
        </Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.menuInput}
            placeholder={userMenus.length >= MAX_ITEMS ? `최대 ${MAX_ITEMS}개까지 등록되었습니다.` : "새 메뉴 이름을 입력하세요"}
            value={newMenuItem}
            onChangeText={setNewMenuItem}
            onSubmitEditing={handleAddItem}
            maxLength={15}
            editable={userMenus.length < MAX_ITEMS}
          />
          <TouchableOpacity
            style={[styles.addButton, userMenus.length >= MAX_ITEMS && styles.addButtonDisabled]}
            onPress={handleAddItem}
            disabled={userMenus.length >= MAX_ITEMS || !newMenuItem.trim()}
          >
            <Text style={styles.addButtonText}>추가</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={userMenus}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item, index }) => (
            <View style={styles.menuItemRow}>
              <Text style={styles.menuItemText}>{item}</Text>
              <TouchableOpacity
                onPress={() => handleDeleteItem(index)}
                disabled={userMenus.length <= MIN_ITEMS}
              >
                <Icon
                  name="close-circle-outline"
                  size={20}
                  color={userMenus.length > MIN_ITEMS ? "#FF6347" : "#CCC"}
                />
              </TouchableOpacity>
            </View>
          )}
          style={styles.menuList}
        />

        <TouchableOpacity
          style={styles.closeEditButton}
          onPress={onClose}
        >
          <Text style={styles.closeEditButtonText}>닫기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const MemoizedEditMenuModal = memo(EditMenuContent);


// ======================================================================
// 🎯 RouletteScreen (메인 컴포넌트)
// ======================================================================
export default function RouletteScreen() {
  const navigation = useNavigation<any>();

  const anim = useRef(new Animated.Value(0)).current;
  const rotationRef = useRef(0);

  const [spinning, setSpinning] = useState(false);
  const [mode, setMode] = useState<'category' | 'menu'>('category');

  const [userMenus, setUserMenus] = useState(DEFAULT_MENUS);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const [results, setResults] = useState<{ category: string | null; menu: string | null }>({
    category: null,
    menu: null,
  });

  const [showOverlay, setShowOverlay] = useState(false);

  const currentItems = useMemo(() => {
    return mode === 'category' ? CATEGORIES : userMenus;
  }, [mode, userMenus]);

  const currentResult = results[mode];
  const anglePerItem = 360 / currentItems.length;

  const changeMode = (newMode: 'category' | 'menu') => {
    if (spinning) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMode(newMode);
    setShowOverlay(false);
  };

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResults(prev => ({ ...prev, [mode]: null }));
    setShowOverlay(false);

    if (mode === 'menu' && currentItems.length < MIN_ITEMS) {
      setSpinning(false);
      Alert.alert("스핀 불가", `메뉴는 최소 ${MIN_ITEMS}개 이상 등록해야 스핀할 수 있습니다.`);
      return;
    }

    const randomAngle = Math.random() * 360;
    const totalRotate = (360 * 5) + randomAngle;

    const currentVal = rotationRef.current;
    const toValue = currentVal + totalRotate;

    Animated.timing(anim, {
      toValue: toValue,
      duration: 4000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start(() => {
      rotationRef.current = toValue;
      const finalAngle = toValue % 360;
      const pointerAngle = (360 - finalAngle) % 360;
      const index = Math.floor(pointerAngle / anglePerItem);

      const safeIndex = Math.min(Math.max(index, 0), currentItems.length - 1);
      const picked = currentItems[safeIndex];

      setResults(prev => ({ ...prev, [mode]: picked }));
      setSpinning(false);

      setTimeout(() => {
        setShowOverlay(true);
      }, 100);
    });
  };

  const spinValue = anim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  const handleGoToSearchResult = () => {
    setShowOverlay(false);
    if (currentResult) {
      navigation.navigate("SearchResult", {
        query: currentResult,
        filters: mode === 'category' ? { category: currentResult } : {},
      });
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* 1. 🔥 [수정] 헤더: 제목만 남김 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>오늘 뭐 먹지?</Text>
        {/* 편집 버튼 삭제됨 */}
      </View>

      {/* 2. 탭 영역 */}
      <View style={styles.tabContainer}>
        <View style={styles.tabWrapper}>
          <TouchableOpacity
            style={[styles.tabButton, mode === 'category' && styles.tabButtonActive]}
            onPress={() => changeMode('category')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, mode === 'category' && styles.tabTextActive]}>카테고리</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, mode === 'menu' && styles.tabButtonActive]}
            onPress={() => changeMode('menu')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, mode === 'menu' && styles.tabTextActive]}>메뉴</Text>
          </TouchableOpacity>
        </View>

        {/* 🔥 [추가] 편집 버튼을 탭 옆에 배치 (메뉴 모드일 때만 보임) */}
        {mode === 'menu' && (
          <TouchableOpacity onPress={() => setIsEditModalVisible(true)} style={styles.editIcon}>
            <Icon name="create-outline" size={24} color="#555" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.mainContent}>

        <View style={styles.wheelSection}>
          <View style={styles.pointerWrap} pointerEvents="none">
            <Icon name="caret-down" size={60} color={MAIN_COLOR} style={styles.pointerIcon} />
          </View>
          <View style={styles.wheelContainer}>
            <Animated.View
              style={[styles.wheel, { transform: [{ rotate: spinValue }] }]}
            >
              {currentItems.map((label, i) => {
                const rotate = i * anglePerItem;
                return (
                  <View
                    key={`${mode}-${i}-${currentItems.length}`}
                    style={[styles.sliceContainer, { transform: [{ rotate: `${rotate}deg` }] }]}
                  >
                    <View style={styles.divider} />
                    <View style={[styles.textWrapper, { transform: [{ rotate: `${anglePerItem / 2}deg` }] }]}>
                      <Text style={styles.labelText} numberOfLines={1} adjustsFontSizeToFit>
                        {label}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </Animated.View>
            <View style={styles.centerHub}><View style={styles.centerHubInner} /></View>
          </View>
        </View>

        <View style={styles.bottomControlArea}>
          <View style={styles.resultTextContainer}>
            <Text style={styles.resultText}>
              {currentResult ? `"${currentResult}" 당첨!` : " "}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.spinButton, spinning && styles.spinButtonDisabled]}
            onPress={spin}
            disabled={spinning || (mode === 'menu' && currentItems.length < MIN_ITEMS)}
            activeOpacity={0.9}
          >
            <Text style={styles.spinBtnText}>
              {spinning ? "돌아가는 중..." : `${mode === 'category' ? '카테고리' : '메뉴'} 뽑기`}
            </Text>
          </TouchableOpacity>
          {mode === 'menu' && currentItems.length < MIN_ITEMS && (
            <Text style={styles.warningText}>메뉴는 최소 {MIN_ITEMS}개가 필요합니다.</Text>
          )}
        </View>
      </View>


      {/* 모달 호출 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <MemoizedEditMenuModal
          isVisible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          userMenus={userMenus}
          setUserMenus={setUserMenus}
        />
      </Modal>


      {/* 결과 모달 (기존 유지) */}
      {showOverlay && (
        <View style={styles.customModalOverlay}>
          <View style={styles.customModalContent}>
            <Text style={styles.confetti}>🎉🎊</Text>
            <Text style={styles.modalTitle}>축하합니다!</Text>
            <Text style={styles.modalResultText}>"{currentResult}"</Text>

            <TouchableOpacity style={styles.modalButton} onPress={handleGoToSearchResult} activeOpacity={0.8}>
              <Text style={styles.modalButtonText}>결과 확인하기</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowOverlay(false)} style={styles.modalCloseButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="close-circle" size={30} color="#CCC" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ... (MemoizedEditMenuModal 및 styles 정의 유지)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    position: 'relative',
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#333" },
  // 🔥 [수정] 편집 아이콘 스타일: 탭바 옆에 배치되도록 조정
  editIcon: {
    position: 'absolute',
    right: 20,
    top: 10, // 탭바와 수직 정렬
    padding: 5,
    zIndex: 11, // 탭바 위에 오도록 zIndex 조정
  },

  tabContainer: {
    flexDirection: 'row', // Row로 변경
    alignItems: 'center',
    justifyContent: 'center', // 중앙 정렬
    paddingVertical: 10,
    zIndex: 10,
    width: '100%',
    paddingHorizontal: 20, // 양옆 패딩
  },
  tabWrapper: { flexDirection: 'row', backgroundColor: '#F2F4F6', borderRadius: 25, padding: 4, width: 200, height: 44 },
  tabButton: { flex: 1, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  tabButtonActive: { backgroundColor: '#fff', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: "600", color: "#8B95A1" },
  tabTextActive: { fontWeight: "700", color: "#333" },

  mainContent: { flex: 1, alignItems: "center", justifyContent: "flex-start", paddingTop: 30, paddingBottom: 100 },

  wheelSection: { alignItems: 'center', justifyContent: 'center', marginBottom: 0 },
  pointerWrap: { position: "absolute", top: 10, zIndex: 50, elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
  pointerIcon: { marginBottom: 0 },

  wheelContainer: { marginTop: 100, width: WHEEL_SIZE, height: WHEEL_SIZE, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 10 },
  wheel: { width: "100%", height: "100%", borderRadius: WHEEL_SIZE / 2, borderWidth: 14, borderColor: MAIN_COLOR, backgroundColor: "#FFF8F0", overflow: "hidden", position: 'relative' },
  sliceContainer: { position: "absolute", width: "100%", height: "100%", left: 0, top: 0, alignItems: 'center' },
  divider: { position: 'absolute', top: 0, width: 2, height: WHEEL_SIZE / 2, backgroundColor: "rgba(255, 168, 71, 0.3)" },
  textWrapper: { position: 'absolute', width: '100%', height: '100%', alignItems: 'center', paddingTop: 28 },
  labelText: { fontSize: 16, fontWeight: "700", color: "#5A4030", width: 70, textAlign: 'center' },
  centerHub: { position: "absolute", width: 50, height: 50, borderRadius: 25, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
  centerHubInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: MAIN_COLOR },

  bottomControlArea: { width: '100%', paddingHorizontal: 20, alignItems: 'center', marginTop: 40 },
  resultTextContainer: { marginBottom: 20, height: 30, justifyContent: 'center' },
  resultText: { fontSize: 22, fontWeight: "800", color: MAIN_COLOR, textAlign: 'center' },
  spinButton: { backgroundColor: MAIN_COLOR, width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: "center", shadowColor: MAIN_COLOR, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  spinButtonDisabled: { backgroundColor: "#FFCFA3", shadowOpacity: 0, elevation: 0 },
  spinBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  warningText: { color: '#FF6347', fontSize: 14, marginTop: 10, fontWeight: '600' },

  // 메뉴 편집 모달 스타일
  modalOverlayEdit: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContentEdit: { width: width * 0.9, maxHeight: height * 0.8, backgroundColor: 'white', borderRadius: 15, padding: 20, elevation: 20 },
  editTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  inputRow: { flexDirection: 'row', marginBottom: 15, borderBottomWidth: 2, borderBottomColor: MAIN_COLOR },
  menuInput: { flex: 1, height: 40, fontSize: 16, paddingHorizontal: 0, color: '#333' },
  addButton: { backgroundColor: MAIN_COLOR, paddingHorizontal: 15, justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginLeft: 10, height: 40 },
  addButtonDisabled: { backgroundColor: '#CCC' },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  menuList: { flexGrow: 0, marginBottom: 15 },
  menuItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuItemText: { fontSize: 16, color: '#555' },
  closeEditButton: { marginTop: 10, paddingVertical: 10, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEE' },
  closeEditButtonText: { color: MAIN_COLOR, fontWeight: 'bold' },

  // 결과 모달 스타일
  customModalOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 9999, elevation: 9999 },
  customModalContent: { width: '80%', backgroundColor: '#fff', borderRadius: 20, padding: 30, alignItems: 'center', elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 10 },
  confetti: { fontSize: 40, marginBottom: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  modalResultText: { fontSize: 32, fontWeight: '800', color: '#333', marginBottom: 30, textAlign: 'center' },
  modalButton: { backgroundColor: MAIN_COLOR, width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalCloseButton: { position: 'absolute', top: 15, right: 15 },
});