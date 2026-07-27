import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useRouter } from 'expo-router';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  showSearch?: boolean;
  showMenu?: boolean;
  onSearchPress?: () => void;
  onMenuPress?: () => void;
  notifCount?: number;
  pendingSync?: number;
}

export function AppHeader({
  title,
  showBack,
  showSearch,
  showMenu,
  onSearchPress,
  onMenuPress,
  notifCount = 0,
  pendingSync = 0,
}: AppHeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: topPad + 10, backgroundColor: colors.primary },
      ]}
    >
      <View style={styles.row}>
        {/* Left icons */}
        <View style={styles.side}>
          {showMenu && (
            <TouchableOpacity onPress={onMenuPress} style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="menu" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          {showBack && (
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {/* Right icons */}
        <View style={styles.side}>
          {showSearch && (
            <TouchableOpacity onPress={onSearchPress} style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="search" size={22} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <View>
              <Ionicons name="notifications" size={22} color={colors.accent} />
              {notifCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notifCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          {pendingSync > 0 && (
            <View style={styles.syncDot} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 12,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
  },
  iconBtn: {
    padding: 8,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    flex: 1,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginLeft: 4,
  },
});
