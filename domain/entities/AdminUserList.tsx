export interface AdminUser {
  id: number;
  name: string;
  email: string;
  avatar: any;
  joinDate: string;
  lastActive: string;
  status: string;
  warnings: number;
}

export interface AdminUserList {
  code: number;
  message: string;
  data: AdminUser[];
  page: number;
  size: number;
  totalPages: number;
}