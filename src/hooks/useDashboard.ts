import type { Dashboard, Metadata } from '../../shared/types';
import { useWorkspace } from '../stores/useWorkspace';
import { useResource } from './useResource';
export function useDashboard() {
  const filters = useWorkspace((s) => s.filters);
  return useResource<Dashboard>('dashboard', { ...filters });
}
export function useMetadata() {
  return useResource<Metadata>('metadata');
}
