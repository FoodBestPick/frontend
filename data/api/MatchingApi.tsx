import axios from 'axios';
import { API_BASE_URL } from "@env";
import { MatchingRequest, MatchingResponse, ApiResponse } from '../../domain/entities/ChatTypes';
import { setupInterceptors } from './apiClientUtils'; // 인터셉터 유틸 임포트

const client = axios.create({
  baseURL: API_BASE_URL,
});

// 클라이언트 인스턴스에 인터셉터 설정
setupInterceptors(client);

export const MatchingApi = {
  // 매칭 요청
  requestMatch: async (
    token: string,
    body: MatchingRequest,
    signal?: AbortSignal, // AbortSignal 추가
  ): Promise<ApiResponse<MatchingResponse>> => {
    const res = await client.post<ApiResponse<MatchingResponse>>(
      '/match',
      body,
      {
        headers: {
          Authorization: token,
        },
        timeout: 300000, // 5분 (300,000ms) 타임아웃 설정
        signal: signal, // AbortSignal 전달
      },
    );
    return res.data;
  },

  // 매칭 취소
  cancelMatch: async (token: string): Promise<ApiResponse<string>> => {
    const res = await client.delete<ApiResponse<string>>('/match', {
      headers: {
        Authorization: token,
      },
    });
    return res.data;
  },
};