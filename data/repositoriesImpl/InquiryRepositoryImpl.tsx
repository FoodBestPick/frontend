import { InquiryRepository } from "../../domain/repositories/InquiryRepository";
import { Inquiry, InquiryCreatePayload } from "../../domain/entities/Inquiry";
import { inquiryApi } from "../api/InquiryApi";

export const InquiryRepositoryImpl: InquiryRepository = {
    async createInquiry(payload: InquiryCreatePayload): Promise<void> {
        try {
            await inquiryApi.createInquiry(payload);
        } catch (error: any) {
            console.error("[InquiryRepository] createInquiry error:", error);
            throw error;
        }
    },

    async getMyInquiries(): Promise<Inquiry[]> {
        try {
            const response = await inquiryApi.getMyInquiries();
            // 백엔드 응답 구조: ApiResponse<List<InquiryListResponse>>
            // response.data가 ApiResponse 객체임
            const apiResponse = response.data;
            const data = apiResponse.data || []; // List<InquiryListResponse>

            return data.map((item: any) => ({
                id: item.id,
                category: item.category,
                title: item.title,
                userContent: item.userContent,
                adminContent: item.adminContent,
                images: item.images || [],
                status: item.status,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            }));
        } catch (error: any) {
            console.error("[InquiryRepository] getMyInquiries error:", error);
            throw error;
        }
    },

    async deleteInquiry(inquiryId: number): Promise<void> {
        try {
            await inquiryApi.deleteInquiry(inquiryId);
        } catch (error: any) {
            console.error("[InquiryRepository] deleteInquiry error:", error);
            throw error;
        }
    },

    async deleteAllInquiries(): Promise<void> {
        try {
            await inquiryApi.deleteAllInquiries();
        } catch (error: any) {
            console.error("[InquiryRepository] deleteAllInquiries error:", error);
            throw error;
        }
    }
};
