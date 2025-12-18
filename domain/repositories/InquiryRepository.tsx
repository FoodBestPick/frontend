import { Inquiry, InquiryCreatePayload } from "../entities/Inquiry";

export interface InquiryRepository {
    createInquiry(payload: InquiryCreatePayload): Promise<void>;
    getMyInquiries(): Promise<Inquiry[]>;
    deleteInquiry(inquiryId: number): Promise<void>;
    deleteAllInquiries(): Promise<void>;
}
