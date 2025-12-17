import { InquiryRepository } from "../repositories/InquiryRepository";
import { InquiryCreatePayload } from "../entities/Inquiry";

export class CreateInquiryUseCase {
    constructor(private inquiryRepository: InquiryRepository) {}

    async execute(payload: InquiryCreatePayload): Promise<void> {
        return await this.inquiryRepository.createInquiry(payload);
    }
}
