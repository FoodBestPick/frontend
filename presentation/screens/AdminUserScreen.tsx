import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  TextInput as RNTextInput,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../core/constants/colors";
import { Header } from "../components/Header";

export const AdminUserScreen = () => {
  const [expandedUsers, setExpandedUsers] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [activeModal, setActiveModal] = useState<{
    type: "permission" | "suspend" | "warning" | null;
    user?: any;
  }>({ type: null, user: null });
  const [successModal, setSuccessModal] = useState({
    visible: false,
    type: "",
    user: null,
    extra: "",
  });

  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [selectedSort, setSelectedSort] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  const statusOptions = [
    { label: "전체", value: "전체" },
    { label: "접속중", value: "접속중" },
    { label: "미접속", value: "미접속" },
    { label: "정지", value: "정지" },
  ];
  const sortOptions = [
    { label: "전체", value: "전체" },
    { label: "최신 가입순", value: "최신 가입순" },
    { label: "오래된 가입순", value: "오래된 가입순" },
    { label: "경고 횟수 높은순", value: "경고 횟수 높은순" },
    { label: "경고 횟수 낮은순", value: "경고 횟수 낮은순" },
  ];

  const users = [
    {
      id: 1,
      name: "맛집탐험가",
      email: "minjun.kim@example.com",
      avatar: require("../../assets/user1.png"),
      joinDate: "2023-03-15",
      lastActive: "2024-07-28",
      status: "접속중",
      warnings: 0,
    },
    {
      id: 2,
      name: "서연의맛집",
      email: "seoyeon.lee@example.com",
      avatar: require("../../assets/user2.png"),
      joinDate: "2023-04-22",
      lastActive: "2024-07-25",
      status: "미접속",
      warnings: 1,
    },
  ];

  const toggleUser = (id: number) => {
    setExpandedUsers((prev) =>
      prev.includes(id)
        ? prev.filter((userId) => userId !== id)
        : [...prev, id]
    );
  };

  const filteredUsers = users.filter((u) => {
    const matchesStatus =
      selectedStatus === "전체" || u.status === selectedStatus;

    const matchesSearch =
      searchQuery.trim() === "" ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (selectedSort) {
      case "최신 가입순":
      case "newest":
        return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
      case "오래된 가입순":
      case "oldest":
        return new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
      case "경고 횟수 높은순":
      case "warn_high":
        return b.warnings - a.warnings;
      case "경고 횟수 낮은순":
      case "warn_low":
        return a.warnings - b.warnings;
      case "전체":
      case "none":
      default:
        return 0; 
    }
  });

  const usersPerPage = 10;
  const paginatedUsers = sortedUsers.slice(
    (page - 1) * usersPerPage,
    page * usersPerPage
  );
  return (
    <View style={styles.container}>
      <Header title="회원 관리" />

      {/* 검색창 */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#777" />
        <TextInput
          style={styles.input}
          placeholder="닉네임 또는 이메일로 검색"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.dropdownRow}>
        <Dropdown
          style={styles.dropdown}
          data={statusOptions}
          labelField="label"
          valueField="value"
          placeholder="상태 선택"
          placeholderStyle={styles.placeholderText}
          selectedTextStyle={styles.selectedText}
          value={selectedStatus}
          onChange={(item) => setSelectedStatus(item.value)}
        />
        <Dropdown
          style={styles.dropdown}
          data={sortOptions}
          labelField="label"
          valueField="value"
          placeholder="정렬 기준"
          placeholderStyle={styles.placeholderText}
          selectedTextStyle={styles.selectedText}
          value={selectedSort}
          onChange={(item) => setSelectedSort(item.value)}
        />
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
                name={
                  expandedUsers.includes(user.id)
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={20}
                color="#777"
              />
            </TouchableOpacity>

            {expandedUsers.includes(user.id) && (
              <View style={styles.detailSection}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>가입일</Text>
                  <Text style={styles.detailValue}>{user.joinDate}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>마지막 활동일</Text>
                  <Text style={styles.detailValue}>{user.lastActive}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>상태</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color:
                          user.status === "접속중"
                            ? "#4CAF50"
                            : user.status === "정지"
                              ? "#E53935"
                              : "#999",
                      },
                    ]}
                  >
                    {user.status}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>경고 횟수</Text>
                  <Text style={styles.detailValue}>{user.warnings}</Text>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => setActiveModal({ type: "permission", user })}
                  >
                    <Text style={styles.actionText}>권한 변경</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#ffcccc" }]}
                    onPress={() => setActiveModal({ type: "suspend", user })}
                  >
                    <Text style={[styles.actionText, { color: "#b00020" }]}>
                      {user.status === "정지" ? "정지 해제" : "계정 정지"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#ffe0b2" }]}
                    onPress={() => setActiveModal({ type: "warning", user })}
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

      {/* 모달 3개 */}
      <PermissionModal
        visible={activeModal.type === "permission"}
        onClose={() => setActiveModal({ type: null })}
        user={activeModal.user}
        setSuccessModal={setSuccessModal}
      />
      <SuspendModal
        visible={activeModal.type === "suspend"}
        onClose={() => setActiveModal({ type: null })}
        user={activeModal.user}
        setSuccessModal={setSuccessModal}
      />
      <WarningModal
        visible={activeModal.type === "warning"}
        onClose={() => setActiveModal({ type: null })}
        user={activeModal.user}
        setSuccessModal={setSuccessModal}
      />
      <SuccessModal
        visible={successModal.visible}
        onClose={() => setSuccessModal({ visible: false, type: "", user: null, extra: "" })} 
        type={successModal.type}
        user={successModal.user}
        extra={successModal.extra}
      />
    </View>
  );
};
const PermissionModal = ({ visible, onClose, user, setSuccessModal }: any) => {
  const [role, setRole] = useState("사용자");

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>권한 변경</Text>
          <Text style={styles.modalSub}>{user?.name}님의 권한을 변경합니다.</Text>

          {/* 현재 권한 */}
          <View style={styles.permissionRow}>
            <Text style={[styles.modalLabel, { marginTop: 1 }]}>현재 권한</Text>
            <Text style={[styles.modalValue, { marginLeft: 20 }]}>사용자</Text>
          </View>

          <View style={styles.modalDivider} />

          {/* 변경할 권한 */}
          <Text style={[styles.modalLabel, { marginTop: 14 }]}>변경할 권한</Text>
          <View style={{ marginTop: 8, gap: 10 }}>
            {["관리자", "사용자"].map((r) => (
              <TouchableOpacity
                key={r}
                style={styles.radioItem}
                onPress={() => setRole(r)}
                activeOpacity={0.8}
              >
                <View style={styles.radioOuter}>
                  {role === r && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => {
                onClose();
                setSuccessModal({
                  visible: true,
                  type: "permission",
                  user,
                  extra: role,
                });
              }}
            >
              <Text style={styles.applyText}>변경 적용</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const SuspendModal = ({ visible, onClose, user, setSuccessModal }: any) => {
  const [selectedPeriod, setSelectedPeriod] = useState("1일");
  const [reason, setReason] = useState("");
  const periods = ["1일", "3일", "7일", "30일", "영구 정지"];

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>계정 상태 변경</Text>
          <Text style={styles.modalSub}>사용자: {user?.name}</Text>

          <View style={styles.modalDivider} />

          <Text style={styles.modalLabel}>정지 기간</Text>
          <View style={{ marginTop: 8, gap: 10 }}>
            {periods.map((p) => (
              <TouchableOpacity
                key={p}
                style={styles.radioItem}
                onPress={() => setSelectedPeriod(p)}
                activeOpacity={0.8}
              >
                <View style={styles.radioOuter}>
                  {selectedPeriod === p && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.modalLabel, { marginTop: 14 }]}>정지 사유</Text>
          <RNTextInput
            style={styles.textArea}
            placeholder="사용자에게 전달될 정지 사유를 입력해주세요. (예: 광고성 리뷰)"
            multiline
            value={reason}
            onChangeText={setReason}
          />

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: "#E53935" }]}
              onPress={() => {
                onClose();
                setSuccessModal({
                  visible: true,
                  type: "suspend",
                  user,
                  extra: selectedPeriod,
                });
              }}
            >
              <Text style={styles.applyText}>정지 적용</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const WarningModal = ({ visible, onClose, user, setSuccessModal }: any) => {
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [level, setLevel] = useState("1회");

  const levelOptions = [
    { label: "1회", value: "1회" },
    { label: "2회", value: "2회" },
    { label: "3회", value: "3회" },
    { label: "4회", value: "4회" },
    { label: "5회", value: "5회" },
  ];

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>경고 추가</Text>
          <Text style={styles.modalSub}>사용자: {user?.email}</Text>

          <Text style={styles.modalLabel}>경고 사유</Text>
          <RNTextInput
            style={styles.textField}
            placeholder="예: 부적절한 리뷰 작성"
            value={reason}
            onChangeText={setReason}
          />

          <RNTextInput
            style={styles.textArea}
            placeholder="경고 사유를 구체적으로 입력해주세요."
            multiline
            value={detail}
            onChangeText={setDetail}
          />

          <Text style={styles.modalLabel}>경고 수준</Text>
          <Dropdown
            style={styles.dropdownField}
            data={levelOptions}
            labelField="label"
            valueField="value"
            value={level}
            placeholder="선택하세요"
            onChange={(item) => setLevel(item.value)}
          />

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: "#FF5252" }]}
              onPress={() => {
                onClose();
                setSuccessModal({
                  visible: true,
                  type: "warning",
                  user,
                  extra: level,
                });
              }}
            >
              <Text style={styles.applyText}>경고 추가</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const SuccessModal = ({ visible, onClose, type, user, extra }: any) => {
  if (!visible) return null;

  const getContent = () => {
    switch (type) {
      case "permission":
        return {
          icon: "settings-outline",
          color: "#007AFF",
          title: "권한 변경이 완료되었습니다!",
          subtitle: `${user?.name}님의 권한이 ${extra}로 변경되었습니다.`,
          buttonColor: "#007AFF",
        };
      case "suspend":
        return {
          icon: "close-circle-outline",
          color: "#E53935",
          title: "계정 정지 조치가 완료되었습니다!",
          subtitle: `${user?.name}님의 계정이 ${extra}간 정지되었습니다.`,
          buttonColor: "#007AFF",
        };
      case "warning":
        return {
          icon: "alert-circle-outline",
          color: "#FF9800",
          title: "경고 추가 완료!",
          subtitle: `경고 ${extra}가 성공적으로 추가되었습니다.`,
          buttonColor: "#FF5252",
        };
      default:
        return { icon: "checkmark-circle-outline", color: "#007AFF", title: "", subtitle: "", buttonColor: "#007AFF" };
    }
  };

  const { icon, color, title, subtitle, buttonColor } = getContent();

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.successBox}>
          <View style={[styles.successIcon, { backgroundColor: `${color}1A` }]}>
            <Ionicons name={icon} size={42} color={color} />
          </View>
          <Text style={styles.successTitle}>{title}</Text>
          <Text style={styles.successSub}>{subtitle}</Text>

          <TouchableOpacity
            style={[styles.successBtn, { backgroundColor: buttonColor }]}
            onPress={onClose}
          >
            <Text style={styles.successBtnText}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB", paddingHorizontal: 16 },
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
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  userName: { fontSize: 15, fontWeight: "bold" },
  userEmail: { fontSize: 13, color: "#777" },
  detailSection: { marginTop: 10, gap: 6 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  detailLabel: { fontSize: 14, color: "#555" },
  detailValue: { fontSize: 14, fontWeight: "500", color: "#222", textAlign: "right" },
  actionRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  actionBtn: {
    backgroundColor: "#e0f2f1",
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  actionText: { fontSize: 13, fontWeight: "bold" },
  pagination: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 10 },
  pageBtn: { fontSize: 20, color: COLORS.primary, marginHorizontal: 14 },
  pageNum: { fontSize: 16, fontWeight: "bold" },

  overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalBox: { width: "85%", backgroundColor: "#fff", borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 6 },
  modalSub: { textAlign: "center", color: "#666", marginBottom: 16 },
  modalDivider: { borderBottomWidth: 1, borderColor: "#eee", marginVertical: 6 },
  modalLabel: { fontSize: 14, color: "#888", marginTop : 10},
  modalValue: { fontSize: 15, fontWeight: "bold", color: "#000" },
  radioBtn: { borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 12, marginTop: 8 },
  radioActive: { borderColor: "#007AFF", backgroundColor: "#E8F0FF" },
  radioText: { fontSize: 15 },
  textField: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    minHeight: 120,
    textAlignVertical: "top",
  },
  modalFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  cancelBtn: { flex: 1, backgroundColor: "#F2F4F6", padding: 12, borderRadius: 10, marginRight: 8, alignItems: "center" },
  applyBtn: { flex: 1, backgroundColor: "#007AFF", padding: 12, borderRadius: 10, alignItems: "center" },
  cancelText: { color: "#000", fontWeight: "bold" },
  applyText: { color: "#fff", fontWeight: "bold" },
   radioItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007AFF",
  },
  permissionRow: {
    flexDirection: "row",
    alignItems: "center",     
    marginTop: 10,
    marginBottom: 10,
  },
  modalBoxSmall: {
    width: "70%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 5,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  optionText: { fontSize: 15, color: "#222" },
  dropdownRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  dropdown: {
    flex: 1,
    height: 45,
    backgroundColor: "#fff",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  dropdownField: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
  },
  placeholderText: {
    color: "#aaa",
    fontSize: 14,
  },
  selectedText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
  },
  successBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  successIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    textAlign: "center",
    marginBottom: 6,
  },
  successSub: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  successBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  successBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
