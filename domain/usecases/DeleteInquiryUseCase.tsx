import { InquiryRepository } from "../repositories/InquiryRepository";

export class DeleteInquiryUseCase {
    constructor(private inquiryRepository: InquiryRepository) {}

    async execute(inquiryId: number): Promise<void> {
        return await this.inquiryRepository.deleteInquiry(inquiryId);
    }
    
    async executeAll(): Promise<void> {
        return await this.inquiryRepository.deleteAllInquiries();
    }
}
