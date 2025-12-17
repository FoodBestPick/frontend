export type InquiryCategory = 'ACCOUNT' | 'BUG' | 'INAPPROPRIATE' | 'OTHER';
export type InquiryStatus = 'PENDING' | 'ANSWERED';

export interface Inquiry {
    id: number;
    category: InquiryCategory;
    title: string;
    userContent: string;
    adminContent: string | null;
    images: string[];
    status: InquiryStatus;
    createdAt: string;
    updatedAt: string;
}

export interface InquiryCreatePayload {
    category: InquiryCategory;
    title: string;
    content: string;
    files?: any[]; // For multipart image upload
}
