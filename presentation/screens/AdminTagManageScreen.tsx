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
import {
  useAdminTagViewModel,
  TAG_PREFIXES,
} from '../viewmodels/AdminTagViewModel';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAG_CATEGORIES = [
  { id: 'PURPOSE', name: '목적', color: '#64B5F6', prefix: '#' },
  { id: 'FACILITY', name: '편의시설', color: '#FFB74D', prefix: '$' },
  { id: 'ATMOSPHERE', name: '분위기', color: '#81C784', prefix: '@' },
];

export const AdminTagManageScreen = () => {
  const { theme } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const { tags, loading, error, createTag, updateTag, deleteTag, refresh } =
    useAdminTagViewModel();

  const [selectedCategory, setSelectedCategory] = useState<string>('PURPOSE');
  const [newTagName, setNewTagName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const currentPrefix =
    TAG_CATEGORIES.find(c => c.id === selectedCategory)?.prefix || '#';
  const filteredTags = tags.filter(t => t.category === selectedCategory);

  // ✅ 접두사 제거 함수
  const removePrefix = (name: string, prefix: string) => {
    return name.startsWith(prefix) ? name.slice(prefix.length) : name;
  };

  const handleCreate = async () => {
    const trimmedName = newTagName.trim();

    if (!trimmedName) {
      Alert.alert('입력 오류', '태그명을 입력하세요.');
      return;
    }

    // ✅ 접두사가 이미 있으면 제거
    const nameWithoutPrefix = removePrefix(trimmedName, currentPrefix);

    const result = await createTag(nameWithoutPrefix, selectedCategory);
    if (result.success) {
      Alert.alert('성공', '태그가 추가되었습니다.');
      setNewTagName('');
      refresh();
    } else {
      Alert.alert('오류', result.message);
    }
  };

  const handleUpdate = async (id: number) => {
    const trimmedName = editingName.trim();

    if (!trimmedName) {
      Alert.alert('입력 오류', '태그명을 입력하세요.');
      return;
    }

    // ✅ 접두사가 이미 있으면 제거
    const nameWithoutPrefix = removePrefix(trimmedName, currentPrefix);

    const result = await updateTag(id, nameWithoutPrefix, selectedCategory);
    if (result.success) {
      Alert.alert('성공', '태그가 수정되었습니다.');
      setEditingId(null);
      setEditingName('');
      refresh();
    } else {
      Alert.alert('오류', result.message);
    }
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert('삭제 확인', `"${name}" 태그를 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          const result = await deleteTag(id);
          if (result.success) {
            Alert.alert('성공', '태그가 삭제되었습니다.');
            refresh();
          } else {
            Alert.alert('오류', result.message);
          }
        },
      },
    ]);
  };

  const startEditing = (id: number, name: string) => {
    setEditingId(id);
    // ✅ 수정 시 접두사 제거된 상태로 표시
    setEditingName(removePrefix(name, currentPrefix));
  };

  if (loading && tags.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title="태그 관리" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.icon} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="태그 관리" showBackButton />

      {/* 카테고리 탭 */}
      <View style={[styles.tabContainer, { backgroundColor: theme.card }]}>
        {TAG_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.tabButton,
              {
                backgroundColor:
                  selectedCategory === cat.id ? cat.color : theme.background,
              },
            ]}
            onPress={() => {
              setSelectedCategory(cat.id);
              setNewTagName(''); // ✅ 카테고리 변경 시 입력 초기화
            }}
          >
            <Text
              style={{
                color: selectedCategory === cat.id ? '#fff' : theme.textPrimary,
                fontWeight: '600',
              }}
            >
              {cat.prefix} {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ✅ 접두사 설명 */}
      <View style={[styles.prefixInfo, { backgroundColor: theme.card }]}>
        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
          💡 태그는 자동으로{' '}
          <Text style={{ fontWeight: '700', color: theme.textPrimary }}>
            {currentPrefix}
          </Text>{' '}
          기호가 앞에 붙습니다
        </Text>
      </View>

      {/* 추가 입력란 */}
      <View style={[styles.addSection, { backgroundColor: theme.card }]}>
        {/* ✅ 접두사 표시 */}
        <View style={styles.inputWrapper}>
          <Text
            style={[
              styles.prefixText,
              {
                color: TAG_CATEGORIES.find(c => c.id === selectedCategory)
                  ?.color,
              },
            ]}
          >
            {currentPrefix}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.textPrimary,
              },
            ]}
            placeholder={`새 ${
              TAG_CATEGORIES.find(c => c.id === selectedCategory)?.name
            } 태그`}
            placeholderTextColor={theme.textSecondary}
            value={newTagName}
            onChangeText={setNewTagName}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.addButton,
            {
              backgroundColor:
                TAG_CATEGORIES.find(c => c.id === selectedCategory)?.color ||
                theme.icon,
            },
          ]}
          onPress={handleCreate}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 태그 목록 */}
      <FlatList
        data={filteredTags}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 16 }
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: theme.textSecondary }}>
              등록된 태그가 없습니다
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.tagCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            {editingId === item.id ? (
              // ✅ 수정 모드
              <>
                <View style={styles.editInputWrapper}>
                  <Text
                    style={[
                      styles.prefixText,
                      {
                        color: TAG_CATEGORIES.find(
                          c => c.id === selectedCategory,
                        )?.color,
                      },
                    ]}
                  >
                    {currentPrefix}
                  </Text>
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
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      {
                        backgroundColor:
                          TAG_CATEGORIES.find(c => c.id === selectedCategory)
                            ?.color || theme.icon,
                      },
                    ]}
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
              // ✅ 일반 모드 (접두사 포함 표시)
              <>
                <Text style={[styles.tagName, { color: theme.textPrimary }]}>
                  {item.name}
                </Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    onPress={() => startEditing(item.id, item.name)}
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
  tabContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  prefixInfo: {
    padding: 12,
    borderBottomWidth: 1,
  },
  addSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    borderBottomWidth: 1,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefixText: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
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
  tagCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  tagName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  editInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
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
