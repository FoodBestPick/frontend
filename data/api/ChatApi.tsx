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
      const res = await client.get(`/chat/my-room`, {
        headers: { Authorization: toBearer(token) },
      });
      // 데이터 구조: { code: 200, data: { roomId: 123 } }
      return res.data?.data?.roomId ?? null;
    } catch (e) {
      console.log("getMyActiveRoom error:", e);
      return null;
    }
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
