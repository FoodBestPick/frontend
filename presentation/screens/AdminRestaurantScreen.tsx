import React, { useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types/RootStackParamList';
import { Header } from '../components/Header';
import { ThemeContext } from '../../context/ThemeContext';
import { useAdminRestaurantViewModel } from '../viewmodels/AdminRestaurantViewModels';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export const AdminRestaurantScreen = () => {
  const navigation = useNavigation<Navigation>();
  const { theme } = useContext(ThemeContext);

  // ✅ ViewModel 연결
  const {
    restaurants,
    loading,
    error,
    keyword,
    selectedIds,
    search,
    toggleSelection,
    selectAll,
    deleteRestaurant,
    refresh,
  } = useAdminRestaurantViewModel();

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [])
  );

  const handleDelete = (id: number, name: string) => {
    Alert.alert('삭제 확인', `"${name}"을(를) 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          const result = await deleteRestaurant(id);
          if (result.success) {
            Alert.alert('성공', result.message);
          } else {
            Alert.alert('실패', result.message);
          }
        },
      },
    ]);
  };

  const handleEdit = (id: number) => {
    // 수정 화면으로 이동 (id 전달)
    navigation.navigate('AdminRestaurantAdd', { id });
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = selectedIds.includes(item.id);
    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        {/* 체크박스 */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => toggleSelection(item.id)}
        >
          <MaterialIcons
            name={isSelected ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color={isSelected ? theme.icon : theme.textSecondary}
          />
        </TouchableOpacity>

        <Image
          source={{ uri: item.images?.[0] || 'https://via.placeholder.com/100' }}
          style={styles.cardImage}
        />
        <View style={styles.cardContent}>
          <View style={styles.textContainer}>
            <Text
              style={[styles.name, { color: theme.textPrimary }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text style={[styles.category, { color: theme.textSecondary }]}>
              {item.category}
            </Text>
            <Text
              style={[styles.address, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {item.address || '주소 없음'}
            </Text>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => handleEdit(item.id)}
            >
              <MaterialIcons name="edit" size={20} color={theme.icon} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => handleDelete(item.id, item.name)}
            >
              <MaterialIcons name="delete-outline" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="맛집 관리" showBackButton />

      {/* 검색바 & 필터 */}
      <View style={[styles.searchBarContainer, { backgroundColor: theme.card }]}>
        <MaterialIcons name="search" size={24} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          placeholder="맛집 이름, 카테고리 검색..."
          placeholderTextColor={theme.textSecondary}
          value={keyword}
          onChangeText={search}
        />
      </View>

      {/* 전체 선택 및 상단 액션 */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.selectAllBtn} onPress={selectAll}>
          <MaterialIcons
            name={
              selectedIds.length === restaurants.length && restaurants.length > 0
                ? 'check-box'
                : 'check-box-outline-blank'
            }
            size={24}
            color={theme.textPrimary}
          />
          <Text style={[styles.selectAllText, { color: theme.textPrimary }]}>
            전체 선택 ({selectedIds.length})
          </Text>
        </TouchableOpacity>
        {/* 여기에 필터 버튼 등을 추가할 수 있음 */}
      </View>

      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.icon}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={restaurants}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={() => refresh(keyword)}
          ListEmptyComponent={
            <Text style={styles.emptyText}>등록된 맛집이 없습니다.</Text>
          }
        />
      )}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.icon }]}
        onPress={() => navigation.navigate('AdminRestaurantAdd')}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { marginTop: 20 },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 48,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  list: { paddingHorizontal: 16, paddingBottom: 80 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  iconBtn: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 10,
  },
});
