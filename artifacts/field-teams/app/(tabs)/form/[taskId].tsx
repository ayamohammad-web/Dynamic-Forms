import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useTasks } from '@/context/TasksContext';
import { useOffline } from '@/context/OfflineContext';
import { AppHeader } from '@/components/AppHeader';
import { DynamicFormField } from '@/components/DynamicFormField';

export default function FormScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const colors = useColors();
  const router = useRouter();
  const { getTask, getFormSchema, updateTaskStatus } = useTasks();
  const { isOnline, addToQueue } = useOffline();

  const task = getTask(taskId ?? '');
  const schema = task ? getFormSchema(task.formSchemaId) : undefined;

  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!task || !schema) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="النموذج" showBack />
        <View style={styles.center}>
          <Text style={{ color: colors.mutedForeground, fontSize: 16 }}>
            النموذج غير موجود
          </Text>
        </View>
      </View>
    );
  }

  const handleChange = (fieldId: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of schema.fields) {
      const value = formData[field.id];
      if (field.required) {
        if (value === undefined || value === null || value === '') {
          newErrors[field.id] = `حقل "${field.label}" مطلوب`;
        }
      }
      if (field.type === 'number' && field.digits && typeof value === 'string') {
        if (value.length !== field.digits) {
          newErrors[field.id] = `يجب أن يكون ${field.digits} أرقام`;
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('خطأ في التحقق', 'يرجى تصحيح الحقول المحددة');
      return;
    }

    setSubmitting(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const submission = {
        taskId: task.id,
        formSchemaId: schema.id,
        data: formData,
        submittedAt: new Date().toISOString(),
      };

      if (isOnline) {
        // TODO: POST /api/forms/submit
        await new Promise((r) => setTimeout(r, 1000)); // Simulate API call
        await updateTaskStatus(task.id, 'closed');
        Alert.alert('تم الإرسال', 'تم إرسال البيانات بنجاح', [
          { text: 'موافق', onPress: () => router.replace('/(tabs)') },
        ]);
      } else {
        await addToQueue({ type: 'form_submit', data: submission });
        await updateTaskStatus(task.id, 'pending_sync');
        Alert.alert(
          'تم الحفظ محلياً',
          'لا يوجد اتصال. سيتم إرسال البيانات تلقائياً عند توفر الاتصال.',
          [{ text: 'موافق', onPress: () => router.replace('/(tabs)') }],
        );
      }
    } catch {
      Alert.alert('خطأ', 'حدث خطأ أثناء الإرسال. حاول مجدداً.');
    } finally {
      setSubmitting(false);
    }
  };

  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title={schema.name} showBack />

      {/* Banner */}
      <View style={[styles.banner, { backgroundColor: colors.accent }]}>
        <Text style={styles.bannerText}>{schema.name}</Text>
      </View>

      {/* Offline indicator */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>وضع بدون اتصال — سيتم الحفظ محلياً</Text>
        </View>
      )}

      {/* Service number preview */}
      <View style={[styles.taskInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.taskInfoText, { color: colors.primary }]}>
          رقم الخدمة: {task.serviceNumber}
        </Text>
        <Text style={[styles.taskInfoLabel, { color: colors.mutedForeground }]}>
          {task.customerName}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.formContent, { paddingBottom: bottomPad + 30 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {schema.fields.map((field) => (
          <DynamicFormField
            key={field.id}
            field={field}
            value={formData[field.id]}
            onChange={(v) => handleChange(field.id, v)}
            error={errors[field.id]}
          />
        ))}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary }, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>
              {isOnline ? 'إرسال البيانات' : 'حفظ محلياً'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Cancel */}
        <TouchableOpacity
          style={[styles.cancelBtn, { borderColor: colors.border }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
          disabled={submitting}
        >
          <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>إلغاء</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  banner: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A2E',
  },
  offlineBanner: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  offlineText: {
    color: '#DC2626',
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  taskInfo: {
    marginHorizontal: 14,
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskInfoText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  taskInfoLabel: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'right',
  },
  formContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 0,
  },
  submitBtn: {
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 12,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  cancelBtn: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
});
