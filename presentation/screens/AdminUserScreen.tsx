import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  ActivityIndicator,
  TextInput as RNTextInput,
  Alert,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../core/constants/Colors";
import { Header } from "../components/Header";
import { ThemeContext } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext"; // ✨ useAuth 임포트
import { AdminUserViewModel } from "../../presentation/viewmodels/AdminUserViewModels";

export const AdminUserScreen = () => {
  const { theme } = useContext(ThemeContext);
  const { currentUserId } = useAuth(); // ✨ currentUserId 가져오기

  const {
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
    refresh,
    giveWarning,
    suspendUser,
    updateUserRole, // ⭐ 추가
  } = AdminUserViewModel();

  const [expandedUsers, setExpandedUsers] = useState<number[]>([]);
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

  useEffect(() => {
    refresh(); // 인자 없이 호출
  }, [page, status, sort, keyword]);

  const toggleUser = (id: number) => {
    setExpandedUsers((prev) =>
      prev.includes(id)
        ? prev.filter((userId) => userId !== id)
        : [...prev, id]
    );
  };

  if (loading)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.icon} />
        <Text
          style={{
            marginTop: 10,
            color: theme.textSecondary,
            fontSize: 15,
          }}
        >
          유저 데이터를 불러오는 중...
        </Text>
      </View>
    );

  if (error)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}
      >
        <Text style={{ color: "red", fontSize: 16 }}>{error}</Text>
      </View>
    );

  const users = response?.data ?? [];
  const totalPages = response?.totalPages ?? 1;

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

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Header title="회원 관리" />
      <View style={[styles.container, { backgroundColor: theme.background }]}>

        {/* 검색창 */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 },
          ]}
        >
          <Ionicons name="search-outline" size={18} color={theme.textSecondary} />
          <TextInput
            style={[styles.input, { color: theme.textPrimary }]}
            placeholder="닉네임 또는 이메일로 검색"
            placeholderTextColor={theme.textSecondary}
            value={keyword}
            onChangeText={setKeyword}
          />
        </View>

        {/* 필터 */}
        <View style={styles.dropdownRow}>
          <Dropdown
            style={[
              styles.dropdown,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            containerStyle={{
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderWidth: 1,
              borderRadius: 8,
            }}
            placeholderStyle={{ color: theme.textSecondary }}
            selectedTextStyle={{ color: theme.textPrimary }}
            itemTextStyle={{ color: theme.textPrimary }}
            activeColor={theme.background}
            data={statusOptions}
            labelField="label"
            valueField="value"
            value={status}
            onChange={(item) => setStatus(item.value)}
          />

          <Dropdown
            style={[
              styles.dropdown,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            containerStyle={{
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderWidth: 1,
              borderRadius: 8,
            }}
            placeholderStyle={{ color: theme.textSecondary }}
            selectedTextStyle={{ color: theme.textPrimary }}
            itemTextStyle={{ color: theme.textPrimary }}
            activeColor={theme.background}
            data={sortOptions}
            labelField="label"
            valueField="value"
            value={sort}
            onChange={(item) => setSort(item.value)}
          />
        </View>

        {/* 사용자 리스트 */}
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {users.map((user) => (
            <View
              key={user.id}
              style={[
                styles.card,
                { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 },
              ]}
            >
              <TouchableOpacity style={styles.cardHeader} onPress={() => toggleUser(user.id)}>
                <View style={styles.userInfo}>
                  <Image source={user.avatar} style={styles.avatar} />
                  <View>
                    <Text style={[styles.userName, { color: theme.textPrimary }]}>
                      {user.name}
                    </Text>
                    <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                      {user.email}
                    </Text>
                  </View>
                </View>

                <Ionicons
                  name={expandedUsers.includes(user.id) ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>

              {expandedUsers.includes(user.id) && (
                <View style={styles.detailSection}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                      가입일
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                      {user.joinDate}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                      마지막 활동일
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                      {user.lastActive}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>상태</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        {
                          color:
                            user.status === "접속중"
                              ? "#4CAF50"
                              : user.status === "정지"
                              ? "#E53935"
                              : theme.textSecondary,
                        },
                      ]}
                    >
                      {user.status}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                      경고 횟수
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                      {user.warnings}
                    </Text>
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        { backgroundColor: theme.icon + "22" },
                        user.id === currentUserId && { opacity: 0.5 } // ✨ 본인 계정일 경우 투명도 조절
                      ]}
                      onPress={() => setActiveModal({ type: "permission", user })}
                      disabled={user.id === currentUserId} // ✨ 본인 계정일 경우 비활성화
                    >
                      <Text style={[styles.actionText, { color: theme.textPrimary }]}>권한 변경</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        { backgroundColor: "#ffcccc" },
                        user.id === currentUserId && { opacity: 0.5 } // ✨ 본인 계정일 경우 투명도 조절
                      ]}
                      onPress={() => setActiveModal({ type: "suspend", user })}
                      disabled={user.id === currentUserId} // ✨ 본인 계정일 경우 비활성화
                    >
                      <Text style={[styles.actionText, { color: "#b00020" }]}>
                        {user.status === "정지" ? "정지 해제" : "계정 정지"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        { backgroundColor: "#ffe0b2" },
                        user.id === currentUserId && { opacity: 0.5 } // ✨ 본인 계정일 경우 투명도 조절
                      ]}
                      onPress={() => setActiveModal({ type: "warning", user })}
                      disabled={user.id === currentUserId} // ✨ 본인 계정일 경우 비활성화
                    >
                      <Text style={[styles.actionText, { color: "#e65100" }]}>경고 추가</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        <View style={styles.paginationContainer}>
          {/* 이전 페이지 */}
          <TouchableOpacity
            disabled={page <= 1}
            onPress={() => setPage(page - 1)}
          >
            <Text
              style={[
                styles.arrow,
                { color: theme.icon },
                page <= 1 && { color: "#666" },
              ]}
            >
              {"<"}
            </Text>
          </TouchableOpacity>

          {/* 페이지 번호 */}
          <View style={styles.pageNumberContainer}>
            {(() => {
              const maxVisible = 5;
              const currentBlock = Math.floor((page - 1) / maxVisible);
              const startPage = currentBlock * maxVisible + 1;
              const endPage = Math.min(startPage + maxVisible - 1, totalPages);

              const pages = [];
              for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
              }

              return (
                <>
                  {pages.map((p) => {
                    const isActive = p === page;
                    return (
                      <TouchableOpacity
                        key={`page-${p}`}
                        onPress={() => setPage(p)}
                      >
                        <Text
                          style={[
                            styles.pageText,
                            {
                              color: isActive ? theme.icon : theme.textPrimary,
                              fontWeight: isActive ? "700" : "500",
                            },
                          ]}
                        >
                          {p}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {/* ... 이후 마지막 페이지 */}
                  {endPage < totalPages && (
                    <>
                      <Text style={[styles.ellipsis, { color: theme.textSecondary }]}>
                        ...
                      </Text>

                      <TouchableOpacity onPress={() => setPage(totalPages)}>
                        <Text style={[styles.pageText, { color: theme.textPrimary }]}>
                          {totalPages}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              );
            })()}
          </View>

          {/* 다음 페이지 */}
          <TouchableOpacity
            disabled={page >= totalPages}
            onPress={() => setPage(page + 1)}
          >
            <Text
              style={[
                styles.arrow,
                { color: theme.icon },
                page >= totalPages && { color: "#666" },
              ]}
            >
              {">"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 모달들 */}
        <PermissionModal
          visible={activeModal.type === "permission"}
          onClose={() => setActiveModal({ type: null })}
          user={activeModal.user}
          setSuccessModal={setSuccessModal}
          theme={theme}
          onConfirm={updateUserRole} // ⭐ 추가
        />
        <SuspendModal
          visible={activeModal.type === "suspend"}
          onClose={() => setActiveModal({ type: null })}
          user={activeModal.user}
          setSuccessModal={setSuccessModal}
          theme={theme}
        />
        <WarningModal
          visible={activeModal.type === "warning"}
          onClose={() => setActiveModal({ type: null })}
          user={activeModal.user}
          setSuccessModal={setSuccessModal}
          theme={theme}
        />
        <SuccessModal
          visible={successModal.visible}
          onClose={() => setSuccessModal({ visible: false, type: "", user: null, extra: "" })}
          type={successModal.type}
          user={successModal.user}
          extra={successModal.extra}
          theme={theme}
        />
      </View>
    </View>
  );
};

const PermissionModal = ({ visible, onClose, user, setSuccessModal, theme, onConfirm }: any) => {
  const [role, setRole] = useState(user?.role === "ADMIN" ? "관리자" : "사용자");

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>권한 변경</Text>
          <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
            {user?.name}님의 권한을 변경합니다.
          </Text>

          <View style={styles.permissionRow}>
            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>현재 권한</Text>
            <Text style={[styles.modalValue, { color: theme.textPrimary }]}>{user?.role === "ADMIN" ? "관리자" : "사용자"}</Text>
          </View>

          <View style={[styles.modalDivider, { borderColor: theme.border }]} />

          <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>변경할 권한</Text>
          <View style={{ marginTop: 8, gap: 10 }}>
            {["관리자", "사용자"].map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.radioItem, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => setRole(r)}
              >
                <View style={[styles.radioOuter, { borderColor: theme.icon }]}>
                  {role === r && <View style={[styles.radioInner, { backgroundColor: theme.icon }]} />}
                </View>
                <Text style={[styles.radioText, { color: theme.textPrimary }]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: theme.background }]} onPress={onClose}>
              <Text style={[styles.cancelText, { color: theme.textPrimary }]}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: theme.icon }]}
              onPress={async () => {
                onClose();
                const backendRole = role === "관리자" ? "ADMIN" : "USER"; // 백엔드 Enum 값으로 매핑
                const success = await onConfirm(user.id, backendRole);
                if (success) {
                    setSuccessModal({ visible: true, type: "permission", user, extra: role });
                } else {
                    Alert.alert("권한 변경 실패", "서버 오류 또는 권한이 없습니다.");
                }
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

const SuspendModal = ({ visible, onClose, user, setSuccessModal, theme }: any) => {
  const [selectedPeriod, setSelectedPeriod] = useState("1일");
  const [reason, setReason] = useState("");
  const periods = ["1일", "3일", "7일", "30일", "영구 정지"];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>계정 상태 변경</Text>
          <Text style={[styles.modalSub, { color: theme.textSecondary }]}>사용자: {user?.name}</Text>

          <View style={[styles.modalDivider, { borderColor: theme.border }]} />

          <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>정지 기간</Text>
          <View style={{ marginTop: 8, gap: 10 }}>
            {periods.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.radioItem, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => setSelectedPeriod(p)}
              >
                <View style={[styles.radioOuter, { borderColor: theme.icon }]}>
                  {selectedPeriod === p && (
                    <View style={[styles.radioInner, { backgroundColor: theme.icon }]} />
                  )}
                </View>
                <Text style={[styles.radioText, { color: theme.textPrimary }]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.modalLabel, { color: theme.textSecondary, marginTop: 14 }]}>
            정지 사유
          </Text>
          <RNTextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.background,
                color: theme.textPrimary,
                borderColor: theme.border,
              },
            ]}
            placeholder="정지 사유를 입력해주세요."
            placeholderTextColor={theme.textSecondary}
            multiline
            value={reason}
            onChangeText={setReason}
          />

          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: theme.background }]} onPress={onClose}>
              <Text style={[styles.cancelText, { color: theme.textPrimary }]}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: "#E53935" }]}
              onPress={() => {
                onClose();
                setSuccessModal({ visible: true, type: "suspend", user, extra: selectedPeriod });
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

const WarningModal = ({ visible, onClose, user, setSuccessModal, theme }: any) => {
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
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>경고 추가</Text>
          <Text style={[styles.modalSub, { color: theme.textSecondary }]}>사용자: {user?.email}</Text>

          <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>경고 사유</Text>
          <RNTextInput
            style={[
              styles.textField,
              { backgroundColor: theme.background, color: theme.textPrimary, borderColor: theme.border },
            ]}
            placeholder="예: 부적절한 리뷰 작성"
            placeholderTextColor={theme.textSecondary}
            value={reason}
            onChangeText={setReason}
          />

          <RNTextInput
            style={[
              styles.textArea,
              { backgroundColor: theme.background, color: theme.textPrimary, borderColor: theme.border },
            ]}
            placeholder="경고 사유를 구체적으로 입력해주세요."
            placeholderTextColor={theme.textSecondary}
            multiline
            value={detail}
            onChangeText={setDetail}
          />

          <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>경고 수준</Text>
          <Dropdown
            style={[
              styles.dropdownField,
              { backgroundColor: theme.background, borderColor: theme.border },
            ]}
            data={levelOptions}
            labelField="label"
            valueField="value"
            value={level}
            placeholder="선택하세요"
            placeholderStyle={{ color: theme.textSecondary }}
            selectedTextStyle={{ color: theme.textPrimary }}
            onChange={(item) => setLevel(item.value)}
          />

          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: theme.background }]} onPress={onClose}>
              <Text style={[styles.cancelText, { color: theme.textPrimary }]}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: "#FF5252" }]}
              onPress={() => {
                onClose();
                setSuccessModal({ visible: true, type: "warning", user, extra: level });
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

const SuccessModal = ({ visible, onClose, type, user, extra, theme }: any) => {
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
          title: "계정 정지 조치 완료!",
          subtitle: `${user?.name}님의 계정이 ${extra}간 정지되었습니다.`,
          buttonColor: "#E53935",
        };
      case "warning":
        return {
          icon: "alert-circle-outline",
          color: "#FF9800",
          title: "경고 추가 완료!",
          subtitle: `경고 ${extra}가 성공적으로 추가되었습니다.`,
          buttonColor: "#FF9800",
        };
      default:
        return { icon: "checkmark-circle-outline", color: theme.icon, title: "", subtitle: "", buttonColor: theme.icon };
    }
  };

  const { icon, color, title, subtitle, buttonColor } = getContent();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.successBox, { backgroundColor: theme.card }]}>
          <View style={[styles.successIcon, { backgroundColor: `${color}1A` }]}>
            <Ionicons name={icon} size={42} color={color} />
          </View>
          <Text style={[styles.successTitle, { color: theme.textPrimary }]}>{title}</Text>
          <Text style={[styles.successSub, { color: theme.textSecondary }]}>{subtitle}</Text>

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
    marginTop: 10,
    
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
  },
  ellipsis: {
    fontSize: 15,
  },
  arrow: {
    fontSize: 18,
    paddingHorizontal: 4,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: { width: "85%", backgroundColor: "#fff", borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 6 },
  modalSub: { textAlign: "center", color: "#666", marginBottom: 16 },
  modalDivider: { borderBottomWidth: 1, borderColor: "#eee", marginVertical: 6 },
  modalLabel: { fontSize: 14, color: "#888" },
  modalValue: { fontSize: 15, fontWeight: "bold", color: "#000", marginLeft: 15 },
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
