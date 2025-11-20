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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import UserTabBar from "../components/UserTabBar";

const { width } = Dimensions.get("window");
const WHEEL_SIZE = width * 0.85;
const MAIN_COLOR = "#FFA847";

// 1. 데이터셋 분리
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
  const [result, setResult] = useState<string | null>(null);

  // 2. 모드 상태 추가 ('category' | 'menu')
  const [mode, setMode] = useState<'category' | 'menu'>('category');

  // 현재 모드에 따라 보여줄 아이템 결정
  const currentItems = useMemo(() => {
    return mode === 'category' ? CATEGORIES : MENUS;
  }, [mode]);

  const anglePerItem = 360 / currentItems.length;

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    // 랜덤 회전 로직 (이전과 동일)
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

      // 배열 범위 안전장치
      const safeIndex = Math.min(Math.max(index, 0), currentItems.length - 1);
      const picked = currentItems[safeIndex];

      setResult(picked);
      setSpinning(false);

      // 결과 전달 시 type도 같이 넘겨줄 수 있음
      setTimeout(() => {
        navigation.navigate("SearchResult", {
          query: picked,
          filters: mode === 'category' ? { category: picked } : {},
        });
      }, 800);
    });
  };

  const spinValue = anim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>오늘 뭐 먹지?</Text>
      </View>

      {/* 3. 탭 스위처 추가 */}
      <View style={styles.tabContainer}>
        <View style={styles.tabWrapper}>
          {/* 카테고리 탭 */}
          <TouchableOpacity
            style={[
              styles.tabButton,
              mode === 'category' && styles.tabButtonActive
            ]}
            onPress={() => !spinning && setMode('category')} // 돌릴 땐 탭 변경 금지
            activeOpacity={0.8}
          >
            <Text style={[
              styles.tabText,
              mode === 'category' && styles.tabTextActive
            ]}>카테고리</Text>
          </TouchableOpacity>

          {/* 메뉴 탭 */}
          <TouchableOpacity
            style={[
              styles.tabButton,
              mode === 'menu' && styles.tabButtonActive
            ]}
            onPress={() => !spinning && setMode('menu')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.tabText,
              mode === 'menu' && styles.tabTextActive
            ]}>메뉴</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* 포인터 */}
        <View style={styles.pointerWrap}>
          <Icon name="caret-down" size={50} color={MAIN_COLOR} style={styles.pointerIcon} />
        </View>

        {/* 룰렛 */}
        <View style={styles.wheelContainer}>
          <Animated.View
            style={[
              styles.wheel,
              { transform: [{ rotate: spinValue }] }
            ]}
          >
            {currentItems.map((label, i) => {
              const rotate = i * anglePerItem;
              return (
                <View
                  key={`${mode}-${i}`} // 키값 변경으로 리렌더링 유도
                  style={[
                    styles.sliceContainer,
                    { transform: [{ rotate: `${rotate}deg` }] }
                  ]}
                >
                  <View style={styles.divider} />
                  <View style={[
                    styles.textWrapper,
                    { transform: [{ rotate: `${anglePerItem / 2}deg` }] }
                  ]}>
                    <Text
                      style={styles.labelText}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
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

        <View style={styles.resultArea}>
          <Text style={styles.resultText}>
            {result ? `"${result}" 당첨!` : " "}
          </Text>
        </View>
      </View>

      <View style={styles.buttonArea}>
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

      <UserTabBar active="룰렛" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    width: '100%',
    height: 50, // 높이 살짝 줄임
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#333" },

  // 🔥 탭 스타일 추가
  tabContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F2F4F6', // 회색 배경
    borderRadius: 25,
    padding: 4,
    width: 200, // 전체 너비
    height: 44,
  },
  tabButton: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#fff', // 활성 탭 흰색 배경
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B95A1",
  },
  tabTextActive: {
    fontWeight: "700",
    color: "#333",
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
  },

  pointerWrap: {
    position: "absolute",
    top: "5%", // 탭 때문에 위치 미세 조정
    zIndex: 50,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  pointerIcon: {
    marginBottom: -15,
  },

  wheelContainer: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },

  wheel: {
    width: "100%",
    height: "100%",
    borderRadius: WHEEL_SIZE / 2,
    borderWidth: 14,
    borderColor: MAIN_COLOR,
    backgroundColor: "#FFF8F0",
    overflow: "hidden",
    position: 'relative',
  },

  sliceContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    left: 0,
    top: 0,
    alignItems: 'center',
  },

  divider: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: WHEEL_SIZE / 2,
    backgroundColor: "rgba(255, 168, 71, 0.3)",
  },

  textWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    paddingTop: 28,
  },

  labelText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#5A4030",
    width: 70,
    textAlign: 'center',
  },

  centerHub: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  centerHubInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: MAIN_COLOR,
  },

  resultArea: {
    marginTop: 30,
    height: 30,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 20,
    fontWeight: "700",
    color: MAIN_COLOR,
  },

  buttonArea: {
    position: 'absolute',
    bottom: 100,
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  spinButton: {
    backgroundColor: MAIN_COLOR,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: MAIN_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  spinButtonDisabled: {
    backgroundColor: "#FFCFA3",
    shadowOpacity: 0,
    elevation: 0,
  },
  spinBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});