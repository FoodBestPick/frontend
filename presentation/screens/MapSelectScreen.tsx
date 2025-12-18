import React, { useState, useRef, useContext, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Header } from '../components/Header';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types/RootStackParamList';
import { KAKAO_JAVASCRIPT_KEY } from '@env';
import { getCoordsByAddress, getAddressByCoords } from '../../core/utils/KakaoMaps';
import { ThemeContext } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Geolocation from '@react-native-community/geolocation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type MapSelectRouteProp = RouteProp<RootStackParamList, 'MapSelectScreen'>;
type GeoPosition = { coords: { latitude: number; longitude: number } };

export const MapSelectScreen = () => {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<MapSelectRouteProp>();
  const webViewRef = useRef<WebView>(null);
  const { theme } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [address, setAddress] = useState('');
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [loading, setLoading] = useState(true);

  const kakaoMapHTML = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
      <script src="https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${KAKAO_JAVASCRIPT_KEY}&libraries=services"></script>
      <style>
        html, body { height: 100%; margin: 0; padding: 0; background: #f8f8f8; }
        #map { width: 100%; height: 100%; background: #f8f8f8; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        kakao.maps.load(function() {
          const mapContainer = document.getElementById("map");
          const mapOption = {
            center: new kakao.maps.LatLng(37.5665, 126.9780),
            level: 3,
          };
          const map = new kakao.maps.Map(mapContainer, mapOption);
          const geocoder = new kakao.maps.services.Geocoder();
          let marker = new kakao.maps.Marker();

          window.ReactNativeWebView.postMessage(JSON.stringify({ type: "ready" }));

          kakao.maps.event.addListener(map, "click", function(mouseEvent) {
            const latlng = mouseEvent.latLng;
            marker.setMap(null);
            marker = new kakao.maps.Marker({ position: latlng });
            marker.setMap(map);

            geocoder.coord2Address(latlng.getLng(), latlng.getLat(), function(result, status) {
              if (status === kakao.maps.services.Status.OK) {
                const address = result[0].address.address_name;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: "select",
                  lat: latlng.getLat(),
                  lng: latlng.getLng(),
                  address
                }));
              }
            });
          });

          // RN에서 호출할 함수
          window.moveToLocation = function(lat, lng, addr) {
            const moveLatLng = new kakao.maps.LatLng(lat, lng);
            map.setCenter(moveLatLng);
            marker.setMap(null);
            marker = new kakao.maps.Marker({ position: moveLatLng });
            marker.setMap(map);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "select",
              lat, lng, address: addr
            }));
          };
        });
      </script>
    </body>
  </html>
  `;

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS !== 'android') return true;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: '위치 권한 요청',
        message: '현재 위치를 확인하려면 권한이 필요합니다.',
        buttonPositive: '확인',
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }, []);

  const moveToMyLocation = useCallback(async () => {
    setLoading(true);
    try {
      const ok = await requestLocationPermission();
      if (!ok) return;


      const pos = await new Promise<GeoPosition>((resolve, reject) => {
        Geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 5000 },
        );
      });

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const addr = (await getAddressByCoords(lat, lng)) ?? '';

      webViewRef.current?.injectJavaScript(`
        if (window.moveToLocation) {
          window.moveToLocation(${lat}, ${lng}, ${JSON.stringify(addr)});
        }
        true;
      `);
    } catch (e) {
      console.log('moveToMyLocation error:', e);
    } finally {
      setLoading(false);
    }
  }, [requestLocationPermission]);

  /** WebView → RN */
  const onMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'ready') {
        setMapReady(true);
        setLoading(false); 
        moveToMyLocation();
        return;
      }

      if (data.type === 'select') {
        setMarker({ lat: data.lat, lng: data.lng });
        setAddress(data.address);
      }
    } catch (err) {
      console.log('WebView message parse error', err);
    }
  };

  /** 검색 */
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    if (!mapReady) {
      Alert.alert('지도 로딩 중', '지도가 준비되면 검색할 수 있어요.');
      return;
    }

    setLoading(true);
    const result = await getCoordsByAddress(searchQuery);
    setLoading(false);

    if (result) {
      webViewRef.current?.injectJavaScript(`
        if (window.moveToLocation) {
          window.moveToLocation(${result.lat}, ${result.lng}, ${JSON.stringify(result.address)});
        }
        true;
      `);
      setMarker({ lat: result.lat, lng: result.lng });
      setAddress(result.address);
    } else {
      Alert.alert('검색 결과 없음', '입력한 주소 또는 장소를 찾을 수 없습니다.');
    }
  };

  /** 선택 완료 */
  const handleConfirm = () => {
    if (marker && address) {
      if (route.params?.onSelect) {
        route.params.onSelect({ lat: marker.lat, lng: marker.lng, address });
      }
      navigation.goBack();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Header
        title="위치 선택"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      {/* 검색창 */}
      <View
        style={[
          styles.searchBar,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              color: theme.textPrimary,
            },
          ]}
          placeholder="주소 또는 장소명을 입력하세요"
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: theme.icon }]}
          onPress={handleSearch}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>검색</Text>
        </TouchableOpacity>
      </View>

      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: kakaoMapHTML }}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        style={{ flex: 1 }}
      />

      {loading && (
        <ActivityIndicator
          size="large"
          color={theme.icon}
          style={styles.loading}
        />
      )}

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 16,
          },
        ]}
      >
        <Text
          style={[
            styles.addressText,
            { color: address ? theme.textPrimary : theme.textSecondary },
          ]}
        >
          {address ? `📍 ${address}` : '지도에서 위치를 선택하세요'}
        </Text>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            { backgroundColor: marker ? theme.icon : theme.border },
          ]}
          disabled={!marker}
          onPress={handleConfirm}
        >
          <Text
            style={{
              color: marker ? '#fff' : theme.textSecondary,
              fontWeight: '700',
            }}
          >
            선택 완료
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchButton: {
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginLeft: 8,
    height: 40,
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  addressText: {
    fontSize: 14,
    marginBottom: 10,
  },
  confirmButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
});
