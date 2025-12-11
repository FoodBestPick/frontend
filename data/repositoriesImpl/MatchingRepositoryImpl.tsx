import { MatchingApi } from '../api/MatchingApi';
import { MatchingRequest, MatchingResponse, ApiResponse } from '../../domain/entities/ChatTypes';
import { MatchingRepository } from '../../domain/repositories/MatchingRepository';

export const MatchingRepositoryImpl: MatchingRepository = {
  requestMatch(
    token: string,
    body: MatchingRequest,
  ): Promise<ApiResponse<MatchingResponse>> {
    return MatchingApi.requestMatch(token, body);
  },

  cancelMatch(token: string): Promise<ApiResponse<string>> {
    return MatchingApi.cancelMatch(token);
  },
};