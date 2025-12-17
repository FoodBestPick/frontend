import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

const AppLogo = require('../../assets/logo.png');

const { width } = Dimensions.get('window');
const MAIN_COLOR = '#FFA847';

const MatchingScreen = () => {
  const navigation = useNavigation<any>();
  const { activeRoomId } = useAuth();

  // 매칭 조건 설정으로 이동
  const handleStartMatch = () => {
    if (activeRoomId) {
        Alert.alert("알림", "이미 참여 중인 채팅방이 있습니다.\n기존 채팅방을 나가야 새로운 매칭이 가능합니다.");
        return;
    }
    navigation.navigate("MatchingSetupScreen" as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>매칭하기</Text>
      </View>

      <View style={styles.mainContent}>
        <Image source={AppLogo} style={styles.appLogo} resizeMode="contain" />

        <Text style={styles.sloganTitle}>
          함께 맛있는 음식을 나눌 팀원 모집!
        </Text>
        <Text style={styles.sloganSubtitle}>
          원하는 메뉴, 인원, 시간을 설정하고 매칭을 시작하세요.
        </Text>

        <TouchableOpacity
          style={[styles.ctaButton, activeRoomId ? styles.ctaButtonDisabled : null]}
          onPress={handleStartMatch}
          activeOpacity={0.9}
        >
          <Icon name="search-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.ctaButtonText}>
            {activeRoomId ? "매칭 불가 (참여 중)" : "매칭 시작"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MatchingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { height: 50, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },

  mainContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, paddingBottom: 100 },
  appLogo: { width: width * 0.6, height: width * 0.6 * (220 / 300), marginBottom: 30 },
  sloganTitle: { fontSize: 19, fontWeight: '800', color: '#333', marginBottom: 8, textAlign: 'center' },
  sloganSubtitle: { fontSize: 14, color: '#666', marginBottom: 40, textAlign: 'center' },

  ctaButton: { flexDirection: 'row', backgroundColor: MAIN_COLOR, paddingHorizontal: 35, paddingVertical: 14, borderRadius: 12, alignItems: 'center', shadowColor: MAIN_COLOR, },
  ctaButtonDisabled: { backgroundColor: '#CCC', shadowColor: 'transparent' },
  ctaButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});