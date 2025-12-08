import { useEffect, useState } from "react";
import { GetAdminStats } from "../../domain/usecases/GetAdminStats";
import { AdminRepositoryImpl } from "../../data/repositoriesImpl/AdminRepositoryImpl";
import { AdminStats } from "../../domain/entities/AdminStats";
import { useAuth } from "../../context/AuthContext";

export const AdminDashBoardViewModel = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);

  const fetchStats = async () => {
    if (!token) return;
    const usecase = new GetAdminStats(AdminRepositoryImpl);
    try {
      const result = await usecase.execute(token);
      setStats(result);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  return { 
    stats,
    fetchStats 
  };
};
