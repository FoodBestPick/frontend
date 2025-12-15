import { useState, useEffect, useCallback, useRef } from "react";
import { MatchingUseCase } from "../../domain/usecases/MatchingUseCase";
import { MatchingRequest } from "../../domain/entities/ChatTypes";
import { useAuth } from "../../context/AuthContext";
import { webSocketClient } from "../../core/utils/WebSocketClient";

type MatchPayload = { matched: boolean; roomId: number | null };

function unwrapMatchPayload(res: any): MatchPayload | null {
  const root = res?.data;
  const payload = root?.data ?? root; 
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

  const cancelOnceRef = useRef(false);

  const requestInFlightRef = useRef(false); 
  const cancelRequestedRef = useRef(false); 
  const cancelApiCalledRef = useRef(false); 

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
      requestInFlightRef.current = true;
      cancelRequestedRef.current = false;
      cancelApiCalledRef.current = false;
      cancelOnceRef.current = false; 

      if (!token || currentUserId == null) {
        console.error("인증 토큰 또는 사용자 ID가 없습니다.");
        setStatusText("로그인 정보가 없어 매칭을 시작할 수 없습니다.");
        requestInFlightRef.current = false; 
        return;
      }

      setIsCancelled(false);
      setIsLoading(true);
      setStatusText("매칭 요청 중…");

      const body: MatchingRequest = {
        latitude: lat,
        longitude: lng,
        category: food === "랜덤" ? null : food,
        targetCount: size === 0 ? null : size,
      };

      try {
        const res = await MatchingUseCase.requestMatch(token, body);
        const payload = unwrapMatchPayload(res);

        console.log("MATCH API RESPONSE:", res?.data);

        if (cancelRequestedRef.current && !cancelApiCalledRef.current) {
          cancelApiCalledRef.current = true;
          try {
            await MatchingUseCase.cancelMatch(token);
          } catch (error: any) {
            console.error(
              "지연 취소 API 실패:",
              error?.response?.status,
              error?.response?.data ?? error
            );
          }

          webSocketClient.disconnectMatching();
          setIsCancelled(true);
          setStatusText("매칭이 취소되었습니다.");
          return;
        }

        if (payload?.matched && payload.roomId != null) {
          setIsMatched(true);
          setRoomId(payload.roomId);
          setStatusText("매칭 성공! 채팅방으로 이동합니다.");
          webSocketClient.disconnectMatching();
          return;
        }

        setStatusText("상대를 찾는 중…");
        webSocketClient.connectMatching(token, currentUserId, handleMatchComplete);
      } catch (err) {
        setStatusText("매칭 요청 실패");
        console.error("매칭 요청 중 오류 발생:", err);
        webSocketClient.disconnectMatching();
      } finally {
        setIsLoading(false);
        requestInFlightRef.current = false;
      }
    },
    [token, currentUserId, handleMatchComplete]
  );

  const cancelMatch = useCallback(async () => {
    if (!token) return;

    cancelRequestedRef.current = true;

    if (requestInFlightRef.current) {
      webSocketClient.disconnectMatching();
      setIsCancelled(true);
      setStatusText("매칭이 취소되었습니다.");
      return;
    }

    if (cancelOnceRef.current) return;
    cancelOnceRef.current = true;

    if (cancelApiCalledRef.current) return;
    cancelApiCalledRef.current = true;

    try {
      await MatchingUseCase.cancelMatch(token);
    } catch (error: any) {
      console.error("매칭 취소 API 실패:", error?.response?.status, error?.response?.data ?? error);
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
