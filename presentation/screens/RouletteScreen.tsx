import React, { useRef, useState, useMemo } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get("window");
const WHEEL_SIZE = width * 0.8;
const MAIN_COLOR = '#FFA847';

const CATEGORIES = [
  "한식", "중식", "일식", "양식",
  "분식", "야식", "카페", "아시안"
];

const MENUS = [
  "치킨", "피자", "삼겹살", "떡볶이",
  "마라탕", "초밥", "햄버거", "국밥",
  "파스타", "족발"
];

export default function RouletteScreen() {
  const navigation = useNavigation<any>();

  const anim = useRef(new Animated.Value(0)).current;
  const rotationRef = useRef(0);

  const [spinning, setSpinning] = useState(false);
  const [mode, setMode] = useState<'category' | 'menu'>('category');

  const [results, setResults] = useState<{ category: string | null; menu: string | null }>({
    category: null,
    menu: null,
  });

  const [showOverlay, setShowOverlay] = useState(false);

  const currentItems = useMemo(() => {
    return mode === 'category' ? CATEGORIES : MENUS;
  }, [mode]);

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

    const randomAngle = Math.floor(Math.random() * 360);
    const spins = 5;
    const totalRotate = (spins * 360) + randomAngle;

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

      <View style={styles.header}>
        <Text style={styles.headerTitle}>오늘 뭐 먹지?</Text>
      </View>

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
      </View>

      {/* 🔥 [수정] flex-start로 위에서부터 차례대로 배치 */}
      <View style={styles.mainContent}>

        {/* 1. 핀 (절대위치로 고정) */}
        <View style={styles.pointerWrap} pointerEvents="none">
          <Icon name="caret-down" size={60} color={MAIN_COLOR} style={styles.pointerIcon} />
        </View>

        {/* 2. 룰렛 (위쪽 여백으로 핀 아래로 내림) */}
        <View style={styles.wheelContainer}>
          <Animated.View
            style={[styles.wheel, { transform: [{ rotate: spinValue }] }]}
          >
            {currentItems.map((label, i) => {
              const rotate = i * anglePerItem;
              return (
                <View
                  key={`${mode}-${i}`}
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
          <View style={styles.centerHub}>
            <View style={styles.centerHubInner} />
          </View>
        </View>

        {/* 🔥 3. 결과 텍스트 (marginTop: 60으로 룰렛과 강제 이별) */}
        <View style={styles.resultTextContainer}>
          <Text style={styles.resultText}>
            {currentResult ? `"${currentResult}" 당첨!` : " "}
          </Text>
        </View>

        {/* 🔥 4. 버튼 (marginTop: 30으로 텍스트와 강제 이별) */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.spinButton, spinning && styles.spinButtonDisabled]}
            onPress={spin}
            disabled={spinning}
            activeOpacity={0.9}
          >
            <Text style={styles.spinBtnText}>
              {spinning ? "돌아가는 중..." : `${mode === 'category' ? '카테고리' : '메뉴'} 뽑기`}
            </Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* 모달 */}
      {showOverlay && (
        <View style={styles.customModalOverlay}>
          <View style={styles.customModalContent}>
            <Text style={styles.confetti}>🎉🎊</Text>
            <Text style={styles.modalTitle}>축하합니다!</Text>
            <Text style={styles.modalResultText}>"{currentResult}"</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleGoToSearchResult}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>결과 확인하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowOverlay(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close-circle" size={30} color="#CCC" />
            </TouchableOpacity>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { width: '100%', height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#333" },

  tabContainer: { alignItems: 'center', paddingVertical: 10, zIndex: 10 },
  tabWrapper: { flexDirection: 'row', backgroundColor: '#F2F4F6', borderRadius: 25, padding: 4, width: 200, height: 44 },
  tabButton: { flex: 1, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  tabButtonActive: { backgroundColor: '#fff', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: "600", color: "#8B95A1" },
  tabTextActive: { fontWeight: "700", color: "#333" },

  // 🔥 [수정] flex-start로 변경해서 위에서부터 차곡차곡 쌓음
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start", // 중앙 정렬 말고 시작점부터
    paddingTop: 30, // 상단 여백 확보
  },

  pointerWrap: {
    position: "absolute",
    top: 25, // 핀 위치 고정 (탭바 아래)
    zIndex: 50,
    elevation: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2
  },
  pointerIcon: { marginBottom: 0 },

  // 룰렛
  wheelContainer: {
    marginTop: 55, // 🔥 핀과 겹치지 않게 아래로 밀기
    width: WHEEL_SIZE, height: WHEEL_SIZE,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 10
  },
  wheel: { width: "100%", height: "100%", borderRadius: WHEEL_SIZE / 2, borderWidth: 14, borderColor: MAIN_COLOR, backgroundColor: "#FFF8F0", overflow: "hidden", position: 'relative' },
  sliceContainer: { position: "absolute", width: "100%", height: "100%", left: 0, top: 0, alignItems: 'center' },
  divider: { position: 'absolute', top: 0, width: 2, height: WHEEL_SIZE / 2, backgroundColor: "rgba(255, 168, 71, 0.3)" },
  textWrapper: { position: 'absolute', width: '100%', height: '100%', alignItems: 'center', paddingTop: 28 },
  labelText: { fontSize: 16, fontWeight: "700", color: "#5A4030", width: 70, textAlign: 'center' },
  centerHub: { position: "absolute", width: 50, height: 50, borderRadius: 25, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
  centerHubInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: MAIN_COLOR },

  // 🔥 [수정] 결과 텍스트: 룰렛과 강제 이별 (60px)
  resultTextContainer: {
    marginTop: 60,
    marginBottom: 0,
    height: 40,
    justifyContent: 'center'
  },
  resultText: { fontSize: 24, fontWeight: "800", color: MAIN_COLOR, textAlign: 'center' },

  // 🔥 [수정] 버튼: 텍스트와 강제 이별 (30px)
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 30,
  },
  spinButton: { backgroundColor: MAIN_COLOR, width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: "center", shadowColor: MAIN_COLOR, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  spinButtonDisabled: { backgroundColor: "#FFCFA3", shadowOpacity: 0, elevation: 0 },
  spinBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  customModalOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 9999, elevation: 9999 },
  customModalContent: { width: '80%', backgroundColor: '#fff', borderRadius: 20, padding: 30, alignItems: 'center', elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 10 },
  confetti: { fontSize: 40, marginBottom: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  modalResultText: { fontSize: 32, fontWeight: '800', color: '#333', marginBottom: 30, textAlign: 'center' },
  modalButton: { backgroundColor: MAIN_COLOR, width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalCloseButton: { position: 'absolute', top: 15, right: 15 },
});