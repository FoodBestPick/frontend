import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_ENDPOINT = "http://13.125.213.115:8080/ws";

class WebSocketClient {
  private client: Client | null = null;
  private matchingClient: Client | null = null;

  private toBearer(token: string) {
    const t = token?.trim() ?? "";
    if (!t) return "";
    return t.startsWith("Bearer ") ? t : `Bearer ${t}`;
  }

  private globalClient: Client | null = null; // 전역 웹소켓 클라이언트 추가

  /**
   * 전역 웹소켓 연결 (알림 및 강제 로그아웃용)
   * @param token 사용자 토큰
   * @param userId 사용자 ID
   * @param callbacks 강제 로그아웃 및 알림 수신 시 호출될 콜백 함수
   */
  connectGlobal(
    token: string,
    userId: number,
    callbacks: {
      onForceLogout: (msg: string) => void;
      onAlarm: (alarmData: any) => void;
    }
  ) {
    const auth = this.toBearer(token);

    // 이미 살아있는 연결이 있으면 재연결하지 않음
    if (this.globalClient && this.globalClient.connected) return;

    this.globalClient = new Client({
      webSocketFactory: () => new SockJS(WS_ENDPOINT),
      reconnectDelay: 3000, // 3초 후 재연결 시도
      debug: (str) => {
        // console.log("🛠️ GLOBAL STOMP DEBUG:", str); // 디버깅 시 주석 해제
      },
      connectHeaders: { Authorization: auth }, // 인증 헤더 포함

      onConnect: () => {
        console.log(`✅ GLOBAL STOMP Connected for User ${userId}`);

        // 1. 강제 로그아웃 구독 (/user/queue/force-logout)
        // Spring Security STOMP 사용 시 /user/queue/... 로 구독해야 개인 메시지를 받음
        this.globalClient!.subscribe(`/user/queue/force-logout`, (frame) => {
          console.warn("🚨 FORCE LOGOUT MESSAGE RECEIVED:", frame.body);
          callbacks.onForceLogout(frame.body);
        });

        // 2. 실시간 알림 구독 (/topic/alarms/{userId})
        // 전체 사용자에게 보내는 알림이 아닌, 특정 사용자에게 가는 알림
        this.globalClient!.subscribe(`/topic/alarms/${userId}`, (frame) => {
          try {
            const data = JSON.parse(frame.body);
            console.log("🔔 ALARM RECEIVED:", data);
            callbacks.onAlarm(data);
          } catch (e) {
            console.error("❌ Alarm parse error:", e, frame.body);
          }
        });
      },

      onStompError: (frame) => {
        console.error("❌ GLOBAL STOMP ERROR:", frame.headers["message"], frame.body);
      },
      onWebSocketError: (error) => {
        console.error("❌ GLOBAL WEBSOCKET ERROR:", error);
      },
      onDisconnect: () => {
        console.log("🔌 GLOBAL STOMP Disconnected");
      },
    });

    this.globalClient.activate(); // 웹소켓 활성화
  }

  /**
   * 전역 웹소켓 연결 해제
   */
  disconnectGlobal() {
    if (this.globalClient) {
      this.globalClient.deactivate();
      this.globalClient = null;
      console.log("🔌 GLOBAL STOMP Disconnected (manual)");
    }
  }

  connect(roomId: number, token: string, onMessage: (msg: any) => void) {
    const auth = this.toBearer(token);

    // 이미 살아있는 연결이 있으면 끊고 재연결(중복 방지)
    if (this.client) {
      try { this.client.deactivate(); } catch {}
      this.client = null;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_ENDPOINT),
      reconnectDelay: 3000,

      debug: (str) => {
        console.log("🛠️ CHAT STOMP:", str);
      },

      connectHeaders: {
        Authorization: auth,
      },

      onConnect: () => {
        console.log("✅ CHAT STOMP Connected");

        this.client!.subscribe(`/topic/chat/${roomId}`, (frame) => {
          try {
            const data = JSON.parse(frame.body);
            onMessage(data);
          } catch (e) {
            console.error("❌ chat frame parse error:", e, frame.body);
          }
        });
      },

      onStompError: (frame) => {
        console.error("❌ CHAT STOMP ERROR:", frame.headers["message"], frame.body);
      },

      onWebSocketError: (error) => {
        console.error("❌ CHAT WEBSOCKET ERROR:", error);
      },

      onDisconnect: () => {
        console.log("🔌 CHAT STOMP Disconnected");
      },
    });

    console.log("🛠️ CHAT STOMP: Opening Web Socket...");
    this.client.activate();
  }

  send(roomId: number, senderId: number, content: string) {
    if (!this.client || !this.client.connected) {
      console.warn("⚠️ send skipped: stomp not connected yet");
      return;
    }

    this.client.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({ roomId, senderId, content }),
    });
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      console.log("🔌 CHAT STOMP Disconnected (manual)");
    }
  }
  connectMatching(
    token: string,
    userId: number,
    onMatchComplete: (data: { matched: boolean; roomId: number | null }) => void
  ) {
    const auth = this.toBearer(token);

    if (this.matchingClient && this.matchingClient.connected) return;

    this.matchingClient = new Client({
      webSocketFactory: () => new SockJS(WS_ENDPOINT),
      reconnectDelay: 3000,
      debug: (str) => console.log("🛠️ MATCH STOMP:", str),
      connectHeaders: { Authorization: auth },

      onConnect: () => {
        console.log(`✅ MATCH STOMP Connected /topic/match/${userId}`);
        this.matchingClient!.subscribe(`/topic/match/${userId}`, (frame) => {
          const data = JSON.parse(frame.body);
          onMatchComplete(data);
        });
      },
      onStompError: (frame) => console.error("❌ MATCH STOMP ERROR:", frame.body),
      onWebSocketError: (e) => console.error("❌ MATCH WS ERROR:", e),
    });

    this.matchingClient.activate();
  }

  disconnectMatching() {
    if (this.matchingClient) {
      this.matchingClient.deactivate();
      this.matchingClient = null;
      console.log("🔌 MATCH STOMP Disconnected");
    }
  }
}

export const webSocketClient = new WebSocketClient();
