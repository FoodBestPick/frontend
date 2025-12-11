import { MatchingRepositoryImpl } from '../../data/repositoriesImpl/MatchingRepositoryImpl';
import { MatchingRequest, MatchingResponse, ApiResponse } from '../../domain/entities/ChatTypes';

export const MatchingUseCase = {
  requestMatch(
    token: string,
    body: MatchingRequest,
  ): Promise<ApiResponse<MatchingResponse>> {
    return MatchingRepositoryImpl.requestMatch(token, body);
  },

  cancelMatch(token: string): Promise<ApiResponse<string>> {
    return MatchingRepositoryImpl.cancelMatch(token);
  },
};