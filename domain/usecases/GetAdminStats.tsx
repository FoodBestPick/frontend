import { AdminRepository } from "../repositories/AdminRepository";

export class GetAdminStats {
  constructor(private repository: AdminRepository) {}

  async execute() {
    return await this.repository.getStats();
  }

  async executeDetail() {
    return await this.repository.getDetailStats();
  }

  async executeRestaurantList(page: number, size: number, status?: string, keyword? : string) {
    return this.repository.getRestaurantList(page, size, status, keyword);
  }
}