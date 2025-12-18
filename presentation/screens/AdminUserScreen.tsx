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
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../core/constants/Colors";
import { Header } from "../components/Header";
import { ThemeContext } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { AdminUserViewModel } from "../../presentation/viewmodels/AdminUserViewModels";
// ⭐ 개별 모달 파일들로 임포트 수정
import { SuspendModal } from "../components/SuspendModal";
import { WarningModal } from "../components/WarningModal";
import { SuccessModal } from "../components/SuccessModal";

export const AdminUserScreen = () => {
  const { theme } = useContext(ThemeContext);
  const { currentUserId } = useAuth();

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
    unsuspendUser,
    updateUserRole,
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

  const toggleUser = (id: number) => {
    setExpandedUsers((prev) =>
      prev.includes(id)
        ? prev.filter((userId) => userId !== id)
        : [...prev, id]
    );
  };

  const getAvatarUri = (u: any): string | null => {
    const raw =
      u?.avatarUrl ??
      u?.avatar ??
      u?.profileImageUrl ??
      u?.profileImage ??
      u?.imageUrl ??
      u?.image ??
      null;

    if (!raw) return null;

    if (typeof raw === "object" && typeof raw.uri === "string") {
      const v = raw.uri.trim();
      return v.length ? v : null;
    }

    if (typeof raw === "string") {
      const v = raw.trim();
      return v.length ? v : null;
    }

    return null;
  };

  const UserAvatar = ({
    uri,
    size = 44,
    theme,
  }: {
    uri?: string | null;
    size?: number;
    theme: any;
  }) => {
    const [failed, setFailed] = React.useState(false);
    const safeUri = uri && uri.length > 0 ? uri : null;

    // 이미지 없거나 / 로딩 실패하면 기본 프로필
    if (!safeUri || failed) {
      return (
        <View
          style={[
            styles.avatarFallback,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: theme.border,
            },
          ]}
        >
          <Ionicons
            name="person"
            size={Math.round(size * 0.55)}
            color={theme.textSecondary}
          />
        </View>
      );
    }

    return (
      <Image
        source={{ uri: safeUri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="cover"
        onError={() => setFailed(true)}
      />
    );
  };

  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.icon} />
        <Text style={{ marginTop: 10, color: theme.textSecondary, fontSize: 15 }}>유저 데이터를 불러오는 중...</Text>
      </View>
    );

  const users = response?.data ?? [];
  const totalPages = response?.totalPages ?? 1;

  const statusOptions = [{ label: "전체", value: "전체" }, { label: "접속중", value: "접속중" }, { label: "미접속", value: "미접속" }, { label: "정지", value: "정지" }];
  const sortOptions = [{ label: "전체", value: "전체" }, { label: "최신 가입순", value: "최신 가입순" }, { label: "오래된 가입순", value: "오래된 가입순" }, { label: "경고 횟수 높은순", value: "경고 횟수 높은순" }, { label: "경고 횟수 낮은순", value: "경고 횟수 낮은순" }];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Header title="회원 관리" />
      <View style={[styles.container, { backgroundColor: theme.background }]}>

        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
          <Ionicons name="search-outline" size={18} color={theme.textSecondary} />
          <TextInput
            style={[styles.input, { color: theme.textPrimary }]}
            placeholder="닉네임 또는 이메일로 검색"
            placeholderTextColor={theme.textSecondary}
            value={keyword}
            onChangeText={setKeyword}
          />
        </View>

        <View style={styles.dropdownRow}>
          <Dropdown
            style={[styles.dropdown, { backgroundColor: theme.card, borderColor: theme.border }]}
            containerStyle={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1, borderRadius: 8 }}
            placeholderStyle={{ color: theme.textSecondary, fontSize: 14 }}
            selectedTextStyle={{ color: theme.textPrimary, fontSize: 14 }}
            itemTextStyle={{ color: theme.textPrimary, fontSize: 14 }}
            activeColor={theme.background}
            data={statusOptions}
            labelField="label" valueField="value" value={status}
            onChange={(item) => setStatus(item.value)}
          />
          <Dropdown
            style={[styles.dropdown, { backgroundColor: theme.card, borderColor: theme.border }]}
            containerStyle={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1, borderRadius: 8 }}
            placeholderStyle={{ color: theme.textSecondary, fontSize: 14 }}
            selectedTextStyle={{ color: theme.textPrimary, fontSize: 14 }}
            itemTextStyle={{ color: theme.textPrimary, fontSize: 14 }}
            activeColor={theme.background}
            data={sortOptions}
            labelField="label" valueField="value" value={sort}
            onChange={(item) => setSort(item.value)}
          />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
          {users.map((user) => (
            <View key={user.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
              <TouchableOpacity style={styles.cardHeader} onPress={() => toggleUser(user.id)} activeOpacity={0.7}>
                <View style={styles.userInfo}>
                  <UserAvatar uri={getAvatarUri(user)} size={44} theme={theme} />
                  <View>
                    <Text style={[styles.userName, { color: theme.textPrimary }]}>{user.name}</Text>
                    <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user.email}</Text>
                  </View>
                </View>
                <Ionicons name={expandedUsers.includes(user.id) ? "chevron-up" : "chevron-down"} size={20} color={theme.textSecondary} />
              </TouchableOpacity>

              {expandedUsers.includes(user.id) && (
                <View style={styles.detailSection}>
                  <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: theme.textSecondary }]}>가입일</Text><Text style={[styles.detailValue, { color: theme.textPrimary }]}>{user.joinDate?.replace('T', ' ')}</Text></View>
                  <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: theme.textSecondary }]}>마지막 활동일</Text><Text style={[styles.detailValue, { color: theme.textPrimary }]}>{user.lastActive?.replace('T', ' ')}</Text></View>
                  <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: theme.textSecondary }]}>상태</Text><Text style={[styles.detailValue, { color: user.status === "접속중" ? "#4CAF50" : user.status === "정지" ? "#E53935" : theme.textSecondary }]}>{user.status}</Text></View>
                  <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: theme.textSecondary }]}>경고 횟수</Text><Text style={[styles.detailValue, { color: theme.textPrimary }]}>{user.warnings}</Text></View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.icon + "22" }]} onPress={() => setActiveModal({ type: "permission", user })} disabled={user.id === currentUserId}><Text style={[styles.actionText, { color: theme.textPrimary }]}>권한 변경</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#ffcccc" }]} onPress={() => setActiveModal({ type: "suspend", user })} disabled={user.id === currentUserId}><Text style={[styles.actionText, { color: "#b00020" }]}>{user.status === "정지" ? "정지 해제" : "계정 정지"}</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#ffe0b2" }]} onPress={() => setActiveModal({ type: "warning", user })} disabled={user.id === currentUserId}><Text style={[styles.actionText, { color: "#e65100" }]}>경고 추가</Text></TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        <View style={styles.paginationContainer}>
          <TouchableOpacity disabled={page <= 1} onPress={() => setPage(page - 1)}><Text style={[styles.arrow, { color: theme.icon }, page <= 1 && { color: "#CCC" }]}>{"<"}</Text></TouchableOpacity>
          <View style={styles.pageNumberContainer}>
            {(() => {
              const maxVisible = 5;
              const currentBlock = Math.floor((page - 1) / maxVisible);
              const startPage = currentBlock * maxVisible + 1;
              const endPage = Math.min(startPage + maxVisible - 1, totalPages);
              const pages = [];
              for (let i = startPage; i <= endPage; i++) pages.push(i);
              return (
                <>
                  {pages.map((p) => {
                    const isActive = p === page;
                    return (
                      <TouchableOpacity key={`page-${p}`} onPress={() => setPage(p)}>
                        <Text style={[styles.pageText, { color: isActive ? theme.icon : theme.textPrimary, fontWeight: isActive ? "700" : "500" }]}>{p}</Text>
                      </TouchableOpacity>
                    );
                  })}
                  {endPage < totalPages && (<><Text style={[styles.ellipsis, { color: theme.textSecondary }]}>...</Text><TouchableOpacity onPress={() => setPage(totalPages)}><Text style={[styles.pageText, { color: theme.textPrimary }]}>{totalPages}</Text></TouchableOpacity></>)}
                </>
              );
            })()}
          </View>
          <TouchableOpacity disabled={page >= totalPages} onPress={() => setPage(page + 1)}><Text style={[styles.arrow, { color: theme.icon }, page >= totalPages && { color: "#CCC" }]}>{">"}</Text></TouchableOpacity>
        </View>

        {/* --- [모달들] --- */}
        <PermissionModal
          visible={activeModal.type === "permission"}
          onClose={() => setActiveModal({ type: null })}
          user={activeModal.user}
          theme={theme}
          onConfirm={async (id: number, role: string) => {
            const ok = await updateUserRole(id, role);
            if (ok) {
              setActiveModal({ type: null });
              setSuccessModal({ visible: true, type: "permission", user: activeModal.user, extra: role === "ADMIN" ? "관리자" : "사용자" });
              refresh();
            }
          }}
        />

        <SuspendModal
          visible={activeModal.type === "suspend"}
          onClose={() => setActiveModal({ type: null })}
          user={activeModal.user}
          setSuccessModal={setSuccessModal}
          theme={theme}
          onConfirm={async (id: number, days: number, reason: string) => {
            if (days === 0) return await unsuspendUser(id);
            return await suspendUser(id, days, reason);
          }}
        />

        <WarningModal
          visible={activeModal.type === "warning"}
          onClose={() => setActiveModal({ type: null })}
          user={activeModal.user}
          setSuccessModal={setSuccessModal}
          theme={theme}
          onConfirm={giveWarning}
        />

        <SuccessModal
          onClose={() => setSuccessModal({ ...successModal, visible: false })}
          {...successModal}
          theme={theme}
        />
      </View>
    </View>
  );
};

