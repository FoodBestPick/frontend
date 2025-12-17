import { authApi } from "./UserAuthApi";
import { InquiryCreatePayload } from "../../domain/entities/Inquiry";
import { Platform } from "react-native";

export const inquiryApi = {
    createInquiry: async (payload: InquiryCreatePayload) => {
        const formData = new FormData();

        // 1. JSON 데이터 (RequestPart "data")
        const jsonData = {
            category: payload.category,
            title: payload.title,
            content: payload.content,
        };
        
        // 백엔드에서 @RequestPart("data")로 받으므로 JSON 문자열로 변환하여 추가하거나
        // Content-Type을 application/json으로 명시한 Blob을 추가해야 함.
        // React Native에서는 FormData에 JSON 객체를 바로 넣으면 문자열로 변환됨.
        // 하지만 백엔드가 Spring Boot인 경우, 보통 'application/json' 타입을 기대하므로
        // 아래와 같이 처리하는 것이 일반적입니다.
        formData.append("data", {
            string: JSON.stringify(jsonData),
            type: 'application/json'
        } as any);


        // 2. 파일 데이터 (RequestPart "file")
        if (payload.files && payload.files.length > 0) {
            payload.files.forEach((file) => {
                const imageUri = file.uri;
                const filename = imageUri.split('/').pop() || 'image.jpg';
                const type = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

                formData.append("file", {
                    uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
                    name: filename,
                    type: type,
                } as any);
            });
        }

        return await authApi.post("/inquiry", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    getMyInquiries: async () => {
        return await authApi.get("/inquiry");
    },

    deleteInquiry: async (inquiryId: number) => {
        return await authApi.delete(`/inquiry/delete/${inquiryId}`);
    },

    deleteAllInquiries: async () => {
        return await authApi.delete("/inquiry/delete-all");
    }
};
