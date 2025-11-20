import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const { width } = Dimensions.get('window');

interface RestaurantItem {
  id: number;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  distance: string;
  image: string;
  tags: string[];
}

type RootStackParamList = {
  RestaurantDetail: {
    restaurant: RestaurantItem;
  };
};

type NavigationProp = StackNavigationProp<
  RootStackParamList,
  'RestaurantDetail'
>;
type RouteParamsProp = RouteProp<RootStackParamList, 'RestaurantDetail'>;

const RestaurantDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParamsProp>();
  const { restaurant } = route.params;

  const [activeTab, setActiveTab] = useState('정보');

  const detailData = {
    name: restaurant.name,
    rating: restaurant.rating,
    reviews: restaurant.reviews,
    address: '서울시 마포구 어울마당로 123, 1층',
    phone: '02-123-4567',
    hours: [
      { day: '평일', time: '11:30 - 22:00' },
      { day: '주말', time: '11:30 - 23:00' },
    ],
    restTime: '브레이크타임 15:00 - 17:00',
    images: [restaurant.image],
    menus: [
      { name: '기본 떡볶이', price: '20,000원' },
      { name: '마라 떡볶이', price: '12,000원' },
      { name: '로제 떡볶이', price: '10,000원' },
    ],
    facilities: ['주차 가능', 'Wi-Fi 제공', '예약 가능', '포장 가능'],
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView showsVerticalScrollIndicator={false}>
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
                <TouchableOpacity style={styles.iconButton}>
                  <Icon name="heart-outline" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
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
                {detailData.hours.map((h, idx) => (
                  <Text key={idx} style={styles.detailText}>
                    {h.day} {h.time}
                  </Text>
                ))}
                <Text style={styles.restTimeText}>{detailData.restTime}</Text>
              </View>
            </View>

            <View style={styles.facilitiesSection}>
              <Text style={styles.sectionTitle}>편의 시설</Text>
              <View style={styles.facilitiesGrid}>
                {detailData.facilities.map((facility, idx) => (
                  <View key={idx} style={styles.facilityChip}>
                    <Icon name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.facilityText}>{facility}</Text>
                  </View>
                ))}
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
            {detailData.menus.map((menu, idx) => (
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
            ))}
          </View>
        )}

        {activeTab === '리뷰' && (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>리뷰 ({detailData.reviews})</Text>
            <Text style={styles.emptyText}>리뷰가 없습니다</Text>
          </View>
        )}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <TouchableOpacity style={styles.callButton}>
          <Icon name="call" size={20} color="#fff" />
          <Text style={styles.footerButtonText}>전화</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reserveButton}>
          <Icon name="calendar" size={20} color="#fff" />
          <Text style={styles.footerButtonText}>예약</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default RestaurantDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  reserveButton: {
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
