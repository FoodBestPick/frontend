export interface ChatMessage {
  roomId: number;
  senderId: number;
  senderName?: string;
  senderAvatar?: string | null;
  content: string;
  formattedTime?: string;
  isSystem?: boolean;
};
