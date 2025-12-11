import { MatchingRequest, MatchingResponse, ApiResponse } from '../../domain/entities/ChatTypes';

export interface MatchingRepository {
  requestMatch(
    token: string,
    body: MatchingRequest,
  ): Promise<ApiResponse<MatchingResponse>>;

  cancelMatch(token: string): Promise<ApiResponse<string>>;
}
