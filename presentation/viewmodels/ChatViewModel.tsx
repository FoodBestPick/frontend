import { useEffect, useState, useCallback } from "react";
import { ChatUseCase } from "../../domain/usecases/ChatUseCase";
import { useAuth } from "../../context/AuthContext";
import type { ChatMessage } from "../../domain/entities/ChatMessage";

function normalizeMessage(roomId: number, m: any): ChatMessage {
    return {
        roomId: m?.roomId ?? roomId,
        senderId: m?.senderId,
        senderName: m?.senderName ?? m?.sender_name ?? m?.nickname ?? undefined,
        senderAvatar:
            m?.senderAvatar ??
            m?.senderAvatarUrl ??
            m?.avatarUrl ??
            m?.avatar_url ??
            m?.senderImageUrl ??
            m?.imageUrl ??
            null,
        content: m?.content ?? m?.message ?? "",
        formattedTime: m?.formattedTime ?? m?.time ?? m?.timestamp ?? undefined,
    };
}

export function useChatViewModel(roomId: number) {
    const { token, currentUserId } = useAuth();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!token) return;

        let alive = true;

        // 1) 먼저 연결부터
        ChatUseCase.connect(roomId, token, (msg) => {
            const normalized = normalizeMessage(roomId, msg);
            setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last &&
                    last.senderId === normalized.senderId &&
                    last.content === normalized.content &&
                    last.formattedTime === normalized.formattedTime) {
                    return prev;
                }
                return [...prev, normalized];
            });
        });


        (async () => {
            setIsLoading(true);
            try {
                const history = await ChatUseCase.getMessages(token, roomId);
                const normalized = Array.isArray(history)
                    ? history.map((m: any) => normalizeMessage(roomId, m))
                    : [];
                if (alive) setMessages(normalized);
            } finally {
                if (alive) setIsLoading(false);
            }
        })();

        return () => {
            alive = false;
            ChatUseCase.disconnect();
        };
    }, [roomId, token]);

    const sendMessage = useCallback(
        (text: string) => {
            const t = text.trim();
            if (!t) return;

            if (currentUserId == null) {
                console.log("currentUserId is null, cannot send message");
                return;
            }

            ChatUseCase.send(roomId, currentUserId, t);
        },
        [roomId, currentUserId]
    );

    return { messages, sendMessage, isLoading };
}
