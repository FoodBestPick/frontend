import React, { useState, useContext, useCallback } from 'react';
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
  Alert,
  Linking,
  Platform,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types/RootStackParamList';
import { useRestaurantDetailViewModel } from '../viewmodels/RestaurantDetailViewModel';
import { ThemeContext } from '../../context/ThemeContext';
import ReportModal from '../components/ReportModal';
import Swiper from 'react-native-swiper';

const { width } = Dimensions.get('window');

type NavigationProp = StackNavigationProp<RootStackParamList, 'RestaurantDetail'>;
type RouteParamsProp = RouteProp<RootStackParamList, 'RestaurantDetail'>;

const RestaurantDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParamsProp>();
  const { restaurantId } = route.params;
  const { theme } = useContext(ThemeContext);

  // ViewModel 연결
  const { restaurant, loading, error, toggleLike, deleteReview, toggleReviewLike, refresh, reportRestaurant, reportReview } = useRestaurantDetailViewModel(restaurantId);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const [activeTab, setActiveTab] = useState('정보');
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [reportTargetName, setReportTargetName] = useState('');

  const handleReportClick = (reviewId?: number, targetName?: string) => {
    if (reviewId) {
      setSelectedReviewId(reviewId);
      setReportTargetName(targetName || '리뷰');
    } else {
      setSelectedReviewId(null);
      setReportTargetName(restaurant?.name || '');
    }
    setReportModalVisible(true);
  };

  const handleDeleteReview = (reviewId: number) => {
    Alert.alert('리뷰 삭제', '정말로 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          const success = await deleteReview(reviewId);
          if (success) {
            Alert.alert('알림', '리뷰가 삭제되었습니다.');
          } else {
            Alert.alert('오류', '리뷰 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const handleEditReview = (review: any) => {
    navigation.navigate('ReviewWrite', {
      restaurantId: restaurantId,
      restaurantName: restaurant?.name || '',
      review: review,
    });
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
          <Text style={styles.goBackText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 데이터 매핑
  const detailData = {
    name: restaurant.name,
    rating: restaurant.averageRating || 0.0,
    reviews: restaurant.reviewCount || 0,
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
    reviewsList: restaurant.reviews || [],
  };

  const openKakaoMap = () => {
    if (!restaurant.latitude || !restaurant.longitude) {
      Alert.alert('알림', '위치 정보가 없습니다.');
      return;
    }
    
    const lat = Number(restaurant.latitude);
    const lng = Number(restaurant.longitude);
    const label = encodeURIComponent(restaurant.name);
    
    // 카카오맵 URL 스킴 (검색으로 마커 표시 시도)
    const kakaoMapUrl = `kakaomap://search?q=${label}&p=${lat},${lng}`;
    // 웹 URL (설치 안되어 있을 경우 대비)
    const webUrl = `https://map.kakao.com/link/map/${label},${lat},${lng}`;

    Linking.canOpenURL(kakaoMapUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(kakaoMapUrl);
        } else {
          return Linking.openURL(webUrl);
        }
      })
      .catch(err => {
        console.error('An error occurred', err);
        Linking.openURL(webUrl);
      });
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
        contentContainerStyle={[styles.scrollContent, activeTab === '리뷰' && styles.scrollContentWithFooter]}
      >
        <View style={styles.imageContainer}>
          {detailData.images.length > 1 ? (
            <Swiper
              style={styles.wrapper}
              showsButtons={false}
              autoplay={true}
              autoplayTimeout={4}
              dotStyle={{ backgroundColor: 'rgba(255,255,255,0.3)', width: 8, height: 8 }}
              activeDotStyle={{ backgroundColor: '#FFA847', width: 8, height: 8 }}
            >
              {detailData.images.map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img }}
                  style={styles.bannerImage}
                />
              ))}
            </Swiper>
          ) : (
            <Image
              source={{ uri: detailData.images[0] }}
              style={styles.bannerImage}
            />
          )}
          
          <SafeAreaView edges={['top']} style={styles.headerOverlay}>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={styles.rightButtons}>
                <TouchableOpacity 
                  style={[styles.iconButton, { marginRight: 8 }]} 
                  onPress={() => handleReportClick()}
                >
                  <Icon name="alert-circle-outline" size={24} color="#FFA847" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={toggleLike}>
                  <Icon 
                    name={restaurant.isLiked ? "heart" : "heart-outline"} 
                    size={24} 
                    color={restaurant.isLiked ? "#FF6B6B" : "#fff"} 
                  />
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
            <TouchableOpacity style={styles.mapButton} onPress={openKakaoMap}>
              <Icon name="map-outline" size={16} color="#FFA847" />
              <Text style={styles.mapButtonText}>지도 보기</Text>
            </TouchableOpacity>
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
                  <Text style={styles.emptyTagText}>등록된 태그가 없습니다.</Text>
                )}
              </View>
            </View>

            <View style={styles.mapSection}>
              <Text style={styles.sectionTitle}>위치</Text>
              <TouchableOpacity style={styles.mapPlaceholder} onPress={openKakaoMap}>
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
            {detailData.reviewsList.length > 0 ? (
              detailData.reviewsList.map((review) => (
                <View key={review.id} style={styles.reviewContainer}>
                  <View style={styles.reviewHeader}>
                    <Image 
                      source={{ uri: review.userProfileImage || 'https://via.placeholder.com/40' }} 
                      style={styles.reviewerImage} 
                    />
                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewerName}>{review.userNickname}</Text>
                      <View style={styles.reviewRatingRow}>
                        {[1,2,3,4,5].map(s => (
                          <Icon key={s} name={s <= review.rating ? "star" : "star-outline"} size={12} color="#FFA847" />
                        ))}
                        <Text style={styles.reviewDate}>{review.createdAt}</Text>
                      </View>
                    </View>
                    {review.isMine ? (
                      <View style={styles.reviewActions}>
                        <TouchableOpacity onPress={() => handleEditReview(review)} style={styles.actionButton}>
                          <Text style={styles.actionText}>수정</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteReview(review.id)} style={styles.actionButton}>
                          <Text style={styles.deleteActionText}>삭제</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.reviewActions}>
                        <TouchableOpacity onPress={() => handleReportClick(review.id, `${review.userNickname}님의 리뷰`)} style={styles.actionButton}>
                          <Text style={[styles.actionText, { color: '#FF6B6B' }]}>신고</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  <Text style={styles.reviewContent}>{review.content}</Text>
                  {review.images && review.images.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImageScroll}>
                      {review.images.map((img, i) => (
                        <Image key={i} source={{ uri: img }} style={styles.reviewImage} />
                      ))}
                    </ScrollView>
                  )}
                  
                  {/* ✅ 리뷰 좋아요 버튼 추가 */}
                  <View style={styles.reviewFooter}>
                    <TouchableOpacity 
                      style={styles.likeButton} 
                      onPress={() => toggleReviewLike(review.id)}
                    >
                      <Icon 
                        name={review.isLiked ? "heart" : "heart-outline"} 
                        size={16} 
                        color={review.isLiked ? "#FF6B6B" : "#999"} 
                      />
                      <Text style={[styles.likeCount, review.isLiked && { color: "#FF6B6B" }]}>
                        {review.likeCount > 0 ? review.likeCount : '좋아요'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>리뷰가 없습니다</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* ✅ 리뷰 탭일 때만 하단에 리뷰 작성하기 버튼 표시 */}
      {activeTab === '리뷰' && (
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <TouchableOpacity
            style={styles.writeReviewButton}
            onPress={() => {
              navigation.navigate('ReviewWrite', {
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
              });
            }}
          >
            <Icon name="create-outline" size={20} color="#fff" />
            <Text style={styles.footerButtonText}>리뷰 작성하기</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}

      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        onSubmit={(reason, detail) => {
          if (selectedReviewId) {
            reportReview(selectedReviewId, reason, detail);
          } else {
            reportRestaurant(reason, detail);
          }
          setReportModalVisible(false);
        }}
        targetName={reportTargetName}
      />
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
    height: 250,
  },
  bannerImage: {
    width: width,
    height: 250,
    resizeMode: 'cover',
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
  wrapper: {
    height: 250,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 168, 71, 0.1)',
    borderRadius: 12,
  },
  mapButtonText: {
    fontSize: 12,
    color: '#FFA847',
    marginLeft: 4,
    fontWeight: '600',
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
  reviewContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  reviewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginLeft: 6,
  },
  reviewContent: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 10,
  },
  reviewImageScroll: {
    flexDirection: 'row',
    marginTop: 8,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  reviewFooter: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    gap: 4,
  },
  likeCount: {
    fontSize: 12,
    color: '#666',
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#999',
  },
  deleteActionText: {
    fontSize: 12,
    color: '#FF6B6B',
  },
  goBackButton: {
    marginTop: 20,
  },
  goBackText: {
    color: '#FFA847',
  },
  scrollContent: {
    paddingBottom: 0,
  },
  scrollContentWithFooter: {
    paddingBottom: 80,
  },
  emptyTagText: {
    color: '#999',
  },
});
