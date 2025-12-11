import axios from 'axios';
import { API_BASE_URL } from "@env";
import { MatchingRequest, MatchingResponse, ApiResponse } from '../../domain/entities/ChatTypes';

const client = axios.create({
  baseURL: API_BASE_URL, 
});

export const MatchingApi = {
  // 매칭 요청
  requestMatch: async (
    token: string,
    body: MatchingRequest,
  ): Promise<ApiResponse<MatchingResponse>> => {
    const res = await client.post<ApiResponse<MatchingResponse>>(
      '/match',
      body,
      {
        headers: {
          Authorization: token,
        },
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