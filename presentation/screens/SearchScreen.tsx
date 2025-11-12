import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FilterModal } from '../components/FilterModal';

type RootStackParamList = {
  SearchScreen: undefined;
  SearchResult: {
    query: string;
    filters: FilterState;
  };
};

interface FilterState {
  location: string;
  radius: number;
  category: string;
  priceMin: number;
  priceMax: number;
  rating: number;
  openNow: boolean;
  parking: boolean;
  delivery: boolean;
}

type NavigationProp = StackNavigationProp<RootStackParamList, 'SearchScreen'>;

const SearchScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Partial<FilterState>>(
    {},
  );

  const recentSearches = ['떡볶이', '김치찌개', '파스타', '초밥'];

  const popularSearches = [
    { rank: 1, term: '떡볶이', trend: 'up' as const },
    { rank: 2, term: '김치찌개', trend: 'same' as const },
    { rank: 3, term: '파스타', trend: 'up' as const },
    { rank: 4, term: '초밥', trend: 'down' as const },
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('SearchResult', {
        query: searchQuery,
        filters: selectedFilters as FilterState,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>검색</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchBar}>
        <Icon name="search-outline" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="맛집 메뉴를 검색해보세요"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setFilterVisible(true)}
      >
        <Icon name="options-outline" size={18} color="#FFA847" />
        <Text style={styles.filterText}>상세 검색</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>최근 검색어</Text>
            <TouchableOpacity>
              <Text style={styles.clearText}>전체 삭제</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chipContainer}>
            {recentSearches.map((term, index) => (
              <TouchableOpacity
                key={index}
                style={styles.chip}
                onPress={() => {
                  setSearchQuery(term);
                }}
              >
                <Text style={styles.chipText}>{term}</Text>
                <Icon name="close" size={14} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>인기 검색어</Text>
          {popularSearches.map(item => (
            <TouchableOpacity
              key={item.rank}
              style={styles.rankItem}
              onPress={() => {
                setSearchQuery(item.term);
              }}
            >
              <Text
                style={[
                  styles.rankNumber,
                  item.rank <= 3 && styles.rankNumberTop,
                ]}
              >
                {item.rank}
              </Text>
              <Text style={styles.rankTerm}>{item.term}</Text>
              <Icon
                name={
                  item.trend === 'up'
                    ? 'arrow-up'
                    : item.trend === 'down'
                    ? 'arrow-down'
                    : 'remove'
                }
                size={16}
                color={
                  item.trend === 'up'
                    ? '#2ECC71'
                    : item.trend === 'down'
                    ? '#E74C3C'
                    : '#999'
                }
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        selectedFilters={selectedFilters}
        onApply={filters => {
          setSelectedFilters(filters);
          setFilterVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

export default SearchScreen;

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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#000',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF4E6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterText: {
    color: '#FFA847',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  clearText: {
    fontSize: 13,
    color: '#999',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  chipText: {
    fontSize: 14,
    color: '#333',
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rankNumber: {
    width: 24,
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  rankNumberTop: {
    color: '#FFA847',
    fontWeight: '700',
  },
  rankTerm: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    marginLeft: 12,
  },
});
