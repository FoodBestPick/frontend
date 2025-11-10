import { AdminStats } from "../entities/AdminStats";
import { AdminDetailStats } from "../entities/AdminDetailStats";
import { AdminRestaurantList } from "../entities/AdminRestaurantList";

export interface AdminRepository {
  getStats(): Promise<AdminStats>;
  getDetailStats(): Promise<AdminDetailStats>;
  getRestaurantList(page: number, size: number, status?: string, keyword? : string): Promise<AdminRestaurantList>;
}
