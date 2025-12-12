import { MatchingRepositoryImpl } from '../../data/repositoriesImpl/MatchingRepositoryImpl';
import { MatchingRequest, MatchingResponse, ApiResponse } from '../../domain/entities/ChatTypes';

export const MatchingUseCase = {
  requestMatch(
    token: string,
    body: MatchingRequest,
    signal?: AbortSignal,
  ): Promise<ApiResponse<MatchingResponse>> {
    return MatchingRepositoryImpl.requestMatch(token, body, signal);
  },

  cancelMatch(token: string): Promise<ApiResponse<string>> {
    return MatchingRepositoryImpl.cancelMatch(token);
  },
};