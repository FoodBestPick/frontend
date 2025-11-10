import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type FilterState = {
  location?: string;
  radius?: number;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  openNow?: boolean;
  parking?: boolean;
  delivery?: boolean;
};

type RootStackParamList = {
  RouletteScreen: undefined;
  SearchResult: { query: string; filters: FilterState };
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'RouletteScreen'>;

const { width } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(width - 48, 320);

const DEFAULT_CATEGORIES = [
  '한식',
  '중식',
  '일식',
  '양식',
  '분식',
  '카페',
  '디저트',
  '치킨',
];
const DEFAULT_MENUS = [
  '비빔밥',
  '국밥',
  '파스타',
  '피자',
  '초밥',
  '타코',
  '버거',
  '곱창',
];

const RouletteScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [mode, setMode] = useState<'category' | 'menu'>('category');

  const items = useMemo(
    () => (mode === 'category' ? DEFAULT_CATEGORIES : DEFAULT_MENUS),
    [mode],
  );

  const anglePerItem = 360 / items.length;

  const anim = useRef(new Animated.Value(0)).current;
  const rotationRef = useRef(0);
  const [spinning, setSpinning] = useState(false);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);

    const targetIndex = Math.floor(Math.random() * items.length);
    const centerAngle = targetIndex * anglePerItem + anglePerItem / 2;

    const turns = 6 + Math.floor(Math.random() * 3);
    const extra = turns * 360 + (360 - (centerAngle % 360));
    const to = rotationRef.current + extra;

    Animated.timing(anim, {
      toValue: to,
      duration: 3600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      rotationRef.current = to % 360;
      setSpinning(false);

      const picked = items[targetIndex];
      // ✅ 바로 검색 결과로 이동
      navigation.navigate('SearchResult', {
        query: picked,
        filters: mode === 'category' ? { category: picked } : {},
      });
    });
  };

  const rotateInterpolate = anim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>메뉴 룰렛</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[
            styles.modeChip,
            mode === 'category' && styles.modeChipActive,
          ]}
          onPress={() => setMode('category')}
          disabled={spinning}
        >
          <Text
            style={[
              styles.modeText,
              mode === 'category' && styles.modeTextActive,
            ]}
          >
            카테고리
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeChip, mode === 'menu' && styles.modeChipActive]}
          onPress={() => setMode('menu')}
          disabled={spinning}
        >
          <Text
            style={[styles.modeText, mode === 'menu' && styles.modeTextActive]}
          >
            개별 메뉴
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.wheelWrap}>
        <View style={styles.pointer} />

        <Animated.View
          style={[
            styles.wheel,
            {
              width: WHEEL_SIZE,
              height: WHEEL_SIZE,
              transform: [{ rotate: rotateInterpolate }],
            },
          ]}
        >
          {items.map((label, i) => {
            const angle = (i / items.length) * 2 * Math.PI;
            const r = WHEEL_SIZE / 2 - 36;
            const x = WHEEL_SIZE / 2 + r * Math.sin(angle) - 40;
            const y = WHEEL_SIZE / 2 - r * Math.cos(angle) - 14;

            const bg = i % 2 === 0 ? '#FFF4E6' : '#FDE3C3';

            return (
              <View
                key={i}
                style={[
                  styles.label,
                  {
                    left: x,
                    top: y,
                    backgroundColor: bg,
                  },
                ]}
              >
                <Text style={styles.labelText}>{label}</Text>
              </View>
            );
          })}
        </Animated.View>
      </View>

      <TouchableOpacity
        style={[styles.spinButton, spinning && { opacity: 0.6 }]}
        onPress={spin}
        disabled={spinning}
      >
        <Icon name="sync" size={18} color="#fff" />
        <Text style={styles.spinText}>
          {spinning ? '돌아가는 중...' : '돌리기'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default RouletteScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },

  modeRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  modeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  modeChipActive: {
    backgroundColor: '#FFA847',
    borderColor: '#FFA847',
  },
  modeText: { color: '#666', fontSize: 14 },
  modeTextActive: { color: '#fff', fontWeight: '700' },

  wheelWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  wheel: {
    borderRadius: 999,
    borderWidth: 10,
    borderColor: '#FFE0B2',
    backgroundColor: '#FFFDF9',
  },
  pointer: {
    position: 'absolute',
    top: 10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 18,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFA847',
    zIndex: 2,
  },
  label: {
    position: 'absolute',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  labelText: { fontSize: 13, color: '#333', fontWeight: '600' },

  spinButton: {
    marginTop: 28,
    alignSelf: 'center',
    backgroundColor: '#FFA847',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spinText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
