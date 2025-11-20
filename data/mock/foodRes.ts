export type Store = {
    id: number;
    name: string;
    rating: number;
    reviews: number;
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
    // 🍔 패스트푸드 — Foodish API (고정)
    "패스트푸드": [
        {
            id: 1,
            name: "맥도날드 부천점",
            rating: 4.8,
            reviews: 200,
            image: [
                "https://foodish-api.com/images/burger/burger36.jpg",
                "https://foodish-api.com/images/burger/burger4.jpg",
                "https://foodish-api.com/images/burger/burger51.jpg",
            ],
        },
        {
            id: 2,
            name: "버거킹 송내점",
            rating: 4.6,
            reviews: 150,
            image: [
                "https://foodish-api.com/images/burger/burger20.jpg",
                "https://foodish-api.com/images/burger/burger34.jpg",
                "https://foodish-api.com/images/burger/burger49.jpg",
            ],
        },
        {
            id: 3,
            name: "롯데리아 중동점",
            rating: 4.5,
            reviews: 100,
            image: [
                "https://foodish-api.com/images/burger/burger30.jpg",
                "https://foodish-api.com/images/burger/burger11.jpg",
                "https://foodish-api.com/images/burger/burger43.jpg",
            ],
        },
        {
            id: 4,
            name: "맘스터치 부천대점",
            rating: 4.7,
            reviews: 180,
            image: [
                "https://foodish-api.com/images/burger/burger8.jpg",
                "https://foodish-api.com/images/burger/burger18.jpg",
                "https://foodish-api.com/images/burger/burger47.jpg",
            ],
        },
        {
            id: 5,
            name: "쉑쉑버거 홍대점",
            rating: 4.9,
            reviews: 300,
            image: [
                "https://foodish-api.com/images/burger/burger15.jpg",
                "https://foodish-api.com/images/burger/burger38.jpg",
                "https://foodish-api.com/images/burger/burger7.jpg",
            ],
        },
    ],

    // ☕ 카페/디저트 — Wikimedia (절대 고정)
    "카페/디저트": [
        {
            id: 11,
            name: "투썸플레이스 역곡",
            rating: 4.9,
            reviews: 300,
            image: [
                "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/640px-A_small_cup_of_coffee.JPG",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Strawberry_cake_with_white_chocolate.jpg/640px-Strawberry_cake_with_white_chocolate.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Macarons%2C_Patisserie_Chez_Eugene%2C_Paris_2015.jpg/640px-Macarons%2C_Patisserie_Chez_Eugene%2C_Paris_2015.jpg",
            ],
        },
        {
            id: 12,
            name: "메가커피 중동점",
            rating: 4.6,
            reviews: 210,
            image: [
                "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/640px-A_small_cup_of_coffee.JPG",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Red_Velvet_Cake.jpg/640px-Red_Velvet_Cake.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Cupcake_chocolate.jpg/640px-Cupcake_chocolate.jpg",
            ],
        },
        {
            id: 13,
            name: "이디야커피 부천대점",
            rating: 4.5,
            reviews: 190,
            image: [
                "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Latte-macchiato_Coffee.jpg/640px-Latte-macchiato_Coffee.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Cheesecake_with_strawberry.jpg/640px-Cheesecake_with_strawberry.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Fruit_tarts_in_HK.JPG/640px-Fruit_tarts_in_HK.JPG",
            ],
        },
        {
            id: 14,
            name: "스타벅스 부천역점",
            rating: 4.8,
            reviews: 500,
            image: [
                "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Cappuccino_at_Sightglass_Coffee.jpg/640px-Cappuccino_at_Sightglass_Coffee.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Tiramisu_-_Ristorante_Cipriani.jpg/640px-Tiramisu_-_Ristorante_Cipriani.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Macarons%2C_Patisserie_Chez_Eugene%2C_Paris_2015.jpg/640px-Macarons%2C_Patisserie_Chez_Eugene%2C_Paris_2015.jpg",
            ],
        },
        {
            id: 15,
            name: "빽다방 송내점",
            rating: 4.3,
            reviews: 140,
            image: [
                "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/640px-A_small_cup_of_coffee.JPG",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Red_Velvet_Cake.jpg/640px-Red_Velvet_Cake.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Cupcake_chocolate.jpg/640px-Cupcake_chocolate.jpg",
            ],
        },
    ],

    // 🐖 족발/보쌈 — Wikimedia (고정)
    "족발/보쌈": [
        {
            id: 21,
            name: "장충동 족발",
            rating: 4.7,
            reviews: 180,
            image: [
                "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Jokbal.jpg/640px-Jokbal.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Bossam_%28boiled_pork%29.JPG/640px-Bossam_%28boiled_pork%29.JPG",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Kimchi_02.jpg/640px-Kimchi_02.jpg",
            ],
        },
        {
            id: 22,
            name: "보쌈愛",
            rating: 4.5,
            reviews: 160,
            image: [
                "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Bossam_%28boiled_pork%29.JPG/640px-Bossam_%28boiled_pork%29.JPG",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Jokbal.jpg/640px-Jokbal.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Kimchi_02.jpg/640px-Kimchi_02.jpg",
            ],
        },
        {
            id: 23,
            name: "족발명가",
            rating: 4.3,
            reviews: 130,
            image: [
                "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Jokbal.jpg/640px-Jokbal.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Bossam_%28boiled_pork%29.JPG/640px-Bossam_%28boiled_pork%29.JPG",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Kimchi_02.jpg/640px-Kimchi_02.jpg",
            ],
        },
        {
            id: 24,
            name: "야식보쌈",
            rating: 4.5,
            reviews: 220,
            image: [
                "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Bossam_%28boiled_pork%29.JPG/640px-Bossam_%28boiled_pork%29.JPG",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Jokbal.jpg/640px-Jokbal.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Kimchi_02.jpg/640px-Kimchi_02.jpg",
            ],
        },
        {
            id: 25,
            name: "홍보쌈",
            rating: 4.6,
            reviews: 170,
            image: [
                "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Jokbal.jpg/640px-Jokbal.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Bossam_%28boiled_pork%29.JPG/640px-Bossam_%28boiled_pork%29.JPG",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Kimchi_02.jpg/640px-Kimchi_02.jpg",
            ],
        },
    ],

    // 🌙 야식 — Foodish + fried rice Wikimedia
    "야식": Array.from({ length: 5 }, (_, i) => ({
        id: 30 + i,
        name: `야식 맛집 ${i + 1}`,
        rating: 4.3 + i * 0.1,
        reviews: 200 + i * 10,
        image: [
            "https://foodish-api.com/images/chicken/chicken38.jpg",
            "https://foodish-api.com/images/ramen/ramen12.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Fried_rice_with_egg.jpg/640px-Fried_rice_with_egg.jpg",
        ],
    })),

    // 🍚 한식 — Wikipedia (고정)
    "한식": Array.from({ length: 5 }, (_, i) => ({
        id: 40 + i,
        name: `한식당 ${i + 1}`,
        rating: 4.4 + i * 0.1,
        reviews: 180 + i * 15,
        image: [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Dolsot-bibimbap.jpg/640px-Dolsot-bibimbap.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Kimchi_jjigae.jpg/640px-Kimchi_jjigae.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Various_korean_side_dishes.JPG/640px-Various_korean_side_dishes.JPG",
        ],
    })),

    // 🍝 양식 — Wikimedia
    "양식": Array.from({ length: 5 }, (_, i) => ({
        id: 50 + i,
        name: `양식당 ${i + 1}`,
        rating: 4.3 + i * 0.1,
        reviews: 210 + i * 20,
        image: [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Spaghetti_aglio_e_olio.jpg/640px-Spaghetti_aglio_e_olio.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Beef_Steak_03.jpg/640px-Beef_Steak_03.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Margherita_Originale.JPG/640px-Margherita_Originale.JPG",
        ],
    })),

    // 🍜 중식 — Wikipedia
    "중식": Array.from({ length: 5 }, (_, i) => ({
        id: 60 + i,
        name: `중식당 ${i + 1}`,
        rating: 4.2 + i * 0.1,
        reviews: 190 + i * 15,
        image: [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Jajangmyeon_%28Korean_black_bean_noodles%29.jpg/640px-Jajangmyeon_%28Korean_black_bean_noodles%29.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Jjamppong.jpg/640px-Jjamppong.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Fried_rice_with_egg.jpg/640px-Fried_rice_with_egg.jpg",
        ],
    })),

    // 🌭 분식 — Wikipedia
    "분식": Array.from({ length: 5 }, (_, i) => ({
        id: 70 + i,
        name: `분식집 ${i + 1}`,
        rating: 4.3 + i * 0.1,
        reviews: 250 + i * 10,
        image: [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Tteokbokki_%28Korean_spicy_rice_cake%29.jpg/640px-Tteokbokki_%28Korean_spicy_rice_cake%29.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Gimbap_%28Korean_sushi_roll%29.jpg/640px-Gimbap_%28Korean_sushi_roll%29.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Sundae_%28Korean_Style_Sausage%29.jpg/640px-Sundae_%28Korean_Style_Sausage%29.jpg",
        ],
    })),

    // 🍣 일식 — Foodish API + Wikimedia
    "일식": Array.from({ length: 5 }, (_, i) => ({
        id: 80 + i,
        name: `스시집 ${i + 1}`,
        rating: 4.5 + i * 0.1,
        reviews: 230 + i * 10,
        image: [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Various_sushi.jpg/640px-Various_sushi.jpg",
            "https://foodish-api.com/images/ramen/ramen9.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Udon_noodles.jpg/640px-Udon_noodles.jpg",
        ],
    })),
};
