import { useEffect, useState } from "react";
import { ChatUseCase } from "../../domain/usecases/ChatUseCase";
import { useAuth } from "../../context/AuthContext";

export function useChatViewModel(roomId: number) {
    const { currentUserId } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);

    useEffect(() => {
        ChatUseCase.connect(roomId, (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => ChatUseCase.disconnect();
    }, [roomId]);

    const sendMessage = (text: string) => {
        if (!text.trim()) return;
        if (currentUserId === null) {
            console.log("currentUserId is null, cannot send message");
            return;
        }
        ChatUseCase.send(roomId, currentUserId, text);
    };

    return {
        messages,
        sendMessage,
    };
}
