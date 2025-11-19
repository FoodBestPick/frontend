export interface AdminNotificationItem {
  id: number;
  category: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface AdminNotificationList {
  code: number;
  message: string;
  data: AdminNotificationItem[];
}