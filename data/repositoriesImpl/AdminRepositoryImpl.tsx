import { AdminRepository } from "../../domain/repositories/AdminRepository";
import { AdminApi } from "../api/AdminApi";
import { AdminStats } from "../../domain/entities/AdminStats";

export const AdminRepositoryImpl: AdminRepository = {
  async getStats(): Promise<AdminStats> {
    const data = await AdminApi.getStats();
    return data;
  },
};
