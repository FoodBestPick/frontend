import { AdminRepository } from "../../domain/repositories/AdminRepository";
import { AdminApi } from "../api/AdminApi";

export const AdminRepositoryImpl: AdminRepository = {
  async getStats() {
    return await AdminApi.getStats();
  },

  async getDetailStats() {
    return await AdminApi.getDetailStats();
  }
};
