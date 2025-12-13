import { webSocketClient } from "../../core/utils/WebSocketClient";
import { ChatApi } from "../api/ChatApi";

export const ChatRepositoryImpl = {
  async getMessages(token: string, roomId: number) {
    return ChatApi.loadMessages(token, roomId);
  },

  connect(roomId: number, token: string, onMessage: (msg: any) => void) {
    webSocketClient.connect(roomId, token, onMessage);
  },

  send(roomId: number, senderId: number, content: string) {
    webSocketClient.send(roomId, senderId, content);
  },

  disconnect() {
    webSocketClient.disconnect();
  },
};