import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../core/constants/colors";
import { Header } from "../components/Header";
import { AdminRestaurantViewModel } from "../viewmodels/AdminRestaurantViewModels";
import { AdminRestaurant } from "../../domain/entities/AdminRestaurantList";

export const AdminRestaurantScreen = () => {
  const { restaurants, loading, error, totalPages, refetch, page, hasMore } =
    AdminRestaurantViewModel();

  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setSearchQuery("");
    setSelectedStatus("전체");
    await refetch(0, 10, "전체", "");
    setRefreshing(false);
  }, []);

  useEffect(() => {
    refetch(0, 10, selectedStatus, searchQuery);
  }, [selectedStatus, searchQuery]);

  const statusTabs = ["전체", "운영중", "승인대기", "수정요청"];

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case "승인대기":
        return { backgroundColor: "#FFF4CC", color: "#B8860B" };
      case "수정요청":
        return { backgroundColor: "#FFE0E0", color: "#C62828" };
      case "운영중":
        return { backgroundColor: "#E3F2FD", color: "#0277BD" };
      default:
        return { backgroundColor: "#E8EAF6", color: "#5C6BC0" };
    }
  };

  const filteredRestaurants = restaurants.filter((r: AdminRestaurant) => {
    const statusValue = r.status ?? "운영중";
    const matchesSearch = r.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "전체" || statusValue === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <View style={styles.container}>
      <Header title="식당 관리" />

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#777" />
        <TextInput
          style={styles.input}
          placeholder="식당명을 검색하세요"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            refetch(0, 10, selectedStatus, text);
          }}
        />
      </View>

      {/* 필터 탭 */}
      <View style={styles.tabRow}>
        {statusTabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              selectedStatus === tab && styles.tabButtonActive,
            ]}
            onPress={() => {
              setSelectedStatus(tab);
              refetch(0, 10, tab, searchQuery);
            }}
          >
            <Text
              style={[
                styles.tabText,
                selectedStatus === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 리스트 */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && page === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ marginTop: 10, color: "#555" }}>
              식당 데이터를 불러오는 중...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={{ color: "red" }}>{error}</Text>
          </View>
        ) : filteredRestaurants.length === 0 ? (
          <View style={styles.center}>
            <Text style={{ color: "#777" }}>표시할 식당이 없습니다.</Text>
          </View>
        ) : (
          filteredRestaurants.map((r) => {
            const badgeStyle = getStatusStyle(r.status);
            const statusValue = r.status ?? "운영중";

            return (
              <View key={r.id} style={styles.card}>
                <Image source={r.image} style={styles.thumbnail} />
                <View style={styles.info}>
                  <Text style={styles.name}>{r.name}</Text>

                  <View style={styles.row}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.rating}>{r.rating.toFixed(1)}</Text>
                    <Ionicons
                      name="chatbubble-outline"
                      size={13}
                      color="#777"
                      style={{ marginLeft: 6 }}
                    />
                    <Text style={styles.review}>{r.review}</Text>
                  </View>

                  <View style={styles.bottomRow}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: badgeStyle.backgroundColor },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: badgeStyle.color }]}
                      >
                        {statusValue}
                      </Text>
                    </View>

                    <View style={styles.iconRow}>
                      <TouchableOpacity onPress={() => console.log("삭제")}>
                        <MaterialIcons
                          name="close"
                          size={20}
                          color="#D32F2F"
                        />
                      </TouchableOpacity>

                      {(statusValue === "수정요청" ||
                        statusValue === "운영중") && (
                          <TouchableOpacity
                            onPress={() => console.log("수정 페이지 이동")}
                          >
                            <MaterialIcons
                              name="edit"
                              size={20}
                              color="#0A84FF"
                            />
                          </TouchableOpacity>
                        )}

                      {statusValue === "승인대기" && (
                        <TouchableOpacity
                          onPress={() => console.log("승인 처리 로직")}
                        >
                          <MaterialIcons
                            name="check"
                            size={20}
                            color="#4CAF50"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}

        {!loading && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              disabled={page <= 0}
              onPress={() => refetch(page - 1)}
            >
              <Text style={[styles.arrow, page <= 0 && styles.disabledArrow]}>
                {"<"}
              </Text>
            </TouchableOpacity>

            <View style={styles.pageNumberContainer}>
              {(() => {
                const maxVisible = 5; // 한 번에 보여줄 페이지 수
                const currentBlock = Math.floor(page / maxVisible);
                const startPage = currentBlock * maxVisible;
                const endPage = Math.min(startPage + maxVisible, totalPages);

                const pages = [];
                for (let i = startPage; i < endPage; i++) {
                  pages.push(i);
                }

                return (
                  <>
                    {pages.map((p) => {
                      const isActive = p === page;
                      return (
                        <TouchableOpacity key={`page-${p}`} onPress={() => refetch(p, 10, selectedStatus, searchQuery)}>
                          <Text
                            style={[
                              styles.pageText,
                              isActive && styles.activePageText,
                            ]}
                          >
                            {p + 1}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}

                    {/* ... 마지막 페이지로 넘어가는 ... */}
                    {endPage < totalPages && (
                      <>
                        <Text style={styles.ellipsis}>...</Text>
                        <TouchableOpacity onPress={() => refetch(totalPages - 1, 10, selectedStatus)}>
                          <Text style={styles.pageText}>{totalPages}</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </>
                );
              })()}
            </View>

            <TouchableOpacity
              disabled={page >= totalPages - 1}
              onPress={() => refetch(page + 1)}
            >
              <Text
                style={[styles.arrow, page >= totalPages - 1 && styles.disabledArrow]}
              >
                {">"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 6,
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },

  input: {
    flex: 1,
    marginLeft: 8,
  },

  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },

  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 17,
    borderRadius: 12,
    backgroundColor: "#F2F2F2",
  },

  tabButtonActive: {
    backgroundColor: "#0A84FF",
  },

  tabText: {
    color: "#333",
    fontWeight: "600",
  },

  tabTextActive: {
    color: "#fff",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },

  info: { flex: 1 },

  name: { fontSize: 15, fontWeight: "bold", color: "#222" },

  row: { flexDirection: "row", alignItems: "center", marginTop: 4 },

  rating: { fontSize: 13, color: "#555", marginLeft: 3 },

  review: { fontSize: 13, color: "#555", marginLeft: 2 },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },

  statusBadge: {
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },

  statusText: { fontSize: 12, fontWeight: "600" },

  iconRow: { flexDirection: "row", alignItems: "center", gap: 8 },


  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 12,
  },

  pageNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  pageText: {
    fontSize: 16,
    color: "#444",
    fontWeight: "500",
  },

  activePageText: {
    color: "#0A84FF",
    fontWeight: "700",
    textDecorationLine: "underline",
  },

  ellipsis: {
    fontSize: 15,
    color: "#777",
  },

  arrow: {
    fontSize: 18,
    color: "#0A84FF",
    paddingHorizontal: 4,
  },

  disabledArrow: {
    color: "#ccc",
  },
});
