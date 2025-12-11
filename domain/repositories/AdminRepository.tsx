import { AdminStats } from "../entities/AdminStats";
import { AdminDetailStats } from "../entities/AdminDetailStats";
import { AdminRestaurantList } from "../entities/AdminRestaurantList";
import { AdminUserList } from "../entities/AdminUserList";
import { AdminNotificationList } from "../entities/AdminNotificationList";

export interface AdminRepository {
  getStats(token: string): Promise<AdminStats>;
  getDetailStats(token: string, startDate?: string, endDate?: string): Promise<AdminDetailStats>;
  getRestaurantList(page: number, size: number, status?: string, keyword?: string): Promise<AdminRestaurantList>;
  getUserList(
    page: number,
    size: number,
    status?: string,
    sort?: string,
    keyword?: string
  ): Promise<AdminUserList>;
  updateUserWarning(userId: number, warnings: number, message: string): Promise<void>;
  suspendUser(userId: number, days: number, message: string): Promise<void>;
  unsuspendUser(userId: number): Promise<void>;
  updateUserRole(userId: number, role: string): Promise<void>;
  getNotifications(): Promise<AdminNotificationList>;
}
