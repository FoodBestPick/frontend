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
