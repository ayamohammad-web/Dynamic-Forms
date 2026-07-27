import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { StatusBadge } from '@/components/StatusBadge';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onStartPress?: () => void;
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

export function TaskCard({ task, onPress, onStartPress }: TaskCardProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Top row: seq + type badge */}
      <View style={styles.topRow}>
        <StatusBadge status={task.status} />
        <View style={styles.seqBadge}>
          <Text style={[styles.seqText, { color: colors.mutedForeground }]}>#{task.seq}</Text>
        </View>
      </View>

      {/* Special tag */}
      {task.isSpecial && (
        <View style={styles.specialTag}>
          <Text style={styles.specialText}>{task.customerName} (خاصة)</Text>
        </View>
      )}
      {!task.isSpecial && (
        <Text style={[styles.customerName, { color: colors.foreground }]}>{task.customerName}</Text>
      )}

      {/* Service & phone */}
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>رقم الهاتف</Text>
        <Text style={[styles.infoValue, { color: colors.foreground }]}>{task.phone}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>رقم الخدمة</Text>
        <Text style={[styles.infoValue, { color: colors.primary }]}>{task.serviceNumber}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>المنطقة</Text>
        <Text style={[styles.infoValue, { color: colors.foreground }]} numberOfLines={1}>
          {task.areaName}
        </Text>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Bottom: dates + action button */}
      <View style={styles.bottomRow}>
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: colors.primary }]}
          onPress={onStartPress ?? onPress}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="lightning-bolt" size={14} color="#fff" />
          <Text style={styles.startBtnText}>بدء المهمة</Text>
        </TouchableOpacity>

        <View style={styles.dates}>
          <View style={styles.dateRow}>
            <Text style={[styles.dateLabel, { color: colors.mutedForeground }]}>
              {formatDate(task.expectedDate)}
            </Text>
            <Ionicons name="calendar-outline" size={13} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.taskType, { color: colors.primary }]}>{task.taskType}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginHorizontal: 14,
    marginVertical: 6,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seqBadge: {
    paddingHorizontal: 6,
  },
  seqText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  specialTag: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  specialText: {
    color: '#92400E',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'right',
  },
  customerName: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  infoValue: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  dates: {
    alignItems: 'flex-end',
    gap: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  taskType: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
});
