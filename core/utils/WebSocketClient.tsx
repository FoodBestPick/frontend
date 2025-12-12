import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_ENDPOINT = "http://13.125.213.115:8080/ws";

class WebSocketClient {
    client: Client | null = null;
    matchingClient: Client | null = null;

    private matchingConnectPromise: Promise<void> | null = null;

    private toBearer(token: string) {
        const t = token?.trim() ?? "";
        if (!t) return "";
        return t.startsWith("Bearer ") ? t : `Bearer ${t}`;
    }

    connect(roomId: number, onMessage: (msg: any) => void) {
        this.client = new Client({
            webSocketFactory: () => new SockJS(WS_ENDPOINT),
            reconnectDelay: 5000,
            debug: () => { },

            onConnect: () => {
                console.log("🔌 STOMP Connected");

                this.client!.subscribe(`/topic/chat/${roomId}`, (frame) => {
                    const data = JSON.parse(frame.body);
                    onMessage(data);
                });
            },
        });

        this.client.activate();
    }

    send(roomId: number, senderId: number, content: string) {
        if (!this.client || !this.client.connected) return;

        this.client.publish({
            destination: "/app/chat.send",
            body: JSON.stringify({ roomId, senderId, content }),
        });
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            console.log("🔌 STOMP Disconnected");
        }
    }

    connectMatching(
        token: string,
        userId: number,
        onMatchComplete: (data: { matched: boolean; roomId: number | null }) => void
    ) {
        if (this.matchingClient && this.matchingClient.connected) {
            console.log("🔌 Matching STOMP Already Connected");
            return;
        }

        const auth = token?.startsWith("Bearer ") ? token : `Bearer ${token}`;

        this.matchingClient = new Client({
            webSocketFactory: () => new SockJS(WS_ENDPOINT),
            reconnectDelay: 5000,
            debug: () => { },

            connectHeaders: {
                Authorization: auth,
            },

            onConnect: () => {
                console.log(`🔌 Matching STOMP Connected. Listening on /topic/match/${userId}`);

                this.matchingClient!.subscribe(`/topic/match/${userId}`, (frame) => {
                    const data = JSON.parse(frame.body);
                    onMatchComplete(data);
                });
            },
        });

        this.matchingClient.activate();
    }

    disconnectMatching() {
        if (this.matchingClient) {
            this.matchingClient.deactivate();
            this.matchingClient = null;
            this.matchingConnectPromise = null;
            console.log("🔌 Matching STOMP Disconnected");
        }
    }
}

export const webSocketClient = new WebSocketClient();
