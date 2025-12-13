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

const MyLikesScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const { theme, isDarkMode } = useContext(ThemeContext);
  const [likes, setLikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchLikes();
    }, [])
  );

  const fetchLikes = async () => {
    try {
      console.log('Fetching likes with token:', token);
      const response = await axios.get(`${API_BASE_URL}/api/like/my`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      const json = response.data;
      console.log('MyLikes response:', json);
      if (json.code === 200) {
        setLikes(json.data.content);
      } else {
        console.error('Failed to fetch likes:', json);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card }]}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id })}
      activeOpacity={0.9}
    >
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
              {item.averageRating?.toFixed(1) || '0.0'} ({item.reviewCount || 0})
            </Text>
          </View>
          <Text style={[styles.distanceText, { color: theme.textSecondary }]}>
             📍 {item.address || '위치 정보 없음'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>나의 찜 목록</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FFA847" style={styles.loader} />
      ) : (
        <FlatList
          data={likes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>찜한 식당이 없습니다.</Text>
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
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: { width: 100, height: 100 },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: { flex: 1, padding: 12, justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardCategory: { fontSize: 12, marginBottom: 8 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 4, fontSize: 12, fontWeight: 'bold' },
  distanceText: { fontSize: 12 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16 },
});

export default MyLikesScreen;
