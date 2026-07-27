import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { TaskStatus } from '@/types';

const STATUS_CONFIG: Record<TaskStatus, { label: string; bg: string; color: string }> = {
  open: { label: 'مفتوحة', bg: '#DCFCE7', color: '#16A34A' },
  in_progress: { label: 'قيد التنفيذ', bg: '#FEF3C7', color: '#D97706' },
  closed: { label: 'مغلقة', bg: '#F3F4F6', color: '#6B7280' },
  pending_sync: { label: 'انتظار الإرسال', bg: '#FEE2E2', color: '#DC2626' },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.text, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
});
