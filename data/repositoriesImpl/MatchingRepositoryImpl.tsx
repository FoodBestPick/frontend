import { MatchingApi } from '../api/MatchingApi';
import { MatchingRequest, MatchingResponse, ApiResponse } from '../../domain/entities/ChatTypes';
import { MatchingRepository } from '../../domain/repositories/MatchingRepository';

export const MatchingRepositoryImpl: MatchingRepository = {
  requestMatch(
    token: string,
    body: MatchingRequest,
    signal?: AbortSignal,
  ): Promise<ApiResponse<MatchingResponse>> {
    return MatchingApi.requestMatch(token, body, signal);
  },

  cancelMatch(token: string): Promise<ApiResponse<string>> {
    return MatchingApi.cancelMatch(token);
  },
};