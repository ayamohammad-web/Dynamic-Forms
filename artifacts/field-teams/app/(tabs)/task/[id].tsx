import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useTasks } from '@/context/TasksContext';
import { useOffline } from '@/context/OfflineContext';
import { AppHeader } from '@/components/AppHeader';
import { StatusBadge } from '@/components/StatusBadge';

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const colors = useColors();
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={[styles.rowValue, { color: highlight ? '#DC2626' : colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const { getTask, getFormSchema, updateTaskStatus } = useTasks();
  const { addToQueue, isOnline } = useOffline();

  const task = getTask(id ?? '');
  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="تفاصيل العطل" showBack />
        <View style={styles.notFound}>
          <Text style={{ color: colors.mutedForeground, fontSize: 16 }}>المهمة غير موجودة</Text>
        </View>
      </View>
    );
  }

  const schema = getFormSchema(task.formSchemaId);

  const handleStartTask = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateTaskStatus(task.id, 'in_progress');
    router.push({ pathname: '/(tabs)/form/[taskId]', params: { taskId: task.id } });
  };

  const handleDelete = () => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد من حذف هذه المهمة؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          await updateTaskStatus(task.id, 'closed');
          router.back();
        },
      },
    ]);
  };

  const handleClose = () => {
    Alert.alert('إغلاق المهمة', 'هل تريد إغلاق هذه المهمة؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'إغلاق',
        onPress: async () => {
          if (!isOnline) {
            await addToQueue({ type: 'task_close', data: { taskId: task.id } });
            await updateTaskStatus(task.id, 'pending_sync');
          } else {
            await updateTaskStatus(task.id, 'closed');
          }
          router.back();
        },
      },
    ]);
  };

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleString('ar-SA');
    } catch {
      return iso;
    }
  }

  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="تفاصيل العطل" showBack />

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Timestamp banner */}
        <View style={[styles.timeBanner, { backgroundColor: colors.primary }]}>
          <Text style={styles.timeText}>{formatDate(task.entryDate)}</Text>
        </View>

        {/* Address banner */}
        <View style={[styles.addressBanner, { backgroundColor: '#F0F4FF' }]}>
          <Text style={[styles.addressText, { color: colors.primary }]}>{task.details}</Text>
          <TouchableOpacity style={[styles.prevBtn, { borderColor: colors.border }]}>
            <Text style={[styles.prevBtnText, { color: colors.primary }]}>تبليغات سابقة</Text>
          </TouchableOpacity>
        </View>

        {/* Details card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <StatusBadge status={task.status} />
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>تفاصيل العطل</Text>
          </View>

          <DetailRow label="رقم الخدمة" value={task.serviceNumber} />
          <DetailRow label="نوع العطل" value={task.faultType} />
          <DetailRow label="فئة العطل" value={task.faultCategory} />
          <DetailRow label="اهمية العطل" value={task.faultImportance} />
          <DetailRow label="حالة العطل" value={task.status === 'open' ? 'مفتوحه' : task.status === 'in_progress' ? 'قيد التنفيذ' : 'مغلقة'} />
          <DetailRow label="رقم الهاتف" value={task.phone} highlight />
          <DetailRow label="العنوان" value={task.address} />
          <DetailRow label="نوع العقار" value={task.propertyType} />
          <DetailRow label="اسم المشتكي" value={task.customerName} highlight />
          <DetailRow label="وقت التبليغ" value={formatDate(task.entryDate)} />
          <DetailRow label="تفاصيل العطل" value={task.details} />
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <ActionButton label="تعديل البطاقة" color={colors.border} textColor={colors.foreground} onPress={() => {}} />
          <ActionButton
            label={schema?.name ?? 'اجراء عداد'}
            color={colors.primary}
            textColor="#fff"
            onPress={handleStartTask}
            bold
          />
          {task.formSchemaId !== 'meter-change' && (
            <ActionButton
              label="تغيير عداد"
              color={colors.border}
              textColor={colors.foreground}
              onPress={() => {
                router.push({ pathname: '/(tabs)/form/[taskId]', params: { taskId: task.id } });
              }}
            />
          )}
          <ActionButton label="ارسال STS TOKEN" color="#E5E7EB" textColor="#9CA3AF" onPress={() => {}} disabled />
          <ActionButton label="اعادة الاسناد" color="#E5E7EB" textColor="#9CA3AF" onPress={() => {}} disabled />
          <ActionButton label="إغلاق المهمة" color="#FEE2E2" textColor="#DC2626" onPress={handleClose} />
          <ActionButton label="حذف" color="#FEE2E2" textColor="#DC2626" onPress={handleDelete} />
          <ActionButton label="رجوع" color={colors.secondary} textColor={colors.foreground} onPress={() => router.back()} />
        </View>
      </ScrollView>
    </View>
  );
}

function ActionButton({
  label, color, textColor, onPress, bold, disabled,
}: {
  label: string;
  color: string;
  textColor: string;
  onPress: () => void;
  bold?: boolean;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      <Text style={[styles.actionBtnText, { color: textColor }, bold && { fontFamily: 'Inter_700Bold' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  timeBanner: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'right',
  },
  addressBanner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'right',
    lineHeight: 20,
  },
  prevBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  prevBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  card: {
    margin: 14,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    textAlign: 'right',
    minWidth: 100,
  },
  rowValue: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    flex: 1,
    textAlign: 'left',
    flexWrap: 'wrap',
  },
  actions: {
    marginHorizontal: 14,
    gap: 8,
    marginBottom: 10,
  },
  actionBtn: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
});
