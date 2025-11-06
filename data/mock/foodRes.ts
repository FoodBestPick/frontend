export type Store = {
    id: number;
    name: string;
    rating: number; // ✅ 숫자형
    reviews: number; // ✅ 리뷰 수
    image: string[];
};

export type CategoryKey =
    | "전체"
    | "패스트푸드"
    | "카페/디저트"
    | "족발/보쌈"
    | "야식"
    | "한식"
    | "양식"
    | "중식"
    | "분식"
    | "일식";

export const foodRes: Record<Exclude<CategoryKey, "전체">, Store[]> = {
    "패스트푸드": [
        { id: 1, name: "맥도날드 부천점", rating: 4.8, reviews: 200, image: ["https://picsum.photos/seed/ff1/480/320", "https://picsum.photos/seed/ff2/240/160", "https://picsum.photos/seed/ff3/240/160"] },
        { id: 2, name: "버거킹 송내점", rating: 4.6, reviews: 150, image: ["https://picsum.photos/seed/ff4/480/320", "https://picsum.photos/seed/ff5/240/160", "https://picsum.photos/seed/ff6/240/160"] },
        { id: 3, name: "롯데리아 중동점", rating: 4.5, reviews: 100, image: ["https://picsum.photos/seed/ff7/480/320", "https://picsum.photos/seed/ff8/240/160", "https://picsum.photos/seed/ff9/240/160"] },
        { id: 4, name: "맘스터치 부천대점", rating: 4.7, reviews: 180, image: ["https://picsum.photos/seed/ff10/480/320", "https://picsum.photos/seed/ff11/240/160", "https://picsum.photos/seed/ff12/240/160"] },
        { id: 5, name: "쉑쉑버거 홍대점", rating: 4.9, reviews: 300, image: ["https://picsum.photos/seed/ff13/480/320", "https://picsum.photos/seed/ff14/240/160", "https://picsum.photos/seed/ff15/240/160"] },
    ],

    "카페/디저트": [
        { id: 11, name: "투썸플레이스 역곡", rating: 4.9, reviews: 300, image: ["https://picsum.photos/seed/cafe1/480/320", "https://picsum.photos/seed/cafe2/240/160", "https://picsum.photos/seed/cafe3/240/160"] },
        { id: 12, name: "메가커피 중동점", rating: 4.6, reviews: 210, image: ["https://picsum.photos/seed/cafe4/480/320", "https://picsum.photos/seed/cafe5/240/160", "https://picsum.photos/seed/cafe6/240/160"] },
        { id: 13, name: "이디야커피 부천대점", rating: 4.5, reviews: 190, image: ["https://picsum.photos/seed/cafe7/480/320", "https://picsum.photos/seed/cafe8/240/160", "https://picsum.photos/seed/cafe9/240/160"] },
        { id: 14, name: "스타벅스 부천역점", rating: 4.8, reviews: 500, image: ["https://picsum.photos/seed/cafe10/480/320", "https://picsum.photos/seed/cafe11/240/160", "https://picsum.photos/seed/cafe12/240/160"] },
        { id: 15, name: "빽다방 송내점", rating: 4.3, reviews: 140, image: ["https://picsum.photos/seed/cafe13/480/320", "https://picsum.photos/seed/cafe14/240/160", "https://picsum.photos/seed/cafe15/240/160"] },
    ],

    "족발/보쌈": [
        { id: 21, name: "장충동 족발", rating: 4.7, reviews: 180, image: ["https://picsum.photos/seed/jok1/480/320", "https://picsum.photos/seed/jok2/240/160", "https://picsum.photos/seed/jok3/240/160"] },
        { id: 22, name: "보쌈愛", rating: 4.5, reviews: 160, image: ["https://picsum.photos/seed/jok4/480/320", "https://picsum.photos/seed/jok5/240/160", "https://picsum.photos/seed/jok6/240/160"] },
        { id: 23, name: "족발명가", rating: 4.3, reviews: 130, image: ["https://picsum.photos/seed/jok7/480/320", "https://picsum.photos/seed/jok8/240/160", "https://picsum.photos/seed/jok9/240/160"] },
        { id: 24, name: "야식보쌈", rating: 4.5, reviews: 220, image: ["https://picsum.photos/seed/jok10/480/320", "https://picsum.photos/seed/jok11/240/160", "https://picsum.photos/seed/jok12/240/160"] },
        { id: 25, name: "홍보쌈", rating: 4.6, reviews: 170, image: ["https://picsum.photos/seed/jok13/480/320", "https://picsum.photos/seed/jok14/240/160", "https://picsum.photos/seed/jok15/240/160"] },
    ],

    "야식": Array.from({ length: 5 }, (_, i) => ({
        id: 30 + i,
        name: `야식 맛집 ${i + 1}`,
        rating: 4.3 + i * 0.1,
        reviews: 200 + i * 10,
        image: [
            `https://picsum.photos/seed/night${i}1/480/320`,
            `https://picsum.photos/seed/night${i}2/240/160`,
            `https://picsum.photos/seed/night${i}3/240/160`,
        ],
    })),

    "한식": Array.from({ length: 5 }, (_, i) => ({
        id: 40 + i,
        name: `한식당 ${i + 1}`,
        rating: 4.4 + i * 0.1,
        reviews: 180 + i * 15,
        image: [
            `https://picsum.photos/seed/kr${i}1/480/320`,
            `https://picsum.photos/seed/kr${i}2/240/160`,
            `https://picsum.photos/seed/kr${i}3/240/160`,
        ],
    })),

    "양식": Array.from({ length: 5 }, (_, i) => ({
        id: 50 + i,
        name: `양식당 ${i + 1}`,
        rating: 4.3 + i * 0.1,
        reviews: 210 + i * 20,
        image: [
            `https://picsum.photos/seed/w${i}1/480/320`,
            `https://picsum.photos/seed/w${i}2/240/160`,
            `https://picsum.photos/seed/w${i}3/240/160`,
        ],
    })),

    "중식": Array.from({ length: 5 }, (_, i) => ({
        id: 60 + i,
        name: `중식당 ${i + 1}`,
        rating: 4.2 + i * 0.1,
        reviews: 190 + i * 15,
        image: [
            `https://picsum.photos/seed/cn${i}1/480/320`,
            `https://picsum.photos/seed/cn${i}2/240/160`,
            `https://picsum.photos/seed/cn${i}3/240/160`,
        ],
    })),

    "분식": Array.from({ length: 5 }, (_, i) => ({
        id: 70 + i,
        name: `분식집 ${i + 1}`,
        rating: 4.3 + i * 0.1,
        reviews: 250 + i * 10,
        image: [
            `https://picsum.photos/seed/sn${i}1/480/320`,
            `https://picsum.photos/seed/sn${i}2/240/160`,
            `https://picsum.photos/seed/sn${i}3/240/160`,
        ],
    })),

    "일식": Array.from({ length: 5 }, (_, i) => ({
        id: 80 + i,
        name: `스시집 ${i + 1}`,
        rating: 4.5 + i * 0.1,
        reviews: 230 + i * 10,
        image: [
            `https://picsum.photos/seed/jp${i}1/480/320`,
            `https://picsum.photos/seed/jp${i}2/240/160`,
            `https://picsum.photos/seed/jp${i}3/240/160`,
        ],
    })),
};
