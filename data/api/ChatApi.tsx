    import axios from "axios";
    import { API_BASE_URL } from "@env";
 

    const client = axios.create({
    baseURL: API_BASE_URL, 
    });

    export const ChatApi = {
    loadMessages: async (token: string, roomId: number) => {
        const res = await client.get(`/chat/${roomId}`, {
        headers: { Authorization: token },
        });
        return res.data;
    },
    };