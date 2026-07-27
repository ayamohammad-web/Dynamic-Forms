import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, teams } = useAuth();

  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [showTeamPicker, setShowTeamPicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  const handleLogin = async () => {
    if (!employeeId.trim() || !password.trim() || !selectedTeamId) {
      Alert.alert('خطأ', 'يرجى إدخال جميع البيانات المطلوبة');
      return;
    }
    setLoading(true);
    try {
      await login(employeeId.trim(), password, selectedTeamId);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطأ في تسجيل الدخول';
      Alert.alert('خطأ', msg);
    } finally {
      setLoading(false);
    }
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <LinearGradient
      colors={['#1565C0', '#1E40AF', '#0D47A1']}
      style={[styles.gradient, { paddingTop: topPad, paddingBottom: bottomPad }]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.appTitle}>برنامج الفرق الفنية</Text>

        {/* Logo circle */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoCircle}>
            <Ionicons name="flash" size={64} color="#FFC300" />
          </View>
          <Text style={styles.logoLabel}>فرق الطوارئ</Text>
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>

          {/* Employee ID */}
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, textAlign: 'right' }]}
              value={employeeId}
              onChangeText={setEmployeeId}
              placeholder="الرقم الوظيفي"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              autoCapitalize="none"
              editable={!loading}
            />
            <View style={styles.inputIcon}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, textAlign: 'right', paddingLeft: 44 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="كلمة المرور"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            <View style={styles.inputIcon}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
            </View>
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>

          {/* Team Picker */}
          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={[styles.input, styles.teamPicker, { borderColor: colors.border }]}
              onPress={() => setShowTeamPicker(true)}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Ionicons name="chevron-down" size={16} color={colors.mutedForeground} />
              <Text
                style={[
                  styles.teamText,
                  { color: selectedTeam ? colors.foreground : colors.mutedForeground },
                ]}
              >
                {selectedTeam ? selectedTeam.name : 'اختر المجموعة'}
              </Text>
            </TouchableOpacity>
            <View style={styles.inputIcon}>
              <TouchableOpacity onPress={() => setSelectedTeamId('')}>
                <Ionicons name="refresh" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.btn, styles.loginBtn, { backgroundColor: colors.primary }]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>دخول</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.exitBtn, { borderColor: colors.border }]}
              onPress={() => {
                setEmployeeId('');
                setPassword('');
                setSelectedTeamId('');
              }}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text style={[styles.exitBtnText, { color: colors.mutedForeground }]}>خروج</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Device ID */}
        <Text style={styles.deviceId}>IMEI: 00000000000000</Text>
      </ScrollView>

      {/* Team Picker Modal */}
      <Modal visible={showTeamPicker} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowTeamPicker(false)}
          activeOpacity={1}
        >
          <View style={[styles.teamModal, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>اختر المجموعة</Text>
            <FlatList
              data={teams}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.teamOption,
                    item.id === selectedTeamId && { backgroundColor: colors.primary + '15' },
                  ]}
                  onPress={() => {
                    setSelectedTeamId(item.id);
                    setShowTeamPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.teamOptionText,
                      { color: item.id === selectedTeamId ? colors.primary : colors.foreground },
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 0,
  },
  appTitle: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 10,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,195,0,0.5)',
  },
  logoLabel: {
    color: '#FFC300',
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  inputGroup: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 44,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  teamPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  teamText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    flex: 1,
    textAlign: 'right',
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtn: {},
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  exitBtn: {
    borderWidth: 1,
  },
  exitBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  deviceId: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 20,
    fontFamily: 'Inter_400Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  teamModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  teamOption: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  teamOptionText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    textAlign: 'right',
  },
});
