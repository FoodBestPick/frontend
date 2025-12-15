import React, { useCallback } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useFocusEffect } from "@react-navigation/native"; 
import { useAuth } from "../../context/AuthContext";

const NotificationScreen = () => {
  const { alarms, setAlarmScreenActive, markAllAlarmsRead } = useAuth();

  useFocusEffect(
    useCallback(() => {
      setAlarmScreenActive(true);
      markAllAlarmsRead();
      return () => setAlarmScreenActive(false);
    }, [setAlarmScreenActive, markAllAlarmsRead])
  );

  return (
    <View style={styles.container}>
      {alarms.length === 0 ? (
        <Text style={styles.text}>알림 내역이 없습니다.</Text>
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={(item, idx) => String(item.id ?? idx)}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.msg}>{item.message}</Text>
              {!!item.createdAt && <Text style={styles.time}>{item.createdAt}</Text>}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  text: { textAlign: "center", marginTop: 30, color: "#666" },
  item: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  msg: { fontSize: 14, color: "#111" },
  time: { marginTop: 6, fontSize: 11, color: "#999" },
});

export default NotificationScreen;
