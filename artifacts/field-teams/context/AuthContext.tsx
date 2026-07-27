import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Team } from '@/types';
import { MOCK_TEAMS } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  teams: Team[];
  login: (employeeId: string, password: string, teamId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_KEY = '@field_teams/auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_KEY);
        if (stored) setUser(JSON.parse(stored) as User);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (employeeId: string, password: string, teamId: string) => {
    if (!employeeId.trim() || !password.trim() || !teamId) {
      throw new Error('جميع الحقول مطلوبة');
    }
    const team = MOCK_TEAMS.find((t) => t.id === teamId);
    if (!team) throw new Error('الفرقة غير موجودة');

    // TODO: Replace with real API: POST /api/auth/login
    const mockUser: User = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      employeeId: employeeId.trim(),
      name: 'موظف اختبار',
      team: team.name,
      teamId,
    };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: !!user, isLoading, teams: MOCK_TEAMS, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
