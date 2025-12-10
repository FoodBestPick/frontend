import { useEffect, useState } from "react";
import { AdminUserList } from "../../domain/entities/AdminUserList";
import { AdminRepositoryImpl } from "../../data/repositoriesImpl/AdminRepositoryImpl";
import { AdminUser } from "../../domain/entities/AdminUserList"; // AdminUser 타입 임포트

export const AdminUserViewModel = () => {
    // 1. 전체 원본 데이터
    const [allUsers, setAllUsers] = useState<AdminUser[]>([]); // 타입 명확히 지정
    
    // 2. 화면에 보여줄 데이터 (필터링됨)
    const [response, setResponse] = useState<AdminUserList | null>(null);
    
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 필터 조건들
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("전체");
    const [sort, setSort] = useState("전체");
    const [keyword, setKeyword] = useState("");

    // 🔄 데이터 초기 로딩 (API 호출은 여기서만!)
    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log("[ViewModel] Fetching all users from API...");
            // 필터 없이 호출하여 전체 데이터를 가져옴 (API는 내부적으로 필터링을 수행할 수도 있지만, ViewModel은 원본을 받음)
            // AdminApi.getUserList는 이미 클라이언트 사이드 필터링을 가정하고 API를 전체 가져오도록 변경된 상태
            const res = await AdminRepositoryImpl.getUserList(1, 10000, "전체", "전체", ""); // page 1, size 10000으로 전체 가져오기
            
            console.log("[ViewModel] Fetched raw data:", res);
            
            if (res && res.data) {
                console.log(`[ViewModel] Got ${res.data.length} raw users.`);
                setAllUsers(res.data); // 전체 리스트 저장
            } else {
                console.warn("[ViewModel] User list is empty or invalid.");
                setAllUsers([]);
            }
        } catch (e: any) {
            console.error("[ViewModel] Error fetching all data:", e);
            setError("사용자 목록을 불러오지 못했습니다.");
            setAllUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // ✨ 필터링 로직 (Client-Side)
    useEffect(() => {
        if (!allUsers.length && !loading) { // 로딩 중이 아니고 데이터가 없다면 필터링하지 않음
             setResponse({ code: 200, message: "success", data: [], page: 1, size: 10, totalPages: 1 });
             return;
        }

        let filtered = [...allUsers];

        // 1. 키워드 검색
        if (keyword && keyword.trim() !== "") {
            const q = keyword.toLowerCase();
            filtered = filtered.filter(
                (u) =>
                    u.name.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q)
            );
        }

        // 2. 상태 필터
        if (status && status !== "전체") {
            filtered = filtered.filter((u) => u.status === status);
        }

        // 3. 정렬
        switch (sort) {
            case "최신 가입순":
                filtered.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
                break;
            case "오래된 가입순":
                filtered.sort((a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime());
                break;
            case "경고 횟수 높은순":
                filtered.sort((a, b) => b.warnings - a.warnings);
                break;
            case "경고 횟수 낮은순":
                filtered.sort((a, b) => a.warnings - b.warnings);
                break;
            default: // "전체" 또는 기타 정렬 없음
                // 정렬을 'id'나 'createdAt' 기준으로 기본적으로 유지 (안정적인 렌더링을 위함)
                filtered.sort((a,b) => a.id - b.id); 
                break;
        }

        // 4. 페이징
        const size = 10; // ViewModel에서 페이징 사이즈를 고정
        const start = (page - 1) * size;
        const paginated = filtered.slice(start, start + size);
        const totalPages = Math.ceil(filtered.length / size);

        setResponse({
            code: 200,
            message: "success",
            data: paginated,
            page,
            size,
            totalPages: totalPages || 1, // totalPages가 0일 경우 1로 설정
        });

    }, [allUsers, page, status, sort, keyword, loading]); // loading 상태도 의존성에 추가

    // 최초 마운트 시 데이터 로드
    useEffect(() => {
        fetchAllData();
    }, []);

    // 경고 부여
    const giveWarning = async (userId: number, message: string) => {
        try {
            await AdminRepositoryImpl.updateUserWarning(userId, 1, message);
            fetchAllData(); // 데이터 갱신
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    // 회원 정지
    const suspendUser = async (userId: number, days: number, message: string) => {
        try {
            await AdminRepositoryImpl.suspendUser(userId, days, message);
            fetchAllData(); // 데이터 갱신
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    // 회원 권한 변경
    const updateUserRole = async (userId: number, role: string) => {
        try {
            await AdminRepositoryImpl.updateUserRole(userId, role);
            fetchAllData(); // 데이터 갱신
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

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

        giveWarning,
        suspendUser,
        updateUserRole, // ⭐ 추가

        refresh: fetchAllData, // refresh는 fetchAllData를 호출
    };
};