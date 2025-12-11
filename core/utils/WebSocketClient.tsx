import SockJS from "sockjs-client";
import Stomp from "stompjs";

class WebSocketClient {
    stompClient: Stomp.Client | null = null;

    connect(roomId: number, onMessage: (msg: any) => void) {
        const socket = new SockJS("http://13.125.213.115:8080/ws");
        this.stompClient = Stomp.over(socket);

        this.stompClient.connect({}, () => {
            console.log("🔌 STOMP Connected");

            // STOMP 구독 (joinRoom 개념)
            this.stompClient!.subscribe(`/topic/chat/${roomId}`, (frame) => {
                const data = JSON.parse(frame.body);
                onMessage(data);
            });
        });
    }

    send(roomId: number, senderId: number, content: string) {
        if (!this.stompClient) return;

        this.stompClient.send(
            "/app/chat.send", 
            {},
            JSON.stringify({
                roomId,
                senderId,
                content,
            })
        );
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.disconnect(() => {
                console.log("🔌 STOMP Disconnected");
            });
        }
    }
}

export const webSocketClient = new WebSocketClient();
