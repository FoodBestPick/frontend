import axios from "axios";
import { API_BASE_URL } from "@env";

const client = axios.create({
  baseURL: API_BASE_URL,
});

const toBearer = (token: string) => {
  const t = (token ?? "").trim();
  if (!t) return t;
  return t.startsWith("Bearer ") ? t : `Bearer ${t}`;
};

export const ChatApi = {
  loadMessages: async (token: string, roomId: number) => {
    const res = await client.get(`/chat/${roomId}`, {
      headers: { Authorization: toBearer(token) },
    });
    return res.data?.data ?? [];
  },

  getMyActiveRoom: async (token: string) => {
    try {
      console.log(`🔍 [ChatApi] getMyActiveRoom 호출. URL: ${client.defaults.baseURL}, Token: ${token ? token.substring(0, 10) + '...' : 'null'}`);
      const res = await client.get(`/chat/my-room`, {
        headers: { Authorization: toBearer(token) },
      });
      // 데이터 구조: { code: 200, data: { roomId: 123 } }
      console.log("✅ [ChatApi] getMyActiveRoom 응답:", res.data);
      return res.data?.data?.roomId ?? null;
    } catch (e: any) {
      console.error("❌ [ChatApi] getMyActiveRoom error:", e.message, e.response?.data);
      return null;
    }
  },

   leaveRoom: async (token: string, roomId: number) => {
    await client.delete(`/chat/${roomId}/leave`, {
      headers: { Authorization: toBearer(token) },
    });
    return true;
  },

  uploadImage: async (token: string, file: any) => {
    const formData = new FormData();
    formData.append('files', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.fileName || 'upload.jpg',
    });

    try {
      const res = await client.post('/upload/s3', formData, {
        headers: {
          Authorization: toBearer(token),
          'Content-Type': 'multipart/form-data',
        },
      });
      // Response: { code: 200, data: ["https://s3..."] }
      return res.data?.data?.[0] ?? null;
    } catch (e) {
      console.error("Image upload error:", e);
      return null;
    }
  }
};
