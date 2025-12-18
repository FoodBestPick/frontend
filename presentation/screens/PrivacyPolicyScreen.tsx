import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>개인정보 처리방침</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>개인정보 처리방침</Text>
        <Text style={styles.date}>시행일자: 2024년 1월 1일</Text>

        <View style={styles.section}>
          <Text style={styles.subTitle}>1. 개인정보의 처리 목적</Text>
          <Text style={styles.text}>
            'FoodPick'(이하 '회사')은(는) 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
          </Text>
          <Text style={styles.listItem}>
            1. 회원 가입 및 관리: 회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지, 고충처리 등을 목적으로 개인정보를 처리합니다.
          </Text>
          <Text style={styles.listItem}>
            2. 재화 또는 서비스 제공: 서비스 제공, 콘텐츠 제공, 맞춤 서비스 제공 등을 목적으로 개인정보를 처리합니다.
          </Text>
          <Text style={styles.listItem}>
            3. 마케팅 및 광고에의 활용: 신규 서비스(제품) 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여기회 제공 등을 목적으로 개인정보를 처리합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subTitle}>2. 개인정보의 처리 및 보유 기간</Text>
          <Text style={styles.text}>
            ① 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
          </Text>
          <Text style={styles.text}>
            ② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
          </Text>
          <Text style={styles.listItem}>- 회원 가입 및 관리: 회원 탈퇴 시까지</Text>
          <Text style={styles.listItem}>- 다만, 다음의 사유에 해당하는 경우에는 해당 사유 종료 시까지</Text>
          <Text style={styles.subListItem}>1) 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지</Text>
          <Text style={styles.subListItem}>2) 서비스 이용에 따른 채권·채무관계 잔존 시에는 해당 채권·채무관계 정산 시까지</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subTitle}>3. 정보주체와 법정대리인의 권리·의무 및 그 행사방법</Text>
          <Text style={styles.text}>
            ① 정보주체는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.
          </Text>
          <Text style={styles.text}>
            ② 권리 행사는 회사에 대해 「개인정보 보호법」 시행령 제41조 제1항에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subTitle}>4. 처리하는 개인정보의 항목</Text>
          <Text style={styles.text}>
            회사는 다음의 개인정보 항목을 처리하고 있습니다.
          </Text>
          <Text style={styles.listItem}>- 필수항목: 이메일, 비밀번호, 닉네임, 프로필 사진</Text>
          <Text style={styles.listItem}>- 선택항목: 위치 정보 (맛집 추천 서비스 제공 목적)</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subTitle}>5. 개인정보의 파기</Text>
          <Text style={styles.text}>
            ① 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
          </Text>
          <Text style={styles.text}>
            ② 파기절차 및 방법은 다음과 같습니다.
          </Text>
          <Text style={styles.listItem}>
            - 파기절차: 회사는 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.
          </Text>
          <Text style={styles.listItem}>
            - 파기방법: 전자적 파일 형태로 기록·저장된 개인정보는 기록을 재생할 수 없도록 파기하며, 종이 문서에 기록·저장된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subTitle}>6. 개인정보 보호책임자</Text>
          <Text style={styles.text}>
            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </Text>
          <View style={styles.contactBox}>
            <Text style={styles.contactText}>성명: 관리자</Text>
            <Text style={styles.contactText}>직책: 개인정보 보호팀장</Text>
            <Text style={styles.contactText}>연락처: admin@foodpick.com</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>본 방침은 2024년 1월 1일부터 시행됩니다.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    marginBottom: 8,
    textAlign: 'justify',
  },
  listItem: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    marginLeft: 8,
    marginBottom: 4,
  },
  subListItem: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginLeft: 20,
    marginBottom: 4,
  },
  contactBox: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  contactText: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4,
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#888',
  },
});

export default PrivacyPolicyScreen;
