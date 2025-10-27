import { AdminStats } from "../entities/AdminStats";

export interface AdminRepository {
  getStats(): Promise<AdminStats>;
}
