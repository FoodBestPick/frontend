import React from "react";// MatchingViewModel.ts
import { useState } from "react";
import { MatchingUseCase } from "../../domain/usecases/MatchingUseCase";
import { MatchingRequest } from "../../domain/entities/ChatTypes";
import { useAuth } from "../../context/AuthContext"; 

export function useMatchingViewModel() {
  const { token } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("매칭을 요청 중…");
  const [isMatched, setIsMatched] = useState(false);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);

  const requestMatch = async (food : string , size: number, lat: number, lng: number) => {
    if (!token) return;

    setIsLoading(true);
    setStatusText("매칭 요청 중…");

    const body: MatchingRequest = {
      latitude: lat,
      longitude: lng,
      category: food,
      targetCount: size === 0 ? null : size,
    };

    try {
      const res = await MatchingUseCase.requestMatch(token, body);

      if (res.data.isMatched && res.data.roomId) {
        setIsMatched(true);
        setRoomId(res.data.roomId);
      } else {
        setStatusText("상대를 찾는 중…");
      }
    } catch (err) {
      setStatusText("매칭 요청 실패");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 취소 함수 추가
  const cancelMatch = async () => {
    if (!token) return;

    try {
      await MatchingUseCase.cancelMatch(token);
      setIsCancelled(true);
      setStatusText("매칭이 취소되었습니다.");
    } catch (err) {
      setStatusText("매칭 취소 실패");
    }
  };

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