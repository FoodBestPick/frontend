import { useEffect, useState } from "react";
import { GetAdminStats } from "../../domain/usecases/GetAdminStats";
import { AdminRepositoryImpl } from "../../data/repositoriesImpl/AdminRepositoryImpl";

export const AdminDashBoardViewModel = () => {
  const [stats, setStats] = useState({
    users: 0,
    restaurants: 0,
    todayReviews: 0,
    weekReviews: 0,
    monthReviews: 0,
  });

  const fetchStats = async () => {
    const usecase = new GetAdminStats(AdminRepositoryImpl);
    const data = await usecase.execute();
    setStats(data);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, fetchStats };
};
