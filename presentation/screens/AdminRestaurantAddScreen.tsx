import React, { useState, useContext, useEffect, useRef } from "react";
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
  LayoutAnimation, 
  UIManager
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types/RootStackParamList";
import { Header } from "../components/Header";
import { ThemeContext } from "../../context/ThemeContext";
import { launchImageLibrary } from "react-native-image-picker";

type Navigation = NativeStackNavigationProp<RootStackParamList, "AdminRestaurantAdd">;
type AddRouteProp = RouteProp<RootStackParamList, "AdminRestaurantAdd">;

export const AdminRestaurantAddScreen = () => {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<AddRouteProp>();
  const { theme } = useContext(ThemeContext);
  const scrollRef = useRef<ScrollView>(null);
  const menuScrollRef = useRef<ScrollView>(null); 
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [mainImages, setMainImages] = useState<string[]>([]);
  const [menus, setMenus] = useState<
    { id: string; image?: string; name: string; price: string }[]
  >([{ id: "1", image: "", name: "", price: "" }]);
  const isFormValid = name.trim() && category.trim() && address.trim();
  const [selectedFilters, setSelectedFilters] = useState({
    purposes: [] as string[],
    atmospheres: [] as string[],
    features: [] as string[],
  });

  if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  useEffect(() => {
    if (route.params?.selectedLocation) {
      const { address } = route.params.selectedLocation;
      setAddress(address);
    }
  }, [route.params]);

  /** 대표 이미지 업로드 */
  const pickMainImages = () => {
    launchImageLibrary(
      { mediaType: "photo", includeBase64: false, selectionLimit: 3 },
      (response) => {
        if (response.didCancel) return;
        if (response.assets) {
          const uris = response.assets.map((a) => a.uri).filter(Boolean) as string[];
          setMainImages(uris.slice(0, 3));
        }
      }
    );
  };

  const CARD_WIDTH = 160;
  const CARD_SPACING = 12;

  const addMenu = () => {
    setMenus((prev) => {
      const next = [
        ...prev,
        { id: Date.now().toString(), name: "", price: "", image: "" },
      ];

      setTimeout(() => {
        const xOffset = (next.length - 1) * (CARD_WIDTH + CARD_SPACING);
        menuScrollRef.current?.scrollTo({ x: xOffset, animated: true });
      }, 100);

      return next;
    });
  };
  const removeMenu = (index: number) => {
    if (menus.length <= 1) return;

    const targetIndex = Math.max(0, index - 1);
    const xOffset = targetIndex * (CARD_WIDTH + CARD_SPACING);
    menuScrollRef.current?.scrollTo({ x: xOffset, animated: true });

    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        250,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity
      )
    );

    setTimeout(() => {
      setMenus((prev) => prev.filter((_, i) => i !== index));
    }, 100);
  };

  const updateMenuField = (index: number, field: "name" | "price", value: string) => {
    setMenus((prev) =>
      prev.map((menu, i) => (i === index ? { ...menu, [field]: value } : menu))
    );
  };

  const pickMenuImage = (index: number) => {
    launchImageLibrary({ mediaType: "photo" }, (response) => {
      if (response.assets?.[0]?.uri) {
        const uri = response.assets[0].uri;
        setMenus((prev) =>
          prev.map((menu, i) => (i === index ? { ...menu, image: uri } : menu))
        );
      }
    });
  };

  /** 필터 */
  const toggleFilter = (group: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters((prev) => {
      const arr = prev[group];
      return arr.includes(value)
        ? { ...prev, [group]: arr.filter((v) => v !== value) }
        : { ...prev, [group]: [...arr, value] };
    });
  };

  /** 등록 */
  const handleSubmit = () => {
    if (!isFormValid) return;
    if (menus.length === 0 || !menus.some((m) => m.name)) {
      Alert.alert("메뉴판 등록", "최소 한 개의 메뉴를 등록해주세요.");
      return;
    }
    Alert.alert("등록 완료", `${name} 맛집이 등록되었습니다.`);
    navigation.goBack();
  };

  const purposes = ["데이트", "외식", "회식", "기념일", "모임", "애견동반"];
  const atmospheres = ["분위기 좋은", "조용한", "뷰가 좋은", "예쁜", "깔끔한", "가성비 좋은"];
  const features = ["단체석", "주차", "연인석", "테라스", "1인석", "유아의자", "놀이방"];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="맛집 등록" showBackButton onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.form, { paddingBottom: 120 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* 대표 이미지 */}
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            대표 이미지 (최대 3장)
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
                {mainImages.map((uri, idx) => (
                  <Image key={idx} source={{ uri }} style={styles.imagePreviewSmall} />
                ))}
              </View>
            ) : (
              <>
                <MaterialIcons name="add-a-photo" size={32} color={theme.icon} />
                <Text style={[styles.imageText, { color: theme.textSecondary }]}>
                  대표 이미지 추가
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* 기본 정보 */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>식당명 *</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.card },
              ]}
              placeholder="예: 감성타코 여의도점"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>카테고리 *</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.card },
              ]}
              placeholder="예: 멕시코 음식, 일식 등"
              placeholderTextColor={theme.textSecondary}
              value={category}
              onChangeText={setCategory}
            />
          </View>

          {/* 설명 */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>설명</Text>
            <TextInput
              style={[
                styles.textArea,
                { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.card },
              ]}
              placeholder="식당에 대한 간단한 설명을 입력하세요."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={5}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* 주소 카드 */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>주소 *</Text>
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
                {address || "지도에서 위치를 선택하세요"}
              </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate("MapSelectScreen")}
                activeOpacity={0.7}
                style={{ padding: 6 }}
              >
                <MaterialIcons name="map" size={22} color={theme.icon} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 메뉴판 */}
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>메뉴판</Text>
          <ScrollView
            ref={menuScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {menus.map((menu, index) => (
              <View
                key={menu.id}
                style={[styles.menuCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <TouchableOpacity
                  style={[styles.menuImageBox, { borderColor: theme.border }]}
                  onPress={() => pickMenuImage(index)}
                >
                  {menu.image ? (
                    <Image source={{ uri: menu.image }} style={styles.menuImage} />
                  ) : (
                    <MaterialIcons name="add-photo-alternate" size={28} color={theme.textSecondary} />
                  )}
                </TouchableOpacity>

                <TextInput
                  placeholder="메뉴명"
                  placeholderTextColor={theme.textSecondary}
                  style={[
                    styles.menuInput,
                    { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background },
                  ]}
                  value={menu.name}
                  onChangeText={(t) => updateMenuField(index, "name", t)}
                />
                <TextInput
                  placeholder="가격"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  style={[
                    styles.menuInput,
                    { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background },
                  ]}
                  value={menu.price}
                  onChangeText={(t) => updateMenuField(index, "price", t)}
                />

                <TouchableOpacity onPress={() => removeMenu(index)} style={{ alignSelf: "flex-end" }}>
                  <MaterialIcons name="delete" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}

            {/* + 카드 */}
            <TouchableOpacity
              style={[styles.menuCard, styles.addCard, { borderColor: theme.icon }]}
              onPress={addMenu}
              activeOpacity={0.8}
            >
              <MaterialIcons name="add" size={36} color={theme.icon} />
              <Text style={{ color: theme.icon, marginTop: 6 }}>메뉴 추가</Text>
            </TouchableOpacity>
          </ScrollView>
        </ScrollView>

        {/* 하단 박스 */}
        <View
          style={[
            styles.footerBox,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.submitBox,
              { backgroundColor: isFormValid ? theme.icon : theme.border },
            ]}
            onPress={isFormValid ? handleSubmit : undefined}
            disabled={!isFormValid}
            activeOpacity={isFormValid ? 0.8 : 1}
          >
            <Text
              style={[
                styles.submitText,
                { color: isFormValid ? "#fff" : theme.textSecondary },
              ]}
            >
              등록하기
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { paddingHorizontal: 20, paddingVertical: 20, gap: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "600", marginBottom: 8 },
  imagePicker: {
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  imageRow: { flexDirection: "row", gap: 8 },
  imagePreviewSmall: { width: 90, height: 90, borderRadius: 8 },
  imageText: { marginTop: 8, fontSize: 14 },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600" },
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
    textAlignVertical: "top",
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 14,
  },
  addressText: { flex: 1, fontSize: 15, marginRight: 10 },
  menuCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
  },
  addCard: {
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
  },
  menuImageBox: {
    width: "100%",
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  menuImage: { width: "100%", height: "100%", borderRadius: 8 },
  menuInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    marginBottom: 6,
  },
  footerBox: {
    position: "absolute",
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
    justifyContent: "center",
    alignItems: "center",
  },
  submitText: { fontSize: 16, fontWeight: "700" },
});
