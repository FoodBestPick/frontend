import { useEffect, useState, useCallback } from "react";
import { ChatUseCase } from "../../domain/usecases/ChatUseCase";
import { useAuth } from "../../context/AuthContext";
import type { ChatMessage } from "../../domain/entities/ChatMessage";

function formatNowKoreanTime() {
  const now = new Date();
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "Asia/Seoul",
  }).format(now);
}

function normalizeMessage(roomId: number, m: any): ChatMessage {
  const content = String(m?.content ?? m?.message ?? "");

  const formattedTime =
    (typeof m?.formattedTime === "string" && m.formattedTime.trim())
      ? m.formattedTime
      : formatNowKoreanTime();


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
    content,
    formattedTime,
    isSystem: !!(m?.isSystem ?? m?.system),
  };
}

function uniqKey(x: ChatMessage) {
  return `${x.senderId}|${x.content}|${x.formattedTime}|${x.isSystem ? 1 : 0}`;
}

export function useChatViewModel(roomId: number) {
  const { token, currentUserId } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (!token) return;

    let alive = true;

    ChatUseCase.connect(roomId, token, (msg) => {
      const normalized = normalizeMessage(roomId, msg);
      setMessages((prev) => {
        const set = new Set(prev.map(uniqKey));
        if (set.has(uniqKey(normalized))) return prev;
        return [...prev, normalized];
      });
    });

    (async () => {
      setIsLoading(true);
      try {
        const history = await ChatUseCase.getMessages(token, roomId);
        const normalizedHistory = Array.isArray(history)
          ? history.map((m: any) => normalizeMessage(roomId, m))
          : [];

        if (!alive) return;

        setMessages((prev) => {
          const map = new Map<string, ChatMessage>();
          for (const h of normalizedHistory) map.set(uniqKey(h), h);
          for (const p of prev) map.set(uniqKey(p), p);

          return Array.from(map.values());
        });
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

  const leaveRoom = useCallback(async () => {
    if (!token) throw new Error("token is null");
    if (isLeaving) return;

    setIsLeaving(true);
    try {
      await ChatUseCase.leaveRoom(token, roomId);
      ChatUseCase.disconnect();
    } finally {
      setIsLeaving(false);
    }
  }, [token, roomId, isLeaving]);

  return { messages, sendMessage, isLoading, leaveRoom, isLeaving };
}
