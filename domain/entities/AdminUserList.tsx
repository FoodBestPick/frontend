export interface AdminUser {
  id: number;
  name: string;
  email: string;
  avatar: any;
  joinDate: string;
  lastActive: string;
  status: string;
  warnings: number;
  role: string; // ✨ 추가: 사용자 역할 필드
}

export interface AdminUserList {
  code: number;
  message: string;
  data: AdminUser[];
  page: number;
  size: number;
  totalPages: number;
}