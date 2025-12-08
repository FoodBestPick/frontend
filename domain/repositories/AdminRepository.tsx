import { AdminStats } from "../entities/AdminStats";
import { AdminDetailStats } from "../entities/AdminDetailStats";
import { AdminRestaurantList } from "../entities/AdminRestaurantList";
import { AdminUserList } from "../entities/AdminUserList";
import { AdminNotificationList } from "../entities/AdminNotificationList";

export interface AdminRepository {
  getStats(token : String): Promise<AdminStats>;
  getDetailStats(): Promise<AdminDetailStats>;
  getRestaurantList(page: number, size: number, status?: string, keyword?: string): Promise<AdminRestaurantList>;
  getUserList(
    page: number,
    size: number,
    status?: string,
    sort?: string,
    keyword?: string
  ): Promise<AdminUserList>;
  getNotifications(): Promise<AdminNotificationList>;
}
