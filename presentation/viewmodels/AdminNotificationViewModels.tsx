import { useEffect, useState } from "react";
import { GetAdminStats } from "../../domain/usecases/GetAdminStats";
import { AdminRepositoryImpl } from "../../data/repositoriesImpl/AdminRepositoryImpl";
import { AdminNotificationList } from "../../domain/entities/AdminNotificationList";

export const AdminNotificationViewModels = () => {
  const [response, setResponse] = useState<AdminNotificationList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotificationList = async () => {
    try {
      setLoading(true);
       const usecase = new GetAdminStats(AdminRepositoryImpl);
      const res = await usecase.executeNotifications();
      setResponse(res);
    } catch {
      setError("알림 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationList();
  }, []);

  return {
    response,
    loading,
    error,
    refresh: fetchNotificationList,
  };
};
