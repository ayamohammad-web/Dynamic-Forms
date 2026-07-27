import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task, FormSchema } from '@/types';
import { MOCK_TASKS, MOCK_FORM_SCHEMAS } from '@/data/mockData';

interface TasksContextType {
  tasks: Task[];
  formSchemas: FormSchema[];
  isLoading: boolean;
  getTask: (id: string) => Task | undefined;
  getFormSchema: (id: string) => FormSchema | undefined;
  updateTaskStatus: (taskId: string, status: Task['status']) => Promise<void>;
  refresh: () => Promise<void>;
}

const TasksContext = createContext<TasksContextType | null>(null);
const TASKS_KEY = '@field_teams/tasks_data';
const SCHEMAS_KEY = '@field_teams/form_schemas';

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [formSchemas, setFormSchemas] = useState<FormSchema[]>(MOCK_FORM_SCHEMAS);
  const [isLoading, setIsLoading] = useState(true);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const stored = await AsyncStorage.getItem(TASKS_KEY);
      if (stored) {
        setTasks(JSON.parse(stored) as Task[]);
      } else {
        setTasks(MOCK_TASKS);
        await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(MOCK_TASKS));
      }
      // TODO: Replace with API call: GET /api/form-schemas
      const schemasStored = await AsyncStorage.getItem(SCHEMAS_KEY);
      if (schemasStored) {
        setFormSchemas(JSON.parse(schemasStored) as FormSchema[]);
      } else {
        await AsyncStorage.setItem(SCHEMAS_KEY, JSON.stringify(MOCK_FORM_SCHEMAS));
      }
    } catch {
      setTasks(MOCK_TASKS);
      setFormSchemas(MOCK_FORM_SCHEMAS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
    setTasks(updated);
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updated));
  };

  const getTask = (id: string) => tasks.find((t) => t.id === id);
  const getFormSchema = (id: string) => formSchemas.find((s) => s.id === id);

  return (
    <TasksContext.Provider
      value={{ tasks, formSchemas, isLoading, getTask, getFormSchema, updateTaskStatus, refresh: loadTasks }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used within TasksProvider');
  return ctx;
}
