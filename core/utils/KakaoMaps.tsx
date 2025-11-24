import axios from 'axios';
import { KAKAO_REST_API_KEY } from '@env';

const BASE_URL = 'https://dapi.kakao.com/v2/local';

/** 주소 → 좌표 변환 */
export const getCoordsByAddress = async (query: string) => {
  try {
    const addrRes = await axios.get(`${BASE_URL}/search/address.json`, {
      params: { query },
      headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
    });

    if (addrRes.data.documents?.length > 0) {
      const doc = addrRes.data.documents[0];
      return {
        lat: parseFloat(doc.y),
        lng: parseFloat(doc.x),
        address: doc.address_name,
      };
    }

    const keywordRes = await axios.get(`${BASE_URL}/search/keyword.json`, {
      params: { query },
      headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
    });

    if (keywordRes.data.documents?.length > 0) {
      const place = keywordRes.data.documents[0];
      return {
        lat: parseFloat(place.y),
        lng: parseFloat(place.x),
        address: place.address_name || place.place_name,
      };
    }

    return null;
  } catch (error) {
    console.error('주소/키워드 → 좌표 변환 오류:', error);
    return null;
  }
};

/** 좌표 → 주소 변환 */
export const getAddressByCoords = async (lat: number, lng: number) => {
  try {
    const res = await axios.get(`${BASE_URL}/geo/coord2address.json`, {
      params: { x: lng, y: lat },
      headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
    });

    const doc = res.data.documents?.[0];
    if (!doc) return null;

    return (
      doc.road_address?.address_name ||
      doc.address?.address_name ||
      '주소를 찾을 수 없습니다'
    );
  } catch (error) {
    console.error('좌표 → 주소 변환 오류:', error);
    return null;
  }
};