// 권한 변경 모달 (원본 디자인 복구)
const PermissionModal = ({ visible, onClose, user, theme, onConfirm }: any) => {
  const [role, setRole] = useState(user?.role === "ADMIN" ? "ADMIN" : "USER");
  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
          <Text style={styles.modalTitle}>권한 변경</Text>
          <Text style={styles.modalSub}>{user?.name}님의 권한을 변경합니다.</Text>

          <View style={styles.permissionRow}>
            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>현재 권한</Text>
            <Text style={[styles.modalValue, { color: theme.textPrimary }]}>{user?.role === "ADMIN" ? "관리자" : "사용자"}</Text>
          </View>

          <View style={[styles.modalDivider, { borderColor: theme.border }]} />

          <View style={{ gap: 10, marginTop: 10 }}>
            {[{ l: "사용자", v: "USER" }, { l: "관리자", v: "ADMIN" }].map((item) => (
              <TouchableOpacity key={item.v} style={[styles.radioItem, { borderColor: role === item.v ? COLORS.primary : theme.border }]} onPress={() => setRole(item.v)}>
                <Ionicons name={role === item.v ? "radio-button-on" : "radio-button-off"} size={20} color={role === item.v ? COLORS.primary : theme.textSecondary} />
                <Text style={{ color: theme.textPrimary, marginLeft: 10 }}>{item.l}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}><Text style={styles.cancelText}>취소</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.applyBtn, { backgroundColor: COLORS.primary }]} onPress={() => onConfirm(user.id, role)}><Text style={styles.applyText}>변경 적용</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7FB', paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 12, height: 44, marginBottom: 12, marginTop: 15, width: '100%' },
  input: { flex: 1, marginLeft: 8, fontSize: 14, paddingVertical: 0 },
  dropdownRow: { flexDirection: "row", gap: 10, marginBottom: 15 },
  dropdown: { flex: 1, height: 40, backgroundColor: "#fff", borderColor: "#E0E0E0", borderWidth: 1, borderRadius: 8, paddingHorizontal: 10 },
  card: { backgroundColor: "#fff", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 12, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 3 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  userName: { fontSize: 15, fontWeight: "bold" },
  userEmail: { fontSize: 13, color: "#777", marginTop: 2 },
  detailSection: { marginTop: 12, gap: 8, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: "500", textAlign: "right" },
  actionRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, gap: 8 },
  actionBtn: { paddingVertical: 8, borderRadius: 8, flex: 1, alignItems: "center" },
  actionText: { fontSize: 13, fontWeight: "bold" },
  paginationContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 20, gap: 15 },
  pageNumberContainer: { flexDirection: "row", alignItems: "center", gap: 16 },
  pageText: { fontSize: 16 },
  ellipsis: { fontSize: 15 },
  arrow: { fontSize: 20, paddingHorizontal: 8, fontWeight: 'bold' },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalBox: { width: "85%", borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  modalSub: { textAlign: "center", marginBottom: 20, color: '#666' },
  modalDivider: { borderBottomWidth: 1, marginVertical: 15 },
  modalLabel: { fontSize: 14, fontWeight: "600" },
  modalValue: { fontSize: 15, fontWeight: "bold", marginLeft: 10 },
  permissionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  radioItem: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, padding: 14 },
  modalFooter: { flexDirection: "row", gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, backgroundColor: "#F2F4F6", padding: 14, borderRadius: 12, alignItems: "center" },
  applyBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center" },
  cancelText: { color: "#4E5968", fontWeight: "bold" },
  applyText: { color: "#fff", fontWeight: "bold" },
  avatarFallback: {
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
},
});
