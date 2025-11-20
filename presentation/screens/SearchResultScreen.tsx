import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface FilterState {
  location?: string;
  radius?: number;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  openNow?: boolean;
  parking?: boolean;
  delivery?: boolean;
}

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
  SearchResult: {
    query: string;
    filters: FilterState;
  };
  RestaurantDetail: {
    restaurant: RestaurantItem;
  };
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'SearchResult'>;
type RouteParamsProp = RouteProp<RootStackParamList, 'SearchResult'>;

const SearchResultScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParamsProp>();
  const { query, filters } = route.params || { query: '', filters: {} };

  const [sortBy, setSortBy] = useState('추천순');

  const results: RestaurantItem[] = [
    {
      id: 1,
      name: '엽기 떡볶이',
      category: '떡볶이',
      rating: 4.5,
      reviews: 215,
      distance: '0.8km',
      image: 'https://via.placeholder.com/150',
      tags: ['주차', '예약'],
    },
    {
      id: 2,
      name: '두끼',
      category: '떡볶이',
      rating: 4.7,
      reviews: 342,
      distance: '1.2km',
      image: 'https://via.placeholder.com/150',
      tags: ['배달', '포장'],
    },
    {
      id: 3,
      name: '스텔라 떡볶이',
      category: '떡볶이',
      rating: 4.3,
      reviews: 128,
      distance: '2.1km',
      image: 'https://via.placeholder.com/150',
      tags: ['24시간'],
    },
  ];

  const renderRestaurant = ({
    item,
    index,
  }: {
    item: RestaurantItem;
    index: number;
  }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('RestaurantDetail', { restaurant: item })
      }
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

      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <View style={styles.cardRow}>
          <View style={styles.ratingRow}>
            <Icon name="star" size={14} color="#FFA847" />
            <Text style={styles.ratingText}>
              {item.rating} ({item.reviews}+)
            </Text>
          </View>
          <Text style={styles.distanceText}>📍 {item.distance}</Text>
        </View>
        <View style={styles.tagRow}>
          {item.tags.map((tag, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          "{query}"
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {filters && Object.keys(filters).length > 0 && (
        <View style={styles.filterSummary}>
          <Text style={styles.filterText}>
            {filters.category || '전체'} · {filters.radius || 0}km · ⭐
            {filters.rating || 0}점
          </Text>
        </View>
      )}

      <View style={styles.sortRow}>
        <Text style={styles.resultCount}>총 {results.length}개</Text>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortText}>{sortBy}</Text>
          <Icon name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        keyExtractor={item => item.id.toString()}
        renderItem={renderRestaurant}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

export default SearchResultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  filterSummary: {
    backgroundColor: '#FFF4E6',
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
    color: '#000',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 14,
    color: '#666',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
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
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 13,
    color: '#999',
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
    color: '#333',
  },
  distanceText: {
    fontSize: 13,
    color: '#777',
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
});
