import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types/RootStackParamList';
import { useRestaurantDetailViewModel } from '../viewmodels/RestaurantDetailViewModel';
import { ThemeContext } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

type NavigationProp = StackNavigationProp<RootStackParamList, 'RestaurantDetail'>;
type RouteParamsProp = RouteProp<RootStackParamList, 'RestaurantDetail'>;

const RestaurantDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParamsProp>();
  const { restaurantId } = route.params;
  const { theme } = useContext(ThemeContext);

  // ViewModel 연결
  const { restaurant, loading, error, toggleLike } = useRestaurantDetailViewModel(restaurantId);

  const [activeTab, setActiveTab] = useState('정보');

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${restaurant?.name} - ${restaurant?.address}`,
      });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FFA847" />
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>정보를 불러올 수 없습니다.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#FFA847' }}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 데이터 매핑
  const detailData = {
    name: restaurant.name,
    rating: 0.0, // 백엔드 데이터 없음
    reviews: 0, // 백엔드 데이터 없음
    address: restaurant.address,
    phone: '전화번호 정보 없음', // 백엔드 데이터 없음
    hours: restaurant.times.map(t => ({
      day: t.week,
      time: `${t.startTime} - ${t.endTime}`,
    })),
    restTime: restaurant.times.find(t => t.restTime)?.restTime 
      ? `브레이크타임 ${restaurant.times.find(t => t.restTime)?.restTime}` 
      : '',
    images: restaurant.images.length > 0 ? restaurant.images : ['https://via.placeholder.com/400'],
    menus: restaurant.menus.map(m => ({ name: m.name, price: `${m.price}원` })),
    facilities: restaurant.tags, // 태그를 편의시설 섹션에 표시
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: activeTab === '리뷰' ? 80 : 0 }}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: detailData.images[0] }}
            style={styles.bannerImage}
          />
          <SafeAreaView edges={['top']} style={styles.headerOverlay}>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={styles.rightButtons}>
                <TouchableOpacity style={styles.iconButton} onPress={toggleLike}>
                  <Icon 
                    name={restaurant.isLiked ? "heart" : "heart-outline"} 
                    size={24} 
                    color={restaurant.isLiked ? "#FF6B6B" : "#fff"} 
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                  <Icon name="share-social-outline" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.restaurantName}>{detailData.name}</Text>
          <View style={styles.ratingRow}>
            <Icon name="star" size={18} color="#FFA847" />
            <Text style={styles.ratingText}>
              {detailData.rating} ({detailData.reviews})
            </Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          {['정보', '메뉴', '리뷰'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === '정보' && (
          <View style={styles.contentSection}>
            <View style={styles.detailRow}>
              <Icon name="location-outline" size={20} color="#666" />
              <Text style={styles.detailText}>{detailData.address}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="call-outline" size={20} color="#666" />
              <Text style={styles.detailText}>{detailData.phone}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="time-outline" size={20} color="#666" />
              <View style={styles.timeInfo}>
                {detailData.hours.length > 0 ? (
                  detailData.hours.map((h, idx) => (
                    <Text key={idx} style={styles.detailText}>
                      {h.day} {h.time}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.detailText}>운영 시간 정보 없음</Text>
                )}
                {detailData.restTime ? (
                  <Text style={styles.restTimeText}>{detailData.restTime}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.facilitiesSection}>
              <Text style={styles.sectionTitle}>편의 시설 / 태그</Text>
              <View style={styles.facilitiesGrid}>
                {detailData.facilities.length > 0 ? (
                  detailData.facilities.map((facility, idx) => (
                    <View key={idx} style={styles.facilityChip}>
                      <Icon name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={styles.facilityText}>{facility}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: '#999' }}>등록된 태그가 없습니다.</Text>
                )}
              </View>
            </View>

            <View style={styles.mapSection}>
              <Text style={styles.sectionTitle}>위치</Text>
              <TouchableOpacity style={styles.mapPlaceholder}>
                <Icon name="map-outline" size={40} color="#FFA847" />
                <Text style={styles.mapText}>지도 보기</Text>
                <Text style={styles.addressText}>{detailData.address}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === '메뉴' && (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>대표 메뉴</Text>
            {detailData.menus.length > 0 ? (
              detailData.menus.map((menu, idx) => (
                <View key={idx} style={styles.menuItem}>
                  <Image
                    source={{ uri: 'https://via.placeholder.com/80' }}
                    style={styles.menuImage}
                  />
                  <View style={styles.menuInfo}>
                    <Text style={styles.menuName}>{menu.name}</Text>
                    <Text style={styles.menuPrice}>{menu.price}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>등록된 메뉴가 없습니다.</Text>
            )}
          </View>
        )}

        {activeTab === '리뷰' && (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>리뷰 ({detailData.reviews})</Text>
            <Text style={styles.emptyText}>리뷰가 없습니다</Text>
          </View>
        )}
      </ScrollView>

      {/* ✅ 리뷰 탭일 때만 하단에 리뷰 작성하기 버튼 표시 */}
      {activeTab === '리뷰' && (
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <TouchableOpacity
            style={styles.writeReviewButton}
            onPress={() => {
              // TODO: 리뷰 작성 화면으로 이동
              console.log('리뷰 작성하기');
            }}
          >
            <Icon name="create-outline" size={20} color="#fff" />
            <Text style={styles.footerButtonText}>리뷰 작성하기</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
  );
};

export default RestaurantDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  bannerImage: {
    width: width,
    height: 250,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 15,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFA847',
  },
  tabText: {
    fontSize: 15,
    color: '#999',
  },
  tabTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  contentSection: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  timeInfo: {
    flex: 1,
  },
  restTimeText: {
    fontSize: 13,
    color: '#E74C3C',
    marginTop: 4,
  },
  facilitiesSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  facilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  facilityText: {
    fontSize: 13,
    color: '#333',
  },
  mapSection: {
    marginTop: 24,
  },
  mapPlaceholder: {
    height: 180,
    borderRadius: 12,
    backgroundColor: '#FFF4E6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  mapText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFA847',
    marginTop: 8,
  },
  addressText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  menuInfo: {
    flex: 1,
  },
  menuName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  menuPrice: {
    fontSize: 14,
    color: '#FFA847',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: 16,
    backgroundColor: '#fff',
  },
  writeReviewButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFA847',
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
