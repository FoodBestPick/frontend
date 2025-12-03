import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types/RootStackParamList';
import { ThemeContext } from '../../context/ThemeContext';
import { useSearchViewModel } from '../viewmodels/SearchViewModel';

type Navigation = NativeStackNavigationProp<
  RootStackParamList,
  'SearchResultScreen'
>;
type SearchResultRouteProp = RouteProp<
  RootStackParamList,
  'SearchResultScreen'
>;

const SearchResultScreen = () => {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<SearchResultRouteProp>();
  const { theme } = useContext(ThemeContext);

  // ✅ ViewModel 연결
  const { results, loading, error, searchRestaurants } = useSearchViewModel();
  const { keyword, category, tags, filters } = route.params || {};

  const [sortBy, setSortBy] = useState('추천순');

  useEffect(() => {
    // 필터 파라미터까지 전달
    searchRestaurants(keyword, category, tags, filters);
  }, [keyword, category, tags, filters]);

  const renderRestaurant = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card }]}
      onPress={() =>
        navigation.navigate('RestaurantDetail', { restaurantId: item.id })
      }
      activeOpacity={0.9}
    >
      {index < 3 && (
        <View
          style={[
            styles.rankBadge,
            {
              backgroundColor:
                index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
            },
          ]}
        >
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>
      )}

      {item.images && item.images.length > 0 ? (
        <Image source={{ uri: item.images[0] }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.placeholderImage]}>
          <MaterialIcons name="restaurant" size={40} color="#ccc" />
        </View>
      )}
      
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{item.name}</Text>
        <Text style={[styles.cardCategory, { color: theme.textSecondary }]}>{item.category}</Text>
        <View style={styles.cardRow}>
          <View style={styles.ratingRow}>
            <MaterialIcons name="star" size={14} color="#FFA847" />
            <Text style={[styles.ratingText, { color: theme.textPrimary }]}>
              {item.rating || '0.0'} ({item.reviews || 0}+)
            </Text>
          </View>
          <Text style={[styles.distanceText, { color: theme.textSecondary }]}>
             📍 {item.address || '위치 정보 없음'}
          </Text>
        </View>
        
        {/* 태그가 있다면 표시 (현재 API에는 없지만 UI 유지) */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagRow}>
            {item.tags.map((tag: string, idx: number) => (
              <View key={idx} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />

      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          "{keyword || category || '검색 결과'}"
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 필터 요약 */}
      {(category || (filters && Object.keys(filters).length > 0)) && (
        <View style={[styles.filterSummary, { backgroundColor: theme.isDark ? '#333' : '#FFF4E6' }]}>
          <Text style={styles.filterText}>
            {category || '전체'} 
            {filters?.radius ? ` · ${filters.radius}km` : ''} 
            {filters?.rating ? ` · ⭐${filters.rating}점` : ''}
          </Text>
        </View>
      )}

      <View style={styles.sortRow}>
        <Text style={[styles.resultCount, { color: theme.textPrimary }]}>총 {results.length}개</Text>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={[styles.sortText, { color: theme.textSecondary }]}>{sortBy}</Text>
          <MaterialIcons name="keyboard-arrow-down" size={16} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFA847" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id.toString()}
          renderItem={renderRestaurant}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={{ color: theme.textSecondary, marginTop: 50 }}>검색 결과가 없습니다.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default SearchResultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  filterSummary: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterText: {
    fontSize: 13,
    color: '#FFA847',
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: 'hidden',
  },
  rankBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  rankText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  cardImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 13,
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
  },
  distanceText: {
    fontSize: 13,
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#666',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});