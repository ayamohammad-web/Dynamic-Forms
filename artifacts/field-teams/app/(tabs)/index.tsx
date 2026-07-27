import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useTasks } from '@/context/TasksContext';
import { useOffline } from '@/context/OfflineContext';
import { AppHeader } from '@/components/AppHeader';
import { TaskCard } from '@/components/TaskCard';
import { SyncBanner } from '@/components/SyncBanner';
import type { Task, TaskStatus } from '@/types';

type FilterType = 'all' | TaskStatus;

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
  { label: 'الكل', value: 'all' },
  { label: 'مفتوحة', value: 'open' },
  { label: 'قيد التنفيذ', value: 'in_progress' },
  { label: 'انتظار الإرسال', value: 'pending_sync' },
  { label: 'مغلقة', value: 'closed' },
];

export default function DashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  const { tasks, isLoading, refresh } = useTasks();
  const { pendingCount } = useOffline();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = tasks.filter((t) => activeFilter === 'all' || t.status === activeFilter);
  const openCount = tasks.filter((t) => t.status === 'open' || t.status === 'in_progress').length;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleTaskPress = (task: Task) => {
    router.push({ pathname: '/(tabs)/task/[id]', params: { id: task.id } });
  };

  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="الرئيسية"
        showMenu
        showSearch
        pendingSync={pendingCount}
        onSearchPress={() => router.push('/(tabs)/search')}
      />

      <SyncBanner />

      {/* Yellow banner */}
      <View style={[styles.banner, { backgroundColor: colors.accent }]}>
        <Text style={styles.bannerText}>قائمة المهام</Text>
      </View>

      {/* User info card */}
      <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.userRow}>
          <Text style={[styles.userLabel, { color: colors.mutedForeground }]}>الفرقة</Text>
          <Text style={[styles.userValue, { color: colors.foreground }]}>{user?.team ?? '—'}</Text>
        </View>
        <View style={styles.userRow}>
          <Text style={[styles.userLabel, { color: colors.mutedForeground }]}>مرحبا</Text>
          <Text style={[styles.userValue, { color: colors.foreground }]}>{user?.name ?? '—'}</Text>
        </View>
      </View>

      {/* Filter chips */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FILTER_OPTIONS}
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: activeFilter === item.value ? colors.primary : colors.card,
                borderColor: activeFilter === item.value ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setActiveFilter(item.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                { color: activeFilter === item.value ? '#fff' : colors.mutedForeground },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Task count */}
      <View style={styles.countRow}>
        <Text style={[styles.countLabel, { color: colors.mutedForeground }]}>
          {filtered.length} مهمة
        </Text>
        <View style={styles.openCountBadge}>
          <Ionicons name="alert-circle" size={14} color={colors.primary} />
          <Text style={[styles.openCountText, { color: colors.primary }]}>
            عدد البطاقات المفتوحة {openCount}
          </Text>
        </View>
      </View>

      {/* Task list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => handleTaskPress(item)}
            onStartPress={() => handleTaskPress(item)}
          />
        )}
        contentContainerStyle={{ paddingBottom: bottomPad + 20, paddingTop: 4 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        scrollEnabled={filtered.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              لا توجد مهام
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A2E',
    textAlign: 'center',
  },
  userCard: {
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    alignItems: 'center',
  },
  userLabel: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  userValue: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  filterList: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  countLabel: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  openCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  openCountText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
});
