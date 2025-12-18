import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Header } from '../components/Header';
import { ThemeContext } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types/RootStackParamList';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export const AdminManageSelectScreen = () => {
  const navigation = useNavigation<Navigation>();
  const { theme } = useContext(ThemeContext);

  const options = [
    {
      id: 'food',
      icon: 'restaurant',
      title: '대표메뉴 관리',
      description: '맛집의 대표 메뉴를 추가, 수정, 삭제합니다',
      color: '#FF6B6B',
      screen: 'AdminFoodManage',
    },
    {
      id: 'tag',
      icon: 'pricetag',
      title: '태그 관리',
      description: '목적, 분위기, 편의시설 태그를 관리합니다',
      color: '#4ECDC4',
      screen: 'AdminTagManage',
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header title="관리 메뉴 선택" showBackButton onBackPress={() => navigation.goBack()} />

      <View style={styles.content}>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          관리할 항목을 선택해주세요
        </Text>

        {options.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={() => navigation.navigate(option.screen as any)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: option.color + '20' },
              ]}
            >
              <Ionicons name={option.icon} size={32} color={option.color} />
            </View>

            <View style={styles.textWrapper}>
              <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>
                {option.title}
              </Text>
              <Text
                style={[
                  styles.optionDescription,
                  { color: theme.textSecondary },
                ]}
              >
                {option.description}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={24}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 24,
    textAlign: 'center',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textWrapper: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
});
