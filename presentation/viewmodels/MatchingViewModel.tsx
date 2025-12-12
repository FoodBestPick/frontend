import { useState, useCallback, useEffect, useRef } from "react"; // useCallback, useEffect, useRef 추가
import { MatchingUseCase } from "../../domain/usecases/MatchingUseCase";
import { MatchingRequest } from "../../domain/entities/ChatTypes";
import { useAuth } from "../../context/AuthContext";

const MAX_RETRIES = 3; // 최대 재시도 횟수 (오류 발생 시)
const RETRY_DELAY_MS = 3000; // 재시도 간 지연 시간 (3초)

export function useMatchingViewModel() {
  const { token } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("매칭을 요청 중…");
  const [isMatched, setIsMatched] = useState(false);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);

  // AbortController와 setTimeout ID를 관리하기 위한 ref
  const activeControllerRef = useRef<AbortController | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  // 모든 비동기 작업을 정리하는 내부 함수
  const cleanupMatchingProcess = useCallback(() => {
    if (activeControllerRef.current) {
      activeControllerRef.current.abort(); // 진행 중인 axios 요청 취소
      activeControllerRef.current = null;
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current); // setTimeout 취소
      timeoutIdRef.current = null;
    }
  }, []);

  // 취소 함수는 useCallback으로 래핑하여 불필요한 재생성 방지
  const cancelMatch = useCallback(async () => {
    // 서버에 취소 요청 보내기 전에 클라이언트 측 작업 정리
    cleanupMatchingProcess();

    if (!token || isCancelled) {
      // 이미 취소되었거나 토큰이 없으면 서버에 다시 요청 보낼 필요 없음
      setIsCancelled(true); // 혹시 모를 상황 대비
      setStatusText("매칭이 이미 취소되었거나 토큰 없음.");
      return;
    } 

    try {
      await MatchingUseCase.cancelMatch(token); // 서버에 취소 요청
      setIsCancelled(true);
      setStatusText("매칭이 취소되었습니다.");
      console.log("[Matching] 매칭 취소 요청 성공");
    } catch (err: any) {
      // AbortError는 여기에서 처리되지 않아야 함 (위에서 이미 처리했으므로)
      if (axios.isCancel(err)) {
        console.log("[Matching] 매칭 취소 요청 자체가 클라이언트에서 취소됨.");
      } else {
        setStatusText("매칭 취소 실패");
        console.error("[Matching] 매칭 취소 요청 오류:", err);
      }
    }
  }, [token, isCancelled, cleanupMatchingProcess]);

  const requestMatch = useCallback(async (food: string, size: number, lat: number, lng: number) => {
    // 새로운 요청 전에 이전 요청 정리
    cleanupMatchingProcess(); 

    if (!token) { // 토큰이 없으면 매칭 요청 시작도 못함
        setStatusText("로그인 토큰이 없어 매칭을 시작할 수 없습니다.");
        return;
    }
    if (isCancelled) { // 이미 취소 상태면 새 요청 시작 안함
        setStatusText("이전 매칭 요청이 취소되어 새 요청을 시작할 수 없습니다.");
        return;
    }

    setIsLoading(true);
    setStatusText("매칭 요청 중…");

    // 새로운 AbortController 생성
    activeControllerRef.current = new AbortController();
    const signal = activeControllerRef.current.signal;

    const body: MatchingRequest = {
      latitude: lat,
      longitude: lng,
      category: food === "랜덤" ? null : food, // '랜덤'일 경우 null로 설정
      targetCount: size === 0 ? null : size,
    };

    let retries = 0;
    let matchFound = false;

    while (retries < MAX_RETRIES && !matchFound && !isCancelled && !signal.aborted) {
      try {
        console.log(`[Matching] 매칭 요청 시도 (${retries + 1}/${MAX_RETRIES})`);
        const res = await MatchingUseCase.requestMatch(token, body, signal); // signal 전달

        if (signal.aborted) { // 요청이 취소되었는지 확인
            console.log("[Matching] 요청이 AbortController에 의해 취소됨.");
            break;
        }

        if (res.data.isMatched && res.data.roomId) {
          setIsMatched(true);
          setRoomId(res.data.roomId);
          setStatusText("매칭 성공!");
          matchFound = true;
        } else {
          setStatusText("상대를 찾는 중…"); // 재시도 중임을 사용자에게 직접 노출하지 않음
          console.log("[Matching] 매칭 대기 중, 재시도...");
          await new Promise(resolve => {
            timeoutIdRef.current = setTimeout(resolve, RETRY_DELAY_MS); // ID 저장
          });
          if (signal.aborted) { // 대기 중 취소될 수 있으므로 다시 확인
            console.log("[Matching] 대기 중 요청이 AbortController에 의해 취소됨.");
            break;
          }
        }
      } catch (err: any) {
        if (signal.aborted) { // AbortError는 여기서 처리하지 않음
            console.log("[Matching] AbortController에 의해 요청 취소됨 (에러 발생 전).");
            break;
        }
        
        // axios.isCancel은 axios 0.x 버전에서 사용되었으나, 현재 AbortController 사용 시 일반적으로 error.name === 'AbortError'로 확인
        if (err.name === 'AbortError' || axios.isCancel(err)) { // 요청 취소로 인한 에러
            console.log("[Matching] 요청이 클라이언트에서 취소됨 (AbortError).");
            break;
        }

        retries++;
        console.error(`[Matching] 매칭 요청 오류 발생 (재시도 ${retries}/${MAX_RETRIES}):`, err.message);
        
        if (retries < MAX_RETRIES) {
            setStatusText("상대를 찾는 중…"); // 일시적 오류 시 계속 찾는 중으로 표시
            await new Promise(resolve => {
                timeoutIdRef.current = setTimeout(resolve, RETRY_DELAY_MS); // ID 저장
            });
            if (signal.aborted) { // 대기 중 취소될 수 있으므로 다시 확인
                console.log("[Matching] 대기 중 요청이 AbortController에 의해 취소됨.");
                break;
            }
        }
      }
    }

    // 루프 종료 후 최종 정리 (matchFound 되었거나 루프가 종료되었을 때)
    cleanupMatchingProcess();

    if (!matchFound && !isCancelled && !signal.aborted) { // 매칭되지 않았고, 취소되지도 않았을 때만 실패 메시지
      setStatusText("매칭 요청 실패");
      console.log("[Matching] 매칭 최대 재시도 횟수 초과 또는 알 수 없는 실패.");
    }
    setIsLoading(false);
  }, [token, isCancelled, cleanupMatchingProcess]); // cleanupMatchingProcess 추가

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      console.log("[Matching] ViewModel 언마운트. 모든 매칭 프로세스 정리.");
      cleanupMatchingProcess();
      // ViewModel 언마운트 시 서버에도 취소 요청을 보내려면 여기에 cancelMatch() 호출 추가
      // 그러나 cancelMatch는 토큰이 필요하므로, 이 시점에서 토큰이 없을 수 있음.
      // 서버 요청 취소는 사용자가 명시적으로 버튼을 누르거나 다른 매칭을 시도할 때만 하는 것이 일반적.
    };
  }, [cleanupMatchingProcess]);

  return {
    isLoading, // Ensure this is present
    statusText,
    isMatched,
    roomId,
    isCancelled,
    requestMatch,
    cancelMatch,
  };
}