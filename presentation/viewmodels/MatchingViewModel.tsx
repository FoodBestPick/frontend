import { useState, useEffect, useCallback } from "react";
import { MatchingUseCase } from "../../domain/usecases/MatchingUseCase";
import { MatchingRequest } from "../../domain/entities/ChatTypes";
import { useAuth } from "../../context/AuthContext";
import { webSocketClient } from "../../core/utils/WebSocketClient";

type MatchPayload = { matched: boolean; roomId: number | null };

function unwrapMatchPayload(res: any): MatchPayload | null {
  const root = res?.data;
  const payload = root?.data ?? root; // ApiResponse<...> 또는 바로 payload 둘 다 대응
  if (!payload) return null;

  return {
    matched: Boolean(payload.matched),
    roomId: payload.roomId ?? null,
  };
}

export function useMatchingViewModel() {
  const { token, currentUserId } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("매칭을 요청 중…");
  const [isMatched, setIsMatched] = useState(false);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);

  const handleMatchComplete = useCallback((data: MatchPayload) => {
    if (data?.matched && data.roomId != null) {
      setIsMatched(true);
      setRoomId(data.roomId);
      setStatusText("매칭 성공! 채팅방으로 이동합니다.");
      webSocketClient.disconnectMatching();
    }
  }, []);

  const requestMatch = useCallback(
    async (food: string, size: number, lat: number, lng: number) => {
      if (!token || currentUserId == null) {
        console.error("인증 토큰 또는 사용자 ID가 없습니다.");
        setStatusText("로그인 정보가 없어 매칭을 시작할 수 없습니다.");
        return;
      }

      setIsCancelled(false);
      setIsLoading(true);
      setStatusText("매칭 요청 중…");

      const body: MatchingRequest = {
        latitude: lat,
        longitude: lng,
        category: food === "랜덤" ? null : food, // ✅ 랜덤이면 null
        targetCount: size === 0 ? null : size,
      };

      try {
        // ✅ 1) 먼저 매칭 API 호출
        const res = await MatchingUseCase.requestMatch(token, body);
        const payload = unwrapMatchPayload(res);

        console.log("MATCH API RESPONSE:", res?.data);

        // ✅ 2) 즉시 매칭(두번째 사람이 들어온 케이스)
        if (payload?.matched && payload.roomId != null) {
          setIsMatched(true);
          setRoomId(payload.roomId);
          setStatusText("매칭 성공! 채팅방으로 이동합니다.");
          webSocketClient.disconnectMatching();
          return;
        }

        // ✅ 3) 대기(첫번째 사람) → WS 구독 켜고 push 기다림
        setStatusText("상대를 찾는 중…");
        webSocketClient.connectMatching(token, currentUserId, handleMatchComplete);
      } catch (err) {
        setStatusText("매칭 요청 실패");
        console.error("매칭 요청 중 오류 발생:", err);
        webSocketClient.disconnectMatching();
      } finally {
        setIsLoading(false);
      }
    },
    [token, currentUserId, handleMatchComplete]
  );

  const cancelMatch = useCallback(async () => {
    if (!token) return;

    try {
      await MatchingUseCase.cancelMatch(token);
    } catch (error) {
      console.error("매칭 취소 API 실패:", error);
    }

    webSocketClient.disconnectMatching();
    setIsCancelled(true);
    setStatusText("매칭이 취소되었습니다.");
  }, [token]);

  useEffect(() => {
    return () => {
      webSocketClient.disconnectMatching();
    };
  }, []);

  return {
    isLoading,
    statusText,
    isMatched,
    roomId,
    isCancelled,
    requestMatch,
    cancelMatch,
  };
}
