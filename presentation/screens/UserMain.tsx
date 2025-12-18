import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
  PermissionsAndroid,
  AppState,
  AppStateStatus
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import messaging from '@react-native-firebase/messaging';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { foodRes, CategoryKey, Store } from '../../data/mock/foodRes'; 
import { useUserMainViewModel, Store } from '../viewmodels/UserMainViewModel';
import { UserAuthRepositoryImpl } from '../../data/repositoriesImpl/UserAuthRepositoryImpl';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const MAIN_COLOR = '#FFA847';

const SCROLL_THRESHOLD = 220;
const TRACK_WIDTH = width * 0.75;

// [수정 포인트] 화면 좌우 여백을 24으로 설정하여 안쪽으로 확 밀어넣음
const SCREEN_PADDING = 24; 

type CategoryKey = string; 

const UserMain = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('전체');
  const navigation = useNavigation();
  const { unreadAlarmCount, markAllAlarmsRead } = useAuth();
  const { groupedStores, getStoresByCategory, loading, refresh } = useUserMainViewModel();

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [])
  );

  const scrollY = useRef(new Animated.Value(0)).current;
  const [isStickyActive, setIsStickyActive] = useState(false);


  useEffect(() => {
    const lastRegisteredTokenRef = { current: null as string | null };

    const isSystemAllowed = async (): Promise<boolean> => {
      if (Platform.OS === "android" && Number(Platform.Version) >= 33) {
        return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      }

      const authStatus = await messaging().hasPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    };

    const registerTokenIfPossible = async (force: boolean = false) => {
      try {
        const ok = await isSystemAllowed();
        if (!ok) return;

        const token = await messaging().getToken();
        if (!token) return;

        if (!force && lastRegisteredTokenRef.current === token) return;

        await UserAuthRepositoryImpl.registerFcmToken(token);
        lastRegisteredTokenRef.current = token;
        console.log("✅ FCM 토큰 서버 등록 성공(자동):", token);
      } catch (e) {
        console.error("❌ FCM 토큰 서버 등록 실패(자동):", e);
      }
    };

    const setupFCM = async () => {
      try {
        if (Platform.OS === "android" && Number(Platform.Version) >= 33) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          console.log("POST_NOTIFICATIONS:", result);
        }

        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log("FCM 권한 승인됨:", authStatus);
          await registerTokenIfPossible(true);
        }
      } catch (error) {
        console.error("FCM 권한 요청 실패:", error);
      }
    };

    setupFCM();

    const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
      console.log("포그라운드 알림 수신:", remoteMessage);
      Alert.alert(
        remoteMessage.notification?.title || "알림",
        remoteMessage.notification?.body || "새로운 알림이 도착했습니다."
      );
    });

    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (token) => {
      try {
        await UserAuthRepositoryImpl.registerFcmToken(token);
        lastRegisteredTokenRef.current = token;
        console.log("✅ FCM 토큰 갱신 등록:", token);
      } catch (e) {
        console.error("❌ FCM 토큰 갱신 등록 실패:", e);
      }
    });
    const appStateSub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") {
        registerTokenIfPossible(false);
      }
    });

    return () => {
      unsubscribeOnMessage();
      unsubscribeTokenRefresh();
      appStateSub.remove();
    };
  }, []);

  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      if (value > SCROLL_THRESHOLD - 50 && !isStickyActive) {
        setIsStickyActive(true);
      } else if (value <= SCROLL_THRESHOLD - 50 && isStickyActive) {
        setIsStickyActive(false);
      }
    });
    return () => scrollY.removeListener(listenerId);
  }, [isStickyActive]);

  const categories: { key: CategoryKey; icon: any }[] = [
    { key: '전체', icon: require('../../assets/icons/all.png') },
    { key: '패스트푸드', icon: require('../../assets/icons/fastfood.png') },
    { key: '카페/디저트', icon: require('../../assets/icons/cafe.png') },
    { key: '족발/보쌈', icon: require('../../assets/icons/pork.png') },
    { key: '야식', icon: require('../../assets/icons/night.png') },
    { key: '한식', icon: require('../../assets/icons/korean.png') },
    { key: '양식', icon: require('../../assets/icons/western.png') },
    { key: '중식', icon: require('../../assets/icons/chinese.png') },
    { key: '분식', icon: require('../../assets/icons/snack.png') },
    { key: '일식', icon: require('../../assets/icons/japanese.png') },
  ];

  const getStoresByCategoryWrapper = (category: CategoryKey): Store[] => {
    return getStoresByCategory(category);
  };

  const FixedSearchBar = () => (
    <View style={styles.fixedHeader}>
      <View style={styles.topHeaderRow}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>맛집 찾기</Text>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => {
            markAllAlarmsRead();
            navigation.navigate("UserNotificationScreen" as never)
          }}
        >
          <View style={{ position: "relative" }}>
            <Icon name="notifications-outline" size={24} color="#333" />
            {unreadAlarmCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadAlarmCount > 99 ? "99+" : unreadAlarmCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.searchBox}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('SearchScreen' as never)}
      >
        <Icon
          name="search-outline"
          size={20}
          color="#BBB"
          style={styles.searchIcon}
        />
        <Text style={styles.placeholderText}>원하는 음식을 입력해주세요</Text>
      </TouchableOpacity>
    </View>
  );

  const StickyOneRowCategory = () => {
    const opacity = scrollY.interpolate({
      inputRange: [SCROLL_THRESHOLD - 50, SCROLL_THRESHOLD],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    const translateY = scrollY.interpolate({
      inputRange: [SCROLL_THRESHOLD - 50, SCROLL_THRESHOLD],
      outputRange: [-20, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.stickyCategoryContainer,
          { opacity, transform: [{ translateY }] },
        ]}
        pointerEvents={isStickyActive ? 'auto' : 'none'}
      >
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.key}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.scrollCatItem,
                selectedCategory === item.key && styles.scrollCatItemSelected,
              ]}
              onPress={() => setSelectedCategory(item.key)}
            >
              <Image
                source={item.icon}
                style={[
                  styles.iconSmall,
                  selectedCategory === item.key && { tintColor: MAIN_COLOR },
                ]}
              />
              <Text
                style={[
                  styles.textSmall,
                  selectedCategory === item.key && styles.textSelected,
                ]}
              >
                {item.key}
              </Text>
            </TouchableOpacity>
          )}
        />
        <View style={styles.stickyTitleWrap}>
          <Text style={styles.recommendTitle}>맛집 추천</Text>
          {selectedCategory !== '전체' && (
            <Text style={styles.subTitleSmall}>{selectedCategory}</Text>
          )}
        </View>
      </Animated.View>
    );
  };

  const MainGridHeader = () => (
    <View>
      <View style={styles.gridWrapper}>
        {categories.map(item => {
          const isSelected = selectedCategory === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.gridItem, isSelected && styles.gridItemSelected]}
              onPress={() => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut,
                );
                setSelectedCategory(item.key);
              }}
              activeOpacity={0.7}
            >
              <Image
                source={item.icon}
                style={[styles.icon, isSelected && styles.iconSelected]}
              />
              <Text
                style={[styles.gridText, isSelected && styles.gridTextSelected]}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >
                {item.key}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.recommendHeader}>
        <Text style={styles.recommendTitle}>맛집 추천</Text>
        {selectedCategory !== '전체' && (
          <Text style={styles.subTitleSmall}>{selectedCategory}</Text>
        )}
      </View>
    </View>
  );

  const CategorySection = ({
    category,
    stores,
  }: {
    category: string;
    stores: Store[];
  }) => {
    const scrollX = useRef(new Animated.Value(0)).current;
    const [contentWidth, setContentWidth] = useState(1);
    const [scrollViewWidth, setScrollViewWidth] = useState(1);

    const scrollIndicatorSize =
      contentWidth > scrollViewWidth
        ? (scrollViewWidth / contentWidth) * TRACK_WIDTH
        : TRACK_WIDTH;

    const scrollIndicatorPosition = scrollX.interpolate({
      inputRange: [0, Math.max(contentWidth - scrollViewWidth, 1)],
      outputRange: [0, TRACK_WIDTH - scrollIndicatorSize],
      extrapolate: 'clamp',
    });

    return (
      <View key={category} style={styles.categorySection}>
        {/* 타이틀 왼쪽 마진 30px 적용 */}
        <Text style={styles.subTitle}>{category}</Text>
        <Animated.FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={stores}
          keyExtractor={item => item.id.toString()}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false },
          )}
          onContentSizeChange={w => setContentWidth(w)}
          onLayout={e => setScrollViewWidth(e.nativeEvent.layout.width)}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.cardContainer}
              activeOpacity={0.8}
              onPress={() => (navigation.navigate as any)('RestaurantDetail', { restaurantId: item.id })}
            >
              <View style={styles.cardImageWrapper}>
                {index < 3 && (
                  <View
                    style={[
                      styles.rankBadgeAbsolute,
                      index === 0
                        ? { backgroundColor: '#FFD700' }
                        : index === 1
                          ? { backgroundColor: '#C0C0C0' }
                          : { backgroundColor: '#CD7F32' },
                    ]}
                  >
                    <Text style={styles.rankTextWhite}>{index + 1}</Text>
                  </View>
                )}
                <Image
                  source={{ uri: item.image[0] }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.cardInfoRow}>
                  <Icon name="star" size={12} color={MAIN_COLOR} />
                  <Text style={styles.ratingScore}>{item.rating}</Text>
                  <Text style={styles.reviewCountShort}>({item.reviews})</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          // 리스트 좌우 여백 30px 적용
          contentContainerStyle={{
            paddingRight: SCREEN_PADDING,
            paddingBottom: 10,
            paddingLeft: SCREEN_PADDING,
          }}
        />

        {contentWidth > scrollViewWidth && (
          <View style={styles.scrollTrack}>
            <Animated.View
              style={[
                styles.scrollThumb,
                {
                  width: scrollIndicatorSize,
                  transform: [{ translateX: scrollIndicatorPosition }],
                },
              ]}
            />
          </View>
        )}
      </View>
    );
  };

  const renderStoreListItem = ({
    item,
    index,
  }: {
    item: Store;
    index: number;
  }) => (
    <TouchableOpacity style={styles.storeContainer} activeOpacity={0.9}>
      <View style={styles.storeHeader}>
        {index < 3 ? (
          <View
            style={[
              styles.rankBadge,
              index === 0
                ? { backgroundColor: '#FFD700' }
                : index === 1
                  ? { backgroundColor: '#C0C0C0' }
                  : { backgroundColor: '#CD7F32' },
            ]}
          >
            <Text style={styles.rankTextWhite}>{index + 1}</Text>
          </View>
        ) : (
          <View style={{ width: 26 }} />
        )}
        <Text style={styles.storeName}>{item.name}</Text>
      </View>
      <View style={styles.imageGrid}>
        <Image
          source={{ uri: item.image[0] }}
          style={styles.mainImage}
          resizeMode="cover"
        />
        <View style={styles.subImageColumn}>
          <Image
            source={{ uri: item.image[1] || item.image[0] }}
            style={styles.subImage}
            resizeMode="cover"
          />
          <Image
            source={{ uri: item.image[2] || item.image[0] }}
            style={styles.subImage}
            resizeMode="cover"
          />
        </View>
      </View>
      <View style={styles.storeFooter}>
        <View style={styles.ratingContainer}>
          <Icon
            name="star"
            size={14}
            color={MAIN_COLOR}
            style={{ marginRight: 2 }}
          />
          <Text style={styles.ratingScore}>{item.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({item.reviews}+)</Text>
        </View>
        <View style={styles.distanceContainer}>
          <Icon
            name="location-sharp"
            size={14}
            color="#AAA"
            style={{ marginRight: 2 }}
          />
          <Text style={styles.distanceText}>0.8km</Text>
        </View>
      </View>
      <View style={styles.separator} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <FixedSearchBar />

      <View style={{ flex: 1, position: 'relative' }}>
        <StickyOneRowCategory />

        {selectedCategory === '전체' ? (
          <Animated.FlatList
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true },
            )}
            scrollEventThrottle={16}
            data={Object.entries(groupedStores)}
            keyExtractor={item => item[0]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
            ListHeaderComponent={MainGridHeader}
            renderItem={({ item }) => (
              <CategorySection
                key={item[0]}
                category={item[0]}
                stores={[...item[1]].sort((a, b) => b.rating - a.rating)}
              />
            )}
            ListEmptyComponent={
              loading ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text>맛집 정보를 불러오는 중입니다...</Text>
                </View>
              ) : (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text>등록된 맛집이 없습니다.</Text>
                </View>
              )
            }
          />
        ) : (
          <Animated.FlatList<Store>
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true },
            )}
            scrollEventThrottle={16}
            data={getStoresByCategoryWrapper(selectedCategory)}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
            ListHeaderComponent={MainGridHeader}
            renderItem={renderStoreListItem}
            ListEmptyComponent={
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text>해당 카테고리의 맛집이 없습니다.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default UserMain;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  fixedHeader: {
    backgroundColor: '#fff',
    borderBottomColor: '#F5F5F5',
    zIndex: 100,
    paddingBottom: 10,
  },
  headerTitleWrap: { alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  
  // [수정] 검색창 너비: 전체 너비에서 60 (30*2) 제외
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: MAIN_COLOR,
    borderRadius: 8,
    width: width - (SCREEN_PADDING * 2), 
    height: 44,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  
  // [수정] 상단 헤더 아이콘들 좌우 여백 30
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 10,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 8 },
  placeholderText: { flex: 1, fontSize: 14, color: '#BBB' },
  notificationButton: { padding: 4 },

  stickyCategoryContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    zIndex: 50,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  // [수정] 스티키 헤더 타이틀 여백 30
  stickyTitleWrap: { marginTop: 4, marginBottom: 10, paddingLeft: SCREEN_PADDING },

  // [수정] 카테고리 그리드 좌우 여백 30
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SCREEN_PADDING,
    justifyContent: 'space-between',
    marginTop: 6,
  },
  gridItem: {
    width: '18%',
    aspectRatio: 0.85,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderRadius: 12,
  },
  gridItemSelected: { backgroundColor: '#FFF4E6' },
  icon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    marginBottom: 6,
  },
  iconSelected: { tintColor: '#FFA847' },
  gridText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  gridTextSelected: { color: '#FFA847', fontWeight: '700' },

  // [수정] 추천 섹션 제목 여백 30
  recommendHeader: { marginLeft: SCREEN_PADDING, marginBottom: 20 },
  recommendTitle: { fontSize: 18, fontWeight: '800', color: '#000' },
  subTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
    marginLeft: SCREEN_PADDING, // [수정] 좌측 마진 30
  },
  subTitleSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginTop: 4,
    marginBottom: 10,
  },

  categorySection: { marginBottom: 24, paddingLeft: 0 },
  
  cardContainer: {
    width: 150,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECECEC',
    paddingBottom: 12,
    marginBottom: 4,
  },
  cardImageWrapper: {
    width: '100%',
    height: 110,
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  cardImage: { width: '100%', height: '100%' },
  rankBadgeAbsolute: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: { paddingHorizontal: 10 },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000',
    marginBottom: 4,
  },
  cardInfoRow: { flexDirection: 'row', alignItems: 'center' },
  ratingScore: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginLeft: 2,
    marginRight: 2,
  },
  reviewCountShort: { fontSize: 12, color: '#999' },

  // [수정] 세로 리스트 아이템 좌우 여백 30
  storeContainer: {
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  storeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  rankTextWhite: { color: '#fff', fontSize: 13, fontWeight: '800' },
  storeName: { fontSize: 18, fontWeight: '800', color: '#000' },
  imageGrid: {
    flexDirection: 'row',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mainImage: { flex: 2, height: '100%', marginRight: 4 },
  subImageColumn: { flex: 1, justifyContent: 'space-between' },
  subImage: { width: '100%', height: '49.5%', borderRadius: 0 },

  storeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  reviewCount: { fontSize: 13, color: '#999' },
  distanceContainer: { flexDirection: 'row', alignItems: 'center' },
  distanceText: { fontSize: 13, color: '#888' },
  separator: { height: 1, backgroundColor: '#F5F5F5', marginTop: 20 },

  scrollTrack: {
    width: TRACK_WIDTH,
    height: 6,
    backgroundColor: '#F0F0F0',
    alignSelf: 'center',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  scrollThumb: {
    height: '100%',
    backgroundColor: '#FFA847',
    borderRadius: 3,
  },

  scrollCatItem: { alignItems: 'center', marginHorizontal: 12 },
  scrollCatItemSelected: {},
  iconSmall: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  textSmall: { fontSize: 11, color: '#999' },
  textSelected: { color: '#FFA847', fontWeight: '700' },
  badge: {
    position: "absolute",
    right: -6,
    top: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF3B30",
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
});