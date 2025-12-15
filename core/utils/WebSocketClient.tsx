import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_ENDPOINT = "http://13.125.213.115:8080/ws";

class WebSocketClient {
  private client: Client | null = null;          // 채팅용
  private matchingClient: Client | null = null;  // 매칭용
  private globalClient: Client | null = null;    // 전역(알림+계정)용

  private toBearer(token: string) {
    const t = token?.trim() ?? "";
    if (!t) return "";
    return t.startsWith("Bearer ") ? t : `Bearer ${t}`;
  }

  /**
   * 전역 웹소켓 연결 (알림 및 강제 로그아웃 통합)
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

    if (this.globalClient && this.globalClient.connected) return;

    this.globalClient = new Client({
      webSocketFactory: () => new SockJS(WS_ENDPOINT),
      reconnectDelay: 3000,
      debug: (str) => {
        // console.log("🛠️ GLOBAL STOMP DEBUG:", str); 
      },
      connectHeaders: { Authorization: auth },

      onConnect: () => {
        console.log(`✅ GLOBAL STOMP Connected for User ${userId}`);

        // 1. 강제 로그아웃 구독
        this.globalClient!.subscribe(`/user/queue/force-logout`, (frame) => {
          console.warn("🚨 FORCE LOGOUT MESSAGE RECEIVED:", frame.body);
          callbacks.onForceLogout(frame.body);
        });

        // 2. 실시간 알림 구독
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

      onStompError: (frame) => console.error("❌ GLOBAL STOMP ERROR:", frame.headers["message"], frame.body),
      onWebSocketError: (error) => console.error("❌ GLOBAL WEBSOCKET ERROR:", error),
      onDisconnect: () => console.log("🔌 GLOBAL STOMP Disconnected"),
    });

    this.globalClient.activate();
  }

  disconnectGlobal() {
    if (this.globalClient) {
      this.globalClient.deactivate();
      this.globalClient = null;
      console.log("🔌 GLOBAL STOMP Disconnected (manual)");
    }
  }

  // --- 채팅 관련 ---
  connect(roomId: number, token: string, onMessage: (msg: any) => void) {
    const auth = this.toBearer(token);

    if (this.client) {
      try { this.client.deactivate(); } catch { }
      this.client = null;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_ENDPOINT),
      reconnectDelay: 3000,
      debug: (str) => {
        console.log("🛠️ CHAT STOMP:", str);
      },
      connectHeaders: { Authorization: auth },
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
      onStompError: (frame) => console.error("❌ CHAT STOMP ERROR:", frame.headers["message"], frame.body),
      onWebSocketError: (error) => console.error("❌ CHAT WEBSOCKET ERROR:", error),
      onDisconnect: () => console.log("🔌 CHAT STOMP Disconnected"),
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

  // --- 매칭 관련 ---
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
  
  // develop 브랜치 호환성을 위한 stub 메서드 (AuthContext에서 호출 시 에러 방지)
  // connectGlobal로 통합되었으므로 기능은 비워둠
  disconnectAccount() {}
  disconnectAlarm() {}
  connectAccount() {}
  connectAlarm() {}
}

export const webSocketClient = new WebSocketClient();