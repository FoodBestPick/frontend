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
};
