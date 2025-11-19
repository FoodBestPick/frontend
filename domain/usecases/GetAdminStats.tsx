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

  async executeUserList(
    page: number,
    size: number,
    status?: string,
    sort?: string,
    keyword?: string
  ) {
    return await this.repository.getUserList(page, size, status, sort, keyword);
  }

  async executeNotifications() {
    return await this.repository.getNotifications();
  }
}