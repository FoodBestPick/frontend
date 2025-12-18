import { webSocketClient } from "../../core/utils/WebSocketClient";
import { ChatApi } from "../api/ChatApi";

export const ChatRepositoryImpl = {
  async getMyActiveRoom(token: string): Promise<number | null> {
    return ChatApi.getMyActiveRoom(token);
  },

  async uploadImage(token: string, file: any): Promise<string | null> {
    return ChatApi.uploadImage(token, file);
  },

  async getMessages(token: string, roomId: number) {
    return ChatApi.loadMessages(token, roomId);
  },

  async leaveRoom(token: string, roomId: number) {
    return ChatApi.leaveRoom(token, roomId);
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