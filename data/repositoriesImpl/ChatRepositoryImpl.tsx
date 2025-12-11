import { webSocketClient } from "../../core/utils/WebSocketClient";

export const ChatRepositoryImpl = {
    connect(roomId: number, onMessage: (msg: any) => void) {
        webSocketClient.connect(roomId, onMessage);
    },

    send(roomId: number, senderId: number, content: string) {
        webSocketClient.send(roomId, senderId, content);
    },

    disconnect() {
        webSocketClient.disconnect();
    },
};