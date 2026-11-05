import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Filters, Task } from '../../shared/types';
interface Workspace {
  filters: Filters;
  cardPeriod: 'monthly' | 'yearly';
  comparison: 'yoy' | 'mom';
  setCardPeriod: (value: 'monthly' | 'yearly') => void;
  setComparison: (value: 'yoy' | 'mom') => void;
  theme: 'light' | 'dark';
  tasks: Task[];
  setFilters: (filters: Partial<Filters>) => void;
  toggleTheme: () => void;
  addTask: (task: Omit<Task, 'id' | 'status'>) => void;
  completeTask: (id: string) => void;
  removeTask: (id: string) => void;
}
export const useWorkspace = create<Workspace>()(
  persist(
    (set) => ({
      filters: { org: '招商蛇口', caliber: 'equity', date: '2026-10-25' },
      cardPeriod: 'monthly',
      comparison: 'mom',
      setCardPeriod: (cardPeriod) => set({ cardPeriod }),
      setComparison: (comparison) => set({ comparison }),
      theme: 'light',
      tasks: [],
      setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      addTask: (task) =>
        set((state) => ({ tasks: [...state.tasks, { ...task, id: crypto.randomUUID(), status: 'open' }] })),
      completeTask: (id) =>
        set((state) => ({ tasks: state.tasks.map((task) => (task.id === id ? { ...task, status: 'done' } : task)) })),
      removeTask: (id) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),
    }),
    { name: 'cmsk-marketing-workspace-v1', partialize: (state) => ({ theme: state.theme, tasks: state.tasks }) },
  ),
);
