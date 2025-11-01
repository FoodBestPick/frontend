import { AdminStats } from "../entities/AdminStats";
import { AdminDetailStats } from "../entities/AdminDetailStats";

export interface AdminRepository {
  getStats(): Promise<AdminStats>;
  getDetailStats(): Promise<AdminDetailStats>;
}
