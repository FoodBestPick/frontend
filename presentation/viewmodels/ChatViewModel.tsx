import { useEffect, useState, useCallback } from "react";
import { ChatUseCase } from "../../domain/usecases/ChatUseCase";
import { useAuth } from "../../context/AuthContext";
import type { ChatMessage } from "../../domain/entities/ChatMessage";

function normalizeMessage(roomId: number, m: any): ChatMessage {
    // 실시간 채팅이므로 서버 시간 대신 '현재 시간(수신 시점)'을 사용
    // 과거 메시지 로딩 시에는 로딩 시점의 시간이 찍히는 한계가 있지만, 시간 오차 문제는 확실히 해결됨.
    const now = new Date();
    const timeString = new Intl.DateTimeFormat('ko-KR', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: 'Asia/Seoul',
    }).format(now);

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
        formattedTime: timeString, // 항상 현재 시간 사용
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
