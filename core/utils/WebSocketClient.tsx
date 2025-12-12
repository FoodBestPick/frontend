import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketClient {
    private client: Client | null = null;

    connect(roomId: number, onMessage: (msg: any) => void) {
        this.client = new Client({
            // SockJS를 사용하는 경우 webSocketFactory 설정
            webSocketFactory: () => new SockJS("http://13.125.213.115:8080/ws"),
            onConnect: () => {
                console.log("🔌 STOMP Connected");
                this.client?.subscribe(`/topic/chat/${roomId}`, (message) => {
                    const data = JSON.parse(message.body);
                    onMessage(data);
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
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
}

export const webSocketClient = new WebSocketClient();
