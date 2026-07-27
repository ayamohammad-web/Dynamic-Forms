import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useTasks } from '@/context/TasksContext';
import { AppHeader } from '@/components/AppHeader';
import { TaskCard } from '@/components/TaskCard';
import type { Task } from '@/types';

type SearchType = 'serviceNumber' | 'meterNumber' | 'customerName';

const SEARCH_OPTIONS: { label: string; value: SearchType }[] = [
  { label: 'الاسم', value: 'customerName' },
  { label: 'رقم الخدمة', value: 'serviceNumber' },
  { label: 'رقم العداد', value: 'meterNumber' },
];

export default function SearchScreen() {
  const colors = useColors();
  const router = useRouter();
  const { tasks } = useTasks();

  const [searchType, setSearchType] = useState<SearchType>('serviceNumber');
  const [query, setQuery] = useState('');

  const results = useMemo<Task[]>(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      const field = searchType === 'serviceNumber'
        ? t.serviceNumber
        : searchType === 'meterNumber'
        ? (t.meterNumber ?? '')
        : t.customerName;
      return field.toLowerCase().includes(q);
    });
  }, [tasks, query, searchType]);

  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="بحث عن خدمة" showBack />

      {/* Banner */}
      <View style={[styles.banner, { backgroundColor: colors.accent }]}>
        <Text style={styles.bannerText}>بحث عن خدمة</Text>
      </View>

      {/* Search type */}
      <View style={[styles.typeRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {SEARCH_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={styles.typeOption}
            onPress={() => setSearchType(opt.value)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={searchType === opt.value ? 'radio-button-on' : 'radio-button-off'}
              size={18}
              color={searchType === opt.value ? colors.primary : colors.mutedForeground}
            />
            <Text
              style={[
                styles.typeLabel,
                { color: searchType === opt.value ? colors.primary : colors.mutedForeground },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search input */}
      <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          value={query}
          onChangeText={setQuery}
          placeholder={
            searchType === 'serviceNumber' ? 'رقم الخدمة'
            : searchType === 'meterNumber' ? 'رقم العداد'
            : 'اسم المشترك'
          }
          placeholderTextColor={colors.mutedForeground}
          keyboardType={searchType !== 'customerName' ? 'numeric' : 'default'}
          textAlign="right"
          returnKeyType="search"
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnText, { color: colors.foreground }]}>رجوع</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={() => {/* search triggered by useMemo */}}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnText, { color: '#fff' }]}>بحث</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {query.trim().length > 0 && (
        <>
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsCount, { color: colors.mutedForeground }]}>
              {results.length} نتيجة
            </Text>
          </View>

          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                onPress={() =>
                  router.push({ pathname: '/(tabs)/task/[id]', params: { id: item.id } })
                }
              />
            )}
            contentContainerStyle={{ paddingBottom: bottomPad + 20 }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={44} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  لا توجد نتائج
                </Text>
              </View>
            }
          />
        </>
      )}
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
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 20,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'right',
  },
  clearBtn: {
    padding: 4,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    marginTop: 12,
  },
  btn: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  resultsCount: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
    gap: 10,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
});
