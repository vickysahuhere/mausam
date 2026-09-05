import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function WidgetCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, margin: 8, backgroundColor: '#fff', borderRadius: 8 },
  title: { fontWeight: 'bold', marginBottom: 8 }
});
