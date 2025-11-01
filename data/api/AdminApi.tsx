export const AdminApi = {
  async getStats() {
        return Promise.resolve({
            users: 12346,
            restaurants: 1234,
            todayReviews: 60,
            weekReviews: 342,
            monthReviews: 1428,
        });
  },

  async getDetailStats() {
    return Promise.resolve({
      code: 200,
      message: "성공적으로 처리되었습니다.",
      data: {
        today: {
          visitors: 1230,
          joins: 58,
          restaurants: 12,
          reviews: 150,
          visitorRate: 5.2,
          joinRate: 8.1,
          restaurantRate: -3.2,
          reviewRate: 12.5,
          timeSeries: [18, 32, 54, 20],
          categories: {
            한식: 50,
            중식: 25,
            일식: 15,
            양식: 5,
            기타: 5,
          },
          ratingDistribution: [8, 14, 30, 45, 55],
          topSearches: [
            { term: "마라탕", count: 1250 },
            { term: "강남역 맛집", count: 980 },
            { term: "성수동 카페", count: 870 },
            { term: "홍대 파스타", count: 760 },
            { term: "잠실 롯데월드몰", count: 650 },
          ],
          pie: [
            { name: "검색", population: 40 },
            { name: "SNS", population: 25 },
            { name: "광고", population: 20 },
            { name: "기타", population: 15 },
          ],
        },

        week: {
          visitors: 1240,
          joins: 82,
          restaurants: 56,
          reviews: 248,
          visitorRate: 12.5,
          joinRate: 5.2,
          restaurantRate: -2.1,
          reviewRate: 8.7,
          timeSeries: [30, 55, 45, 50, 32, 20, 58],
          categories: {
            기타: 35,
            양식: 25,
            일식: 25,
            중식: 20,
            한식: 15,
          },
          ratingDistribution: [5, 12, 26, 40, 52],
          topSearches: [
            { term: "강남역 맛집", count: 1204 },
            { term: "홍대 파스타", count: 987 },
            { term: "마라탕", count: 852 },
            { term: "잠실 롯데월드몰", count: 763 },
            { term: "성수동 카페", count: 610 },
          ],
          pie: [
            { name: "검색", population: 20 },
            { name: "SNS", population: 40 },
            { name: "광고", population: 15 },
            { name: "기타", population: 20 },
          ],
        },

        month: {
          visitors: 12870,
          joins: 950,
          restaurants: 345,
          reviews: 2150,
          visitorRate: 18.2,
          joinRate: 15.8,
          restaurantRate: 4.3,
          reviewRate: 11.4,
          timeSeries: [35, 48, 42, 55],
          categories: {
            한식: 40,
            중식: 28,
            일식: 18,
            양식: 10,
            기타: 4,
          },
          ratingDistribution: [6, 10, 24, 38, 60],
          topSearches: [
            { term: "강남역 맛집", count: 15320 },
            { term: "마라탕", count: 12890 },
            { term: "홍대 파스타", count: 11540 },
            { term: "성수동 카페", count: 9820 },
            { term: "잠실 롯데월드몰", count: 8760 },
          ],
          pie: [
            { name: "검색", population: 30 },
            { name: "SNS", population: 35 },
            { name: "광고", population: 20 },
            { name: "기타", population: 15 },
          ],
        },

        custom: {
          visitors: 4500,
          joins: 950,
          restaurants: 345,
          reviews: 2150,
          visitorRate: 18.2,
          joinRate: 15.8,
          restaurantRate: 4.3,
          reviewRate: 11.4,
          timeSeries: [35, 48, 42, 55, 22,11],
          categories: {
            한식: 40,
            중식: 28,
            일식: 18,
            양식: 10,
            기타: 4,
          },
          ratingDistribution: [6, 10, 24, 38, 60],
          topSearches: [
            { term: "강남역 맛집", count: 15320 },
            { term: "마라탕", count: 12890 },
            { term: "홍대 파스타", count: 11540 },
            { term: "성수동 카페", count: 9820 },
            { term: "잠실 롯데월드몰", count: 8760 },
          ],
          pie: [
            { name: "검색", population: 10 },
            { name: "SNS", population: 20 },
            { name: "광고", population: 30 },
            { name: "기타", population: 40 },
          ],
        },
      },
    });
  }
};