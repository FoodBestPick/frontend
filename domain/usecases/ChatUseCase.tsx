import { ChatRepositoryImpl } from "../../data/repositoriesImpl/ChatRepositoryImpl";

export const ChatUseCase = {
  getMessages(token: string, roomId: number) {
    return ChatRepositoryImpl.getMessages(token, roomId);
  },

  leaveRoom(token: string, roomId: number) {
    return ChatRepositoryImpl.leaveRoom(token, roomId);
  },

  connect(roomId: number, token: string, onMessage: (msg: any) => void) {
    ChatRepositoryImpl.connect(roomId, token, onMessage);
  },

  send(roomId: number, senderId: number, content: string) {
    ChatRepositoryImpl.send(roomId, senderId, content);
  },

  disconnect() {
    ChatRepositoryImpl.disconnect();
  },
};