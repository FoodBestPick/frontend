import React, { useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { API_BASE_URL } from "@env";
import axios from 'axios';

const MyReviewsScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const { theme, isDarkMode } = useContext(ThemeContext);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchReviews();
    }, [])
  );

  const fetchReviews = async () => {
    try {
      console.log('Fetching reviews with token:', token);
      const response = await axios.get(`${API_BASE_URL}/api/review/my`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      const json = response.data;
      console.log('MyReviews response:', json);
      if (json.code === 200) {
        setReviews(json.data.content);
      } else {
        console.error('Failed to fetch reviews:', json);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.card }]}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.restaurantId })}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.restaurantName, { color: theme.textPrimary }]}>
          {item.restaurantName || '식당 이름 없음'}
        </Text>
        <View style={styles.ratingContainer}>
          <MaterialIcons name="star" size={16} color="#FFA847" />
          <Text style={[styles.ratingText, { color: theme.textPrimary }]}>{item.rating}</Text>
        </View>
      </View>
      
      <Text style={[styles.dateText, { color: theme.textSecondary }]}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>

      <Text style={[styles.contentText, { color: theme.textPrimary }]}>{item.content}</Text>

      {item.images && item.images.length > 0 && (
        <FlatList
          data={item.images}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(img, idx) => idx.toString()}
          renderItem={({ item: imgUrl }) => (
            <Image source={{ uri: imgUrl }} style={styles.reviewImage} />
          )}
          style={styles.imageList}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>내가 쓴 리뷰</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FFA847" style={styles.loader} />
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>작성한 리뷰가 없습니다.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  loader: { marginTop: 20 },
  listContent: { padding: 16 },
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  restaurantName: { fontSize: 16, fontWeight: 'bold' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 4, fontWeight: 'bold' },
  dateText: { fontSize: 12, marginBottom: 8 },
  contentText: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  imageList: { marginTop: 8 },
  reviewImage: { width: 100, height: 100, borderRadius: 8, marginRight: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16 },
});

export default MyReviewsScreen;
