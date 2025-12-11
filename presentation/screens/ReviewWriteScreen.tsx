import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { API_BASE_URL } from '@env';
import { RootStackParamList } from '../navigation/types/RootStackParamList';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

type RouteParams = RouteProp<RootStackParamList, 'ReviewWrite'>;

const ReviewWriteScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const { restaurantId, restaurantName, review } = route.params;
  const { token } = useAuth();

  const [rating, setRating] = useState(review ? review.rating : 5);
  const [content, setContent] = useState(review ? review.content : '');
  const [images, setImages] = useState<any[]>(
    review && review.images 
      ? review.images.map(url => ({ uri: url, type: 'image/jpeg', fileName: 'existing.jpg', isExisting: true })) 
      : []
  );
  const [loading, setLoading] = useState(false);

  const handleImagePick = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 5 - images.length,
        quality: 0.7,
        includeBase64: false,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('오류', result.errorMessage || '이미지를 불러오는데 실패했습니다.');
        return;
      }

      if (result.assets) {
        setImages([...images, ...result.assets]);
      }
    } catch (error) {
      console.error('ImagePicker Error:', error);
      Alert.alert('오류', '이미지 선택 중 오류가 발생했습니다.');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (content.trim().length < 5) {
      Alert.alert('알림', '리뷰 내용을 5자 이상 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      if (!token) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      const formData = new FormData();
      
      // JSON 데이터
      const reviewData = {
        restaurantId: restaurantId,
        content: content,
        rating: rating,
        images: images.filter(img => img.isExisting).map(img => img.uri), // 기존 이미지 URL
      };

      formData.append('data', JSON.stringify(reviewData));

      // 새 이미지 파일만 전송
      images.forEach((image) => {
        if (!image.isExisting) {
          const file = {
            uri: image.uri,
            type: image.type || 'image/jpeg',
            name: image.fileName || `review_image_${Date.now()}.jpg`,
          };
          formData.append('file', file);
        }
      });

      const url = review ? `${API_BASE_URL}/api/review/${review.id}` : `${API_BASE_URL}/api/review`;
      const method = review ? 'PUT' : 'POST';

      // Axios 사용 (transformRequest로 Android FormData 이슈 해결)
      const response = await axios.request({
        method: method,
        url: url,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        transformRequest: (data) => data,
      });

      console.log('Review submit response status:', response.status);
      const result = response.data;
      console.log('Review submit result:', result);

      if (result.code === 200) {
        if (Platform.OS === 'android') {
          ToastAndroid.show(review ? '리뷰가 수정되었습니다.' : '리뷰가 등록되었습니다.', ToastAndroid.SHORT);
          navigation.goBack();
        } else {
          Alert.alert(
            '성공', 
            review ? '리뷰가 수정되었습니다.' : '리뷰가 등록되었습니다.', 
            [{ 
              text: '확인', 
              onPress: () => {
                navigation.goBack();
              } 
            }]
          );
        }
      } else {
        Alert.alert('실패', result.message || (review ? '리뷰 수정에 실패했습니다.' : '리뷰 등록에 실패했습니다.'));
      }
    } catch (error: any) {
      console.error('리뷰 등록 오류:', error);
      const errorMessage = error.response?.data?.message || error.message || '네트워크 오류가 발생했습니다.';
      Alert.alert('오류', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{review ? '리뷰 수정' : '리뷰 작성'}</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
          <Text style={[styles.submitText, loading && { color: '#ccc' }]}>{review ? '수정' : '등록'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.restaurantName}>{restaurantName}</Text>
        <Text style={styles.guideText}>이 식당에서의 경험은 어떠셨나요?</Text>

        {/* 별점 입력 */}
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Icon
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color="#FFA847"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* 내용 입력 */}
        <TextInput
          style={styles.input}
          placeholder="솔직한 리뷰를 남겨주세요. (5자 이상)"
          multiline
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
        />

        {/* 이미지 첨부 */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>사진 첨부 ({images.length}/5)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.length < 5 && (
              <TouchableOpacity style={styles.addImageButton} onPress={handleImagePick}>
                <Icon name="camera-outline" size={24} color="#999" />
                <Text style={styles.addImageText}>사진 추가</Text>
              </TouchableOpacity>
            )}
            {images.map((img, idx) => (
              <View key={idx} style={styles.imagePreview}>
                <Image source={{ uri: img.uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(idx)}
                >
                  <Icon name="close-circle" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFA847" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFA847',
  },
  content: {
    padding: 20,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    height: 150,
    fontSize: 15,
    color: '#333',
    marginBottom: 24,
  },
  imageSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addImageText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  imagePreview: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReviewWriteScreen;
