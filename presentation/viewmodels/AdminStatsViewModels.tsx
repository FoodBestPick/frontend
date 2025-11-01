import { useEffect, useState } from "react";
import { GetAdminStats } from "../../domain/usecases/GetAdminStats";
import { AdminRepositoryImpl } from "../../data/repositoriesImpl/AdminRepositoryImpl";
import { AdminDetailStats } from "../../domain/entities/AdminDetailStats";

export const AdminStatsViewModels = () => {
  const [statsDetail, setStatsDetail] = useState<AdminDetailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetailStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const usecase = new GetAdminStats(AdminRepositoryImpl);
      const data = await usecase.executeDetail();
      setStatsDetail(data);
    } catch (err) {
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetailStats();
  }, []);

   return {
    statsDetail,
    today: statsDetail?.data?.today,
    week: statsDetail?.data?.week,
    month: statsDetail?.data?.month,
    custom: statsDetail?.data?.custom,
    loading,
    error,
    refetch: fetchDetailStats,
  };
};