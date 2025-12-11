import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types/RootStackParamList';
import { Header } from '../components/Header';
import { ThemeContext } from '../../context/ThemeContext';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAdminRestaurantAddViewModel } from '../viewmodels/AdminRestaurantAddViewModel';

type Navigation = NativeStackNavigationProp<
  RootStackParamList,
  'AdminRestaurantAdd'
>;
type AddRouteProp = RouteProp<RootStackParamList, 'AdminRestaurantAdd'>;

export const AdminRestaurantAddScreen = () => {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<AddRouteProp>();
  const { theme } = useContext(ThemeContext);

  // ✅ ViewModel 연결
  const {
    purposeTags,
    atmosphereTags,
    facilityTags,
    categories,
    loading: dataLoading,
    createRestaurant,
    updateRestaurant,
    getRestaurantDetail,
  } = useAdminRestaurantAddViewModel();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [mainImages, setMainImages] = useState<any[]>([]);
  const [menus, setMenus] = useState<
    { id: string; image?: string; name: string; price: string }[]
  >([{ id: '1', image: '', name: '', price: '' }]);

  // ✅ 운영시간 상태 추가
  const [times, setTimes] = useState<
    { id: string; week: string; startTime: string; endTime: string; restTime: string }[]
  >([{ id: '1', week: '', startTime: '', endTime: '', restTime: '' }]);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const menuScrollRef = useRef<ScrollView>(null);

  const isFormValid = name.trim() && category.trim() && address.trim();
  const isEditMode = !!route.params?.id;

  useEffect(() => {
    if (route.params?.selectedLocation) {
      const {
        address: addr,
        latitude: lat,
        longitude: lng,
      } = route.params.selectedLocation;
      setAddress(addr);
      setLatitude(lat?.toString() || '');
      setLongitude(lng?.toString() || '');
    }
  }, [route.params?.selectedLocation]);

  // ✅ 수정 모드일 경우 데이터 불러오기
  useEffect(() => {
    if (isEditMode) {
      const loadData = async () => {
        const data = await getRestaurantDetail(route.params.id!);
        if (data) {
          setName(data.name);
          setCategory(data.category);
          setAddress(data.address);
          setLatitude(data.latitude?.toString() || '');
          setLongitude(data.longitude?.toString() || '');
          setDescription(data.description || '');
          
          // 이미지 설정 (기존 이미지는 uri로 설정)
          if (data.images && data.images.length > 0) {
            setMainImages(data.images.map((url: string) => ({ uri: url })));
          }

          // 메뉴 설정
          if (data.menus && data.menus.length > 0) {
            setMenus(data.menus.map((m: any, idx: number) => ({
              id: m.id?.toString() || idx.toString(),
              name: m.name,
              price: m.price?.toString() || '0',
              image: m.image || ''
            })));
          }

          // 태그 설정 (문자열 배열로 가정)
          if (data.tags) {
            setSelectedTags(data.tags);
          }
          
          // 운영시간 설정 (데이터 구조에 따라 다름, 여기서는 예시)
          if (data.times && data.times.length > 0) {
             setTimes(data.times.map((t: any, idx: number) => ({
               id: t.id?.toString() || idx.toString(),
               week: t.week,
               startTime: t.startTime,
               endTime: t.endTime,
               restTime: t.restTime || ''
             })));
          }
        }
      };
      loadData();
    }
  }, [isEditMode]);

  const pickMainImages = () => {
    launchImageLibrary(
      { mediaType: 'photo', includeBase64: false, selectionLimit: 3 },
      response => {
        if (response.didCancel) return;
        if (response.assets) {
          setMainImages(response.assets);
        }
      },
    );
  };

  const addMenu = () => {
    setMenus(prev => [
      ...prev,
      { id: Date.now().toString(), name: '', price: '', image: '' },
    ]);
  };

  const removeMenu = (index: number) => {
    if (menus.length <= 1) return;
    setMenus(prev => prev.filter((_, i) => i !== index));
  };

  const updateMenuField = (
    index: number,
    field: 'name' | 'price',
    value: string,
  ) => {
    setMenus(prev =>
      prev.map((menu, i) => (i === index ? { ...menu, [field]: value } : menu)),
    );
  };

  // ✅ 운영시간 관리 함수들
  const addTime = () => {
    setTimes(prev => [
      ...prev,
      { id: Date.now().toString(), week: '', startTime: '', endTime: '', restTime: '' },
    ]);
  };

  const removeTime = (index: number) => {
    if (times.length <= 1) return;
    setTimes(prev => prev.filter((_, i) => i !== index));
  };

  const updateTimeField = (
    index: number,
    field: 'week' | 'startTime' | 'endTime' | 'restTime',
    value: string,
  ) => {
    setTimes(prev =>
      prev.map((time, i) => (i === index ? { ...time, [field]: value } : time)),
    );
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName],
    );
  };

  // ✅ 백엔드 연결 등록 함수
  const handleSubmit = async () => {
    if (!isFormValid) {
      Alert.alert('입력 오류', '필수 항목을 모두 입력해주세요.');
      return;
    }

    if (menus.length === 0 || !menus.some(m => m.name)) {
      Alert.alert('메뉴 등록', '최소 한 개의 메뉴를 등록해주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const menuData = menus
        .filter(m => m.name.trim())
        .map(m => ({
          menu_name: m.name,
          menu_price: m.price || '0',
        }));

      // ✅ 운영시간 데이터 변환
      const timeData = times
        .filter(t => t.week.trim())
        .map(t => ({
          week: t.week,
          startTime: t.startTime,
          endTime: t.endTime,
          restTime: t.restTime,
        }));

      const restaurantData = {
        restaurant_name: name,
        restaurant_introduce: description,
        restaurant_address: address,
        restaurant_latitude: latitude,
        restaurant_longitude: longitude,
        restaurant_category: category,
        menus: menuData,
        times: timeData, // ✅ 추가
        tags: selectedTags,
      };

      let result;
      if (isEditMode) {
        result = await updateRestaurant(route.params.id!, restaurantData, mainImages);
      } else {
        result = await createRestaurant(restaurantData, mainImages);
      }

      if (result.success) {
        Alert.alert(isEditMode ? '수정 완료' : '등록 완료', result.message, [
          { text: '확인', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert(isEditMode ? '수정 실패' : '등록 실패', result.message);
      }
    } catch (error: any) {
      Alert.alert('오류', error.message || '작업 중 문제가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (dataLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title={isEditMode ? "맛집 수정" : "맛집 등록"} showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.icon} />
          <Text style={{ color: theme.textSecondary, marginTop: 12 }}>
            데이터를 불러오는 중...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={isEditMode ? "맛집 수정" : "맛집 등록"}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.form, { paddingBottom: 120 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* 대표 이미지 */}
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            대표 이미지 (최대 3장) *
          </Text>
          <TouchableOpacity
            style={[
              styles.imagePicker,
              { borderColor: theme.border, backgroundColor: theme.card },
            ]}
            onPress={pickMainImages}
          >
            {mainImages.length > 0 ? (
              <View style={styles.imageRow}>
                {mainImages.map((img, idx) => (
                  <View key={idx} style={{ position: 'relative', marginRight: 8 }}>
                    <Image
                      source={{ uri: img.uri }}
                      style={styles.imagePreviewSmall}
                    />
                    <TouchableOpacity
                      style={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        borderRadius: 10,
                        padding: 2,
                      }}
                      onPress={(e) => {
                        e.stopPropagation(); // 부모의 onPress 이벤트 전파 방지
                        setMainImages(prev => prev.filter((_, i) => i !== idx));
                      }}
                    >
                      <MaterialIcons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View> 
            ) : (
              <>
                <MaterialIcons
                  name="add-a-photo"
                  size={32}
                  color={theme.icon}
                />
                <Text
                  style={[styles.imageText, { color: theme.textSecondary }]}
                >
                  대표 이미지 추가
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* 기본 정보 */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              식당명 *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.border,
                  color: theme.textPrimary,
                  backgroundColor: theme.card,
                },
              ]}
              placeholder="예: 감성타코 여의도점"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* ✅ 카테고리 선택 (Picker 대신 버튼) */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              카테고리 *
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor:
                        category === cat.name ? theme.icon : theme.card,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => setCategory(cat.name)}
                >
                  <Text
                    style={{
                      color: category === cat.name ? '#fff' : theme.textPrimary,
                      fontWeight: '600',
                    }}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 설명 */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              설명
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  borderColor: theme.border,
                  color: theme.textPrimary,
                  backgroundColor: theme.card,
                },
              ]}
              placeholder="식당에 대한 간단한 설명을 입력하세요."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={5}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* 주소 */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              주소 *
            </Text>
            <View
              style={[
                styles.addressCard,
                { borderColor: theme.border, backgroundColor: theme.card },
              ]}
            >
              <Text
                style={[
                  styles.addressText,
                  { color: address ? theme.textPrimary : theme.textSecondary },
                ]}
                numberOfLines={2}
              >
                {address || '지도에서 위치를 선택하세요'}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('MapSelectScreen')}
                activeOpacity={0.7}
                style={{ padding: 6 }}
              >
                <MaterialIcons name="map" size={22} color={theme.icon} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ✅ 태그 선택 */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              목적 태그
            </Text>
            <View style={styles.tagRow}>
              {purposeTags.map(tag => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tagButton,
                    {
                      backgroundColor: selectedTags.includes(tag.name)
                        ? '#64B5F6'
                        : theme.card,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => toggleTag(tag.name)}
                >
                  <Text
                    style={{
                      color: selectedTags.includes(tag.name)
                        ? '#fff'
                        : theme.textPrimary,
                    }}
                  >
                    {tag.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              편의시설 태그
            </Text>
            <View style={styles.tagRow}>
              {facilityTags.map(tag => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tagButton,
                    {
                      backgroundColor: selectedTags.includes(tag.name)
                        ? '#FFB74D'
                        : theme.card,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => toggleTag(tag.name)}
                >
                  <Text
                    style={{
                      color: selectedTags.includes(tag.name)
                        ? '#fff'
                        : theme.textPrimary,
                    }}
                  >
                    {tag.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              분위기 태그
            </Text>
            <View style={styles.tagRow}>
              {atmosphereTags.map(tag => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tagButton,
                    {
                      backgroundColor: selectedTags.includes(tag.name)
                        ? '#81C784'
                        : theme.card,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => toggleTag(tag.name)}
                >
                  <Text
                    style={{
                      color: selectedTags.includes(tag.name)
                        ? '#fff'
                        : theme.textPrimary,
                    }}
                  >
                    {tag.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 메뉴판 */}
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            메뉴판 *
          </Text>
          <ScrollView
            ref={menuScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {menus.map((menu, index) => (
              <View
                key={menu.id}
                style={[
                  styles.menuCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <TextInput
                  placeholder="메뉴명"
                  placeholderTextColor={theme.textSecondary}
                  style={[
                    styles.menuInput,
                    {
                      borderColor: theme.border,
                      color: theme.textPrimary,
                      backgroundColor: theme.background,
                    },
                  ]}
                  value={menu.name}
                  onChangeText={t => updateMenuField(index, 'name', t)}
                />
                <TextInput
                  placeholder="가격"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  style={[
                    styles.menuInput,
                    {
                      borderColor: theme.border,
                      color: theme.textPrimary,
                      backgroundColor: theme.background,
                    },
                  ]}
                  value={menu.price}
                  onChangeText={t => updateMenuField(index, 'price', t)}
                />
                <TouchableOpacity onPress={() => removeMenu(index)}>
                  <MaterialIcons
                    name="delete"
                    size={20}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={[
                styles.menuCard,
                styles.addCard,
                { borderColor: theme.icon },
              ]}
              onPress={addMenu}
            >
              <MaterialIcons name="add" size={36} color={theme.icon} />
              <Text style={{ color: theme.icon }}>메뉴 추가</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* ✅ 운영시간 입력 UI 추가 */}
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: 20 }]}>
            운영 시간
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {times.map((time, index) => (
              <View
                key={time.id}
                style={[
                  styles.menuCard, // 스타일 재사용
                  { backgroundColor: theme.card, borderColor: theme.border, width: 180 },
                ]}
              >
                <TextInput
                  placeholder="요일 (예: 월~금)"
                  placeholderTextColor={theme.textSecondary}
                  style={[
                    styles.menuInput,
                    {
                      borderColor: theme.border,
                      color: theme.textPrimary,
                      backgroundColor: theme.background,
                    },
                  ]}
                  value={time.week}
                  onChangeText={t => updateTimeField(index, 'week', t)}
                />
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <TextInput
                    placeholder="오픈"
                    placeholderTextColor={theme.textSecondary}
                    style={[
                      styles.menuInput,
                      {
                        flex: 1,
                        borderColor: theme.border,
                        color: theme.textPrimary,
                        backgroundColor: theme.background,
                      },
                    ]}
                    value={time.startTime}
                    onChangeText={t => updateTimeField(index, 'startTime', t)}
                  />
                  <TextInput
                    placeholder="마감"
                    placeholderTextColor={theme.textSecondary}
                    style={[
                      styles.menuInput,
                      {
                        flex: 1,
                        borderColor: theme.border,
                        color: theme.textPrimary,
                        backgroundColor: theme.background,
                      },
                    ]}
                    value={time.endTime}
                    onChangeText={t => updateTimeField(index, 'endTime', t)}
                  />
                </View>
                <TextInput
                  placeholder="휴게시간 (선택)"
                  placeholderTextColor={theme.textSecondary}
                  style={[
                    styles.menuInput,
                    {
                      borderColor: theme.border,
                      color: theme.textPrimary,
                      backgroundColor: theme.background,
                    },
                  ]}
                  value={time.restTime}
                  onChangeText={t => updateTimeField(index, 'restTime', t)}
                />
                <TouchableOpacity onPress={() => removeTime(index)}>
                  <MaterialIcons
                    name="delete"
                    size={20}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={[
                styles.menuCard,
                styles.addCard,
                { borderColor: theme.icon, width: 180 },
              ]}
              onPress={addTime}
            >
              <MaterialIcons name="add" size={36} color={theme.icon} />
              <Text style={{ color: theme.icon }}>시간 추가</Text>
            </TouchableOpacity>
          </ScrollView>
        </ScrollView>

        {/* 하단 등록 버튼 */}
        <View
          style={[
            styles.footerBox,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.submitBox,
              {
                backgroundColor:
                  isFormValid && !submitting ? theme.icon : theme.border,
              },
            ]}
            onPress={isFormValid && !submitting ? handleSubmit : undefined}
            disabled={!isFormValid || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={[
                  styles.submitText,
                  { color: isFormValid ? '#fff' : theme.textSecondary },
                ]}
              >
                {isEditMode ? '수정하기' : '등록하기'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  form: { paddingHorizontal: 20, paddingVertical: 20, gap: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  imagePicker: {
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageRow: { flexDirection: 'row', gap: 8 },
  imagePreviewSmall: { width: 90, height: 90, borderRadius: 8 },
  imageText: { marginTop: 8, fontSize: 14 },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 14,
  },
  addressText: { flex: 1, fontSize: 15, marginRight: 10 },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  menuCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
  },
  addCard: {
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  menuInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    marginBottom: 6,
  },
  footerBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  submitBox: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: { fontSize: 16, fontWeight: '700' },
});
