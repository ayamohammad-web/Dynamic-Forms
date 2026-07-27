import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOffline } from '@/context/OfflineContext';

export function SyncBanner() {
  const { isOnline, pendingCount } = useOffline();

  if (isOnline && pendingCount === 0) return null;

  return (
    <View style={[styles.banner, isOnline ? styles.warning : styles.danger]}>
      <Ionicons
        name={isOnline ? 'cloud-upload-outline' : 'cloud-offline-outline'}
        size={16}
        color={isOnline ? '#92400E' : '#7F1D1D'}
      />
      <Text style={[styles.text, { color: isOnline ? '#92400E' : '#7F1D1D' }]}>
        {isOnline
          ? `${pendingCount} بطاقة بانتظار الإرسال`
          : 'لا يوجد اتصال — سيتم الحفظ محلياً'}
      </Text>
      {isOnline && pendingCount > 0 && (
        <TouchableOpacity>
          <Text style={styles.syncBtn}>إرسال الآن</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  warning: { backgroundColor: '#FEF3C7' },
  danger: { backgroundColor: '#FEE2E2' },
  text: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    textAlign: 'right',
  },
  syncBtn: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#1565C0',
    textDecorationLine: 'underline',
  },
});
