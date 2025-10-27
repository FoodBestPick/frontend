import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../core/constants/colors";
import { Header } from "../components/Header"

export const AdminUserScreen = () => {
  const [expandedUsers, setExpandedUsers] = useState<number[]>([]);
  const [page, setPage] = useState(1);

  const users = [
    {
      id: 1,
      name: "맛집탐험가",
      email: "minjun.kim@example.com",
      avatar: require("../../assets/user1.png"),
      joinDate: "2023-03-15",
      lastActive: "2024-07-28",
      status: "활성",
      warnings: 0,
    },
    {
      id: 2,
      name: "서연의맛집",
      email: "seoyeon.lee@example.com",
      avatar: require("../../assets/user2.png"),
      joinDate: "2023-04-22",
      lastActive: "2024-07-25",
      status: "비활성",
      warnings: 1,
    },
    // ...더 추가
    ];

    const toggleUser = (id: number) => {
        setExpandedUsers((prev) =>
            prev.includes(id)
                ? prev.filter((userId) => userId !== id) 
                : [...prev, id]
        );
    };

  const usersPerPage = 10;
  const paginatedUsers = users.slice((page - 1) * usersPerPage, page * usersPerPage);

  return (
    <View style={styles.container}>
      <Header title="회원 관리" />

      {/* 검색창 */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#777" />
        <TextInput style={styles.input} placeholder="닉네임 또는 이메일로 검색" />
      </View>

      {/* 필터/정렬 */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.dropdown}>
          <Text>상태 ▼</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dropdown}>
          <Text>정렬 기준 ▼</Text>
        </TouchableOpacity>
          </View>

          {/* 사용자 카드 목록 */}
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
              {paginatedUsers.map((user) => (
                  <View key={user.id} style={styles.card}>
                      <TouchableOpacity
                          style={styles.cardHeader}
                          onPress={() => toggleUser(user.id)} 
                      >
                          <View style={styles.userInfo}>
                              <Image source={user.avatar} style={styles.avatar} />
                              <View>
                                  <Text style={styles.userName}>{user.name}</Text>
                                  <Text style={styles.userEmail}>{user.email}</Text>
                              </View>
                          </View>
                          <Ionicons
                              name={expandedUsers.includes(user.id) ? "chevron-up" : "chevron-down"} // ✅ 변경
                              size={20}
                              color="#777"
                          />
                      </TouchableOpacity>
                      {expandedUsers.includes(user.id) && ( 
                          <View style={styles.detailSection}>
                              <Text>가입일: {user.joinDate}</Text>
                              <Text>마지막 활동일: {user.lastActive}</Text>
                              <Text>
                                  상태:{" "}
                                  <Text
                                      style={{
                                          color:
                                              user.status === "활성"
                                                  ? "#4CAF50"
                                                  : user.status === "정지"
                                                      ? "#E53935"
                                                      : "#999",
                                      }}
                                  >
                                      {user.status}
                                  </Text>
                              </Text>
                              <Text>경고 횟수: {user.warnings}</Text>

                              <View style={styles.actionRow}>
                                  <TouchableOpacity style={styles.actionBtn}>
                                      <Text style={styles.actionText}>권한 변경</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                      style={[
                                          styles.actionBtn,
                                          { backgroundColor: "#ffcccc" },
                                      ]}
                                  >
                                      <Text style={[styles.actionText, { color: "#b00020" }]}>
                                          {user.status === "정지" ? "정지 해제" : "계정 정지"}
                                      </Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                      style={[styles.actionBtn, { backgroundColor: "#ffe0b2" }]}
                                  >
                                      <Text style={[styles.actionText, { color: "#e65100" }]}>
                                          경고 추가
                                      </Text>
                                  </TouchableOpacity>
                              </View>
                          </View>
                      )}
                  </View>
              ))}
      </ScrollView>

      {/* 페이지네이션 */}
      <View style={styles.pagination}>
        <TouchableOpacity disabled={page === 1} onPress={() => setPage(page - 1)}>
          <Text style={[styles.pageBtn, page === 1 && { color: "#aaa" }]}>〈</Text>
        </TouchableOpacity>
        <Text style={styles.pageNum}>{page}</Text>
        <TouchableOpacity
          disabled={page * usersPerPage >= users.length}
          onPress={() => setPage(page + 1)}
        >
          <Text
            style={[
              styles.pageBtn,
              page * usersPerPage >= users.length && { color: "#aaa" },
            ]}
          >
            〉
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB", paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  input: { flex: 1, marginLeft: 8 },

  filterRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  dropdown: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  userName: { fontSize: 15, fontWeight: "bold" },
  userEmail: { fontSize: 13, color: "#777" },

  detailSection: { marginTop: 10, gap: 4 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionBtn: {
    backgroundColor: "#e0f2f1",
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  actionText: { fontSize: 13, fontWeight: "bold" },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  pageBtn: { fontSize: 20, color: COLORS.primary, marginHorizontal: 14 },
  pageNum: { fontSize: 16, fontWeight: "bold" },
});
