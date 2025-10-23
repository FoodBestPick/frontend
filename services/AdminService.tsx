// services/adminService.ts
export async function getAdminStats() {
  // 실제 서버 연동 시 axios 등으로 교체
  return {
    users: 1520,
    reports: 34,
    restaurants: 275,
  };
}
