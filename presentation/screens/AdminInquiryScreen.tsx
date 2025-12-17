import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Header } from '../components/Header';
import { AdminApi } from '../../data/api/AdminApi';
import { ThemeContext } from '../../context/ThemeContext';
import { COLORS } from '../../core/constants/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export const AdminInquiryScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode, theme } = useContext(ThemeContext);

  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ANSWERED'>('ALL');
  
  // Detail Modal State
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, [filter]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      // API expects 'PENDING', 'ANSWERED' or null for all.
      // My local filter state is 'ALL', 'PENDING', 'ANSWERED'.
      const statusParam = filter === 'ALL' ? undefined : filter;
      const response = await AdminApi.getInquiries(statusParam);
      if (response && response.data) {
        setInquiries(response.data);
      } else {
        setInquiries([]);
      }
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
      Alert.alert('오류', '문의 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setAnswerText(''); // Reset answer text
    setModalVisible(true);
  };

  const handleCloseDetail = () => {
    setModalVisible(false);
    setSelectedInquiry(null);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedInquiry) return;
    if (!answerText.trim()) {
      Alert.alert('알림', '답변 내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await AdminApi.answerInquiry(selectedInquiry.id, answerText);
      Alert.alert('성공', '답변이 등록되었습니다.');
      setModalVisible(false);
      fetchInquiries(); // Refresh list
    } catch (error) {
      console.error('Answer failed:', error);
      Alert.alert('오류', '답변 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderFilterTab = (label: string, value: 'ALL' | 'PENDING' | 'ANSWERED') => (
    <TouchableOpacity
      style={[
        styles.filterTab,
        filter === value && { borderBottomColor: COLORS.primary, borderBottomWidth: 2 },
      ]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterText,
          { color: filter === value ? COLORS.primary : theme.textSecondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: any }) => {
    const isPending = item.status === 'PENDING';
    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          { backgroundColor: isDarkMode ? theme.card : '#fff', borderColor: theme.border },
        ]}
        onPress={() => handleOpenDetail(item)}
      >
        <View style={styles.itemHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category || '기타'}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isPending ? '#FFECB3' : '#E8F5E9' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: isPending ? '#FFB300' : '#4CAF50' },
              ]}
            >
              {isPending ? '답변 대기' : '답변 완료'}
            </Text>
          </View>
        </View>
        <Text style={[styles.itemTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.itemDate, { color: theme.textSecondary }]}>
          {item.createdAt}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? theme.background : '#F5F5F5' }]}>
      <Header
        title="고객 문의 관리"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { backgroundColor: isDarkMode ? theme.card : '#fff' }]}>
        {renderFilterTab('전체', 'ALL')}
        {renderFilterTab('대기중', 'PENDING')}
        {renderFilterTab('답변완료', 'ANSWERED')}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={inquiries}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: theme.textSecondary }}>문의 내역이 없습니다.</Text>
            </View>
          }
        />
      )}

      {/* Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseDetail}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? theme.card : '#fff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>문의 상세</Text>
              <TouchableOpacity onPress={handleCloseDetail}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {selectedInquiry && (
                <>
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>카테고리</Text>
                    <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{selectedInquiry.category}</Text>
                  </View>
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>제목</Text>
                    <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{selectedInquiry.title}</Text>
                  </View>
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>내용</Text>
                    <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{selectedInquiry.userContent}</Text>
                  </View>
                  
                  {/* Images */}
                  {selectedInquiry.images && selectedInquiry.images.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                      {selectedInquiry.images.map((img: string, idx: number) => (
                        <Image key={idx} source={{ uri: img }} style={styles.inquiryImage} resizeMode="cover" />
                      ))}
                    </ScrollView>
                  )}

                  <View style={styles.divider} />

                  {selectedInquiry.status === 'ANSWERED' ? (
                    <View style={styles.answerSection}>
                      <Text style={[styles.answerTitle, { color: COLORS.primary }]}>관리자 답변</Text>
                      <View style={[styles.answerBox, { backgroundColor: isDarkMode ? '#333' : '#F5F9FF' }]}>
                        <Text style={[styles.answerText, { color: theme.textPrimary }]}>
                          {selectedInquiry.adminContent}
                        </Text>
                      </View>
                      <Text style={[styles.answerDate, { color: theme.textSecondary }]}>
                        답변일시: {selectedInquiry.updatedAt}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.inputSection}>
                      <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>답변 작성</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          { 
                            backgroundColor: isDarkMode ? '#2C2C2C' : '#F9F9F9',
                            color: theme.textPrimary,
                            borderColor: theme.border
                          }
                        ]}
                        placeholder="답변 내용을 입력하세요..."
                        placeholderTextColor={theme.textSecondary}
                        multiline
                        value={answerText}
                        onChangeText={setAnswerText}
                        textAlignVertical="top"
                      />
                      <TouchableOpacity
                        style={[styles.submitButton, submitting && { opacity: 0.7 }]}
                        onPress={handleSubmitAnswer}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={styles.submitButtonText}>답변 등록</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  itemContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#EEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#555',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
  },
  imageScroll: {
    marginVertical: 10,
  },
  inquiryImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 20,
  },
  answerSection: {
    marginBottom: 20,
  },
  answerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  answerBox: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  answerText: {
    fontSize: 15,
    lineHeight: 22,
  },
  answerDate: {
    fontSize: 12,
    textAlign: 'right',
  },
  inputSection: {
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textInput: {
    height: 120,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
