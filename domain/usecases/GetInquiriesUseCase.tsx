import { InquiryRepository } from "../repositories/InquiryRepository";
import { Inquiry } from "../entities/Inquiry";

export class GetInquiriesUseCase {
    constructor(private inquiryRepository: InquiryRepository) {}

    async execute(): Promise<Inquiry[]> {
        return await this.inquiryRepository.getMyInquiries();
    }
}
