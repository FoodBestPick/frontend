import { useEffect, useState } from "react";
import { AdminRepositoryImpl } from "../../data/repositoriesImpl/AdminRepositoryImpl";
import { AdminRestaurant, AdminRestaurantList } from "../../domain/entities/AdminRestaurantList";
import { GetAdminStats } from "../../domain/usecases/GetAdminStats";

export const AdminRestaurantViewModel = () => {
    const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRestaurants = async (pageNum: number = 0, size: number = 10, status: string = "전체", keyword: string = "") => {
        setLoading(true);
        setError(null);
        try {
            const usecase = new GetAdminStats(AdminRepositoryImpl);
            const response: AdminRestaurantList = await usecase.executeRestaurantList(pageNum, size, status, keyword);

            setRestaurants(response.data);
            setPage(pageNum);
            setHasMore(pageNum + 1 < response.totalPages);
            setTotalPages(response.totalPages);
        } catch (err) {
            console.error(err);
            setError("식당 데이터를 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const loadNextPage = async () => {
        if (hasMore && !loading) {
            await fetchRestaurants(page + 1);
        }
    };

    useEffect(() => {
        fetchRestaurants(0);
    }, []);

    return { restaurants, loading, error, hasMore, totalPages, page, refetch: fetchRestaurants, loadNextPage };
};

