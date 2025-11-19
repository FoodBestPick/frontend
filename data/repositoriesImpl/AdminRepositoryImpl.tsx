import { AdminRepository } from "../../domain/repositories/AdminRepository";
import { AdminApi } from "../api/AdminApi";

export const AdminRepositoryImpl: AdminRepository = {
  async getStats() {
    return await AdminApi.getStats();
  },

  async getDetailStats() {
    return await AdminApi.getDetailStats();
  },

  async getRestaurantList(page: number, size: number, status?: string, keyword?: string) {
    return await AdminApi.getRestaurantList(page, size, status, keyword);
  },

  async getUserList(page: number, size: number, status?: string, sort?: string, keyword?: string) {
    return await AdminApi.getUserList(page, size, status, sort, keyword);
  },

  async getNotifications() {
    return await AdminApi.getNotifications();
  }
};
