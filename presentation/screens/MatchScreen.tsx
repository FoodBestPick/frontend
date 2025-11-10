import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export default function MatchScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.text}>매칭 화면 (임시)</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: { fontSize: 16, fontWeight: '600' },
});
