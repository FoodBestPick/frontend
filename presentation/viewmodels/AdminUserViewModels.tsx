import { useEffect, useState } from "react";
import { AdminUserList } from "../../domain/entities/AdminUserList";
import { GetAdminStats } from "../../domain/usecases/GetAdminStats";
import { AdminRepositoryImpl } from "../../data/repositoriesImpl/AdminRepositoryImpl";

export const AdminUserViewModel = () => {
    const [response, setResponse] = useState<AdminUserList | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("전체");
    const [sort, setSort] = useState("전체");
    const [keyword, setKeyword] = useState("");

    const usecase = new GetAdminStats(AdminRepositoryImpl);

    const fetchUserList = async (
        pageNum: number,
        size: number,
        status: string,
        sort: string,
        keyword: string
    ) => {
        try {
            setLoading(true);
            const res = await usecase.executeUserList(pageNum, size, status, sort, keyword);
            setResponse(res);
        } catch (e) {
            setError("사용자 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserList(
            page - 1,
            10,
            status,
            sort,
            keyword
        );
    }, [page, status, sort, keyword]);

    return {
        response,
        loading,
        error,

        page,
        setPage,

        status,
        setStatus,

        sort,
        setSort,

        keyword,
        setKeyword,

        refresh: (p = page - 1, s = 10, st = status, so = sort, k = keyword) =>
            fetchUserList(p, s, st, so, k),
    };
};
