import { ChatRepositoryImpl } from "../../data/repositoriesImpl/ChatRepositoryImpl";

export const ChatUseCase = {
    connect(roomId: number, onMessage: (msg: any) => void) {
        ChatRepositoryImpl.connect(roomId, onMessage);
    },

    send(roomId: number, senderId: number, content: string) {
        ChatRepositoryImpl.send(roomId, senderId, content);
    },

    disconnect() {
        ChatRepositoryImpl.disconnect();
    }
};
