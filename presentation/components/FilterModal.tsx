import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

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

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedFilters: Partial<FilterState>;
  onApply: (filters: FilterState) => void;
}

export const FilterModal = ({
  visible,
  onClose,
  selectedFilters,
  onApply,
}: FilterModalProps) => {
  const [filters, setFilters] = useState<FilterState>({
    location: selectedFilters.location || '현재 위치',
    radius: selectedFilters.radius || 2,
    category: selectedFilters.category || '',
    priceMin: selectedFilters.priceMin || 5000,
    priceMax: selectedFilters.priceMax || 50000,
    rating: selectedFilters.rating || 0,
    openNow: selectedFilters.openNow || false,
    parking: selectedFilters.parking || false,
    delivery: selectedFilters.delivery || false,
  });

  const categories = [
    '한식',
    '중식',
    '일식',
    '양식',
    '분식',
    '카페',
    '패스트푸드',
    '치킨',
  ];

  const radiusOptions = [0.5, 1, 2, 3, 5, 10];

  const priceRanges = [
    { label: '5천원', value: 5000 },
    { label: '1만원', value: 10000 },
    { label: '2만원', value: 20000 },
    { label: '3만원', value: 30000 },
    { label: '5만원', value: 50000 },
  ];

  const handleReset = () => {
    setFilters({
      location: '현재 위치',
      radius: 2,
      category: '',
      priceMin: 5000,
      priceMax: 50000,
      rating: 0,
      openNow: false,
      parking: false,
      delivery: false,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>맛집 필터</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>초기화</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 위치 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>위치 선택</Text>
            <TouchableOpacity style={styles.locationButton}>
              <Icon name="location-outline" size={18} color="#FFA847" />
              <Text style={styles.locationText}>{filters.location}</Text>
              <Icon name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>

            <Text style={styles.label}>반경 선택</Text>
            <View style={styles.radiusGrid}>
              {radiusOptions.map(radius => (
                <TouchableOpacity
                  key={radius}
                  style={[
                    styles.radiusChip,
                    filters.radius === radius && styles.radiusChipActive,
                  ]}
                  onPress={() => setFilters({ ...filters, radius })}
                >
                  <Text
                    style={[
                      styles.radiusText,
                      filters.radius === radius && styles.radiusTextActive,
                    ]}
                  >
                    {radius}km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 카테고리 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>음식 종류</Text>
            <View style={styles.categoryGrid}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    filters.category === cat && styles.categoryChipActive,
                  ]}
                  onPress={() =>
                    setFilters({
                      ...filters,
                      category: filters.category === cat ? '' : cat,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.categoryText,
                      filters.category === cat && styles.categoryTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 가격대 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>가격대</Text>
            <View style={styles.priceRow}>
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>최소</Text>
                <Text style={styles.priceValue}>
                  {filters.priceMin.toLocaleString()}원
                </Text>
              </View>
              <Text style={styles.priceSeparator}>~</Text>
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>최대</Text>
                <Text style={styles.priceValue}>
                  {filters.priceMax.toLocaleString()}원
                </Text>
              </View>
            </View>
            <View style={styles.priceButtons}>
              {priceRanges.map(range => (
                <TouchableOpacity
                  key={range.value}
                  style={[
                    styles.priceButton,
                    filters.priceMax === range.value &&
                      styles.priceButtonActive,
                  ]}
                  onPress={() =>
                    setFilters({ ...filters, priceMax: range.value })
                  }
                >
                  <Text
                    style={[
                      styles.priceButtonText,
                      filters.priceMax === range.value &&
                        styles.priceButtonTextActive,
                    ]}
                  >
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 평점 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>평점</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity
                  key={star}
                  style={styles.starButton}
                  onPress={() => setFilters({ ...filters, rating: star })}
                >
                  <Icon
                    name={filters.rating >= star ? 'star' : 'star-outline'}
                    size={32}
                    color="#FFA847"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 편의 시설 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>편의 시설</Text>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() =>
                setFilters({ ...filters, openNow: !filters.openNow })
              }
            >
              <Icon
                name={filters.openNow ? 'checkbox' : 'square-outline'}
                size={22}
                color={filters.openNow ? '#FFA847' : '#999'}
              />
              <Text style={styles.checkboxText}>영업 중</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() =>
                setFilters({ ...filters, parking: !filters.parking })
              }
            >
              <Icon
                name={filters.parking ? 'checkbox' : 'square-outline'}
                size={22}
                color={filters.parking ? '#FFA847' : '#999'}
              />
              <Text style={styles.checkboxText}>주차 가능</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() =>
                setFilters({ ...filters, delivery: !filters.delivery })
              }
            >
              <Icon
                name={filters.delivery ? 'checkbox' : 'square-outline'}
                size={22}
                color={filters.delivery ? '#FFA847' : '#999'}
              />
              <Text style={styles.checkboxText}>배달 가능</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => onApply(filters)}
          >
            <Text style={styles.applyText}>적용하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginTop: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  resetText: {
    fontSize: 14,
    color: '#FFA847',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  locationText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#000',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  radiusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radiusChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  radiusChipActive: {
    backgroundColor: '#FFA847',
    borderColor: '#FFA847',
  },
  radiusText: {
    fontSize: 14,
    color: '#666',
  },
  radiusTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  categoryChipActive: {
    backgroundColor: '#FFA847',
    borderColor: '#FFA847',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceBox: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  priceSeparator: {
    fontSize: 16,
    color: '#999',
    marginHorizontal: 12,
  },
  priceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  priceButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  priceButtonActive: {
    backgroundColor: '#FFF4E6',
    borderColor: '#FFA847',
  },
  priceButtonText: {
    fontSize: 13,
    color: '#666',
  },
  priceButtonTextActive: {
    color: '#FFA847',
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkboxText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  applyButton: {
    backgroundColor: '#FFA847',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
