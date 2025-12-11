export interface MatchingRequest {
    latitude: number;
    longitude: number;
    category?: string | null; 
    targetCount?: number | null; 
}

// 백엔드 MatchingResponse에 대응
export interface MatchingResponse {
    isMatched: boolean; 
    roomId: number | null; 
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}