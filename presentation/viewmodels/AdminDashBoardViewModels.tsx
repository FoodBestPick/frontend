import { useEffect, useState } from "react";
import { GetAdminStats } from "../../domain/usecases/GetAdminStats";
import { AdminRepositoryImpl } from "../../data/repositoriesImpl/AdminRepositoryImpl";
import { AdminStats } from "../../domain/entities/AdminStats";

export const AdminDashBoardViewModel = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);

  const fetchStats = async () => {
    const usecase = new GetAdminStats(AdminRepositoryImpl);
    const result = await usecase.execute();
    setStats(result); 
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { 
    stats,
    
    fetchStats };
};
