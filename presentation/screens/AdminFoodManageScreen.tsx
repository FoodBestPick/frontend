import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../components/Header';
import { ThemeContext } from '../../context/ThemeContext';
import { useAdminFoodViewModel } from '../viewmodels/AdminFoodViewModel';
import Ionicons from 'react-native-vector-icons/Ionicons';

export const AdminFoodManageScreen = () => {
  const { theme } = useContext(ThemeContext);
  const { foods, loading, error, createFood, updateFood, deleteFood, refresh } =
    useAdminFoodViewModel();

  const [newFoodName, setNewFoodName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreate = async () => {
    if (!newFoodName.trim()) {
      Alert.alert('입력 오류', '대표메뉴명을 입력하세요.');
      return;
    }

    const result = await createFood(newFoodName.trim());
    if (result.success) {
      Alert.alert('성공', '대표메뉴가 추가되었습니다.');
      setNewFoodName('');
      refresh();
    } else {
      Alert.alert('오류', result.message);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) {
      Alert.alert('입력 오류', '대표메뉴명을 입력하세요.');
      return;
    }

    const result = await updateFood(id, editingName.trim());
    if (result.success) {
      Alert.alert('성공', '대표메뉴가 수정되었습니다.');
      setEditingId(null);
      setEditingName('');
      refresh();
    } else {
      Alert.alert('오류', result.message);
    }
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert('삭제 확인', `"${name}" 대표메뉴를 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          const result = await deleteFood(id);
          if (result.success) {
            Alert.alert('성공', '대표메뉴가 삭제되었습니다.');
            refresh();
          } else {
            Alert.alert('오류', result.message);
          }
        },
      },
    ]);
  };

  if (loading && foods.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title="대표메뉴 관리" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.icon} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title="대표메뉴 관리" showBackButton />
        <View style={styles.errorContainer}>
          <Text style={{ color: theme.textPrimary }}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.icon }]}
            onPress={refresh}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="대표메뉴 관리" showBackButton />

      {/* 추가 입력란 */}
      <View style={[styles.addSection, { backgroundColor: theme.card }]}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.background,
              borderColor: theme.border,
              color: theme.textPrimary,
            },
          ]}
          placeholder="새 대표메뉴명 (예: 김치찌개, 짜장면, 초밥 등)"
          placeholderTextColor={theme.textSecondary}
          value={newFoodName}
          onChangeText={setNewFoodName}
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.icon }]}
          onPress={handleCreate}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 대표메뉴 목록 */}
      <FlatList
        data={foods}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="restaurant-outline"
              size={48}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              등록된 대표메뉴가 없습니다
            </Text>
            <Text style={[styles.emptySubText, { color: theme.textSecondary }]}>
              맛집의 대표메뉴를 추가해보세요!
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.foodCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            {editingId === item.id ? (
              // 수정 모드
              <>
                <TextInput
                  style={[
                    styles.editInput,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                      color: theme.textPrimary,
                    },
                  ]}
                  value={editingName}
                  onChangeText={setEditingName}
                  autoFocus
                />
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.icon }]}
                    onPress={() => handleUpdate(item.id)}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>
                      저장
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: theme.border }]}
                    onPress={() => {
                      setEditingId(null);
                      setEditingName('');
                    }}
                  >
                    <Text style={{ color: theme.textPrimary }}>취소</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // 일반 모드
              <>
                <View style={styles.foodInfo}>
                  <Ionicons name="restaurant" size={20} color={theme.icon} />
                  <Text style={[styles.foodName, { color: theme.textPrimary }]}>
                    {item.name}
                  </Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingId(item.id);
                      setEditingName(item.name);
                    }}
                  >
                    <Ionicons name="pencil" size={20} color={theme.icon} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id, item.name)}
                  >
                    <Ionicons name="trash" size={20} color="#EF5350" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    borderBottomWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubText: {
    marginTop: 4,
    fontSize: 13,
  },
  foodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  foodInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 10,
  },
  saveButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
});
