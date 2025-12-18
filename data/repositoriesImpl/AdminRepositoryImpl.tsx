import { AdminRepository } from "../../domain/repositories/AdminRepository";
import { AdminApi } from "../api/AdminApi";

export const AdminRepositoryImpl: AdminRepository = {
  async getStats() {
    return await AdminApi.getStats();
  },

  async getDetailStats(startDate?: string, endDate?: string) {
    return await AdminApi.getDetailStats(startDate, endDate);
  },

  async getRestaurantList(page: number, size: number, status?: string, keyword?: string) {
    return await AdminApi.getRestaurantList(page, size, status, keyword);
  },

  async getUserList(page: number, size: number, status?: string, sort?: string, keyword?: string) {
    return await AdminApi.getUserList(page, size, status, sort, keyword);
  },

  async updateUserWarning(userId: number, warnings: number, message: string) {
    return await AdminApi.updateUserWarning(userId, warnings, message);
  },

  async suspendUser(userId: number, days: number, message: string) {
    return await AdminApi.suspendUser(userId, days, message);
  },

  async unsuspendUser(userId: number) {
    return await AdminApi.unsuspendUser(userId);
  },

  async updateUserRole(userId: number, role: string) {
    return await AdminApi.updateUserRole(userId, role);
  },

  async getNotifications() {
    return await AdminApi.getNotifications();
  }
};
