import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLeadStatuses, addLeadStatus, updateLeadStatus, deleteLeadStatus,
  getPropertyTypes, addPropertyType, updatePropertyType, deletePropertyType,
  phaseService, preferredSystemService, employeeService,
} from '@/services/optionService';
import type { LeadStatusItem, PropertyTypeItem, OptionItem, Employee } from '@/services/optionService';

// Lead Statuses
export function useLeadStatuses() {
  return useQuery({ queryKey: ['leadStatuses'], queryFn: getLeadStatuses });
}
export function useAddLeadStatus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Omit<LeadStatusItem, 'id'>) => addLeadStatus(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['leadStatuses'] }) });
}
export function useUpdateLeadStatus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<LeadStatusItem> }) => updateLeadStatus(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['leadStatuses'] }) });
}
export function useDeleteLeadStatus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => deleteLeadStatus(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['leadStatuses'] }) });
}

// Property Types
export function usePropertyTypes() {
  return useQuery({ queryKey: ['propertyTypes'], queryFn: getPropertyTypes });
}
export function useAddPropertyType() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Omit<PropertyTypeItem, 'id'>) => addPropertyType(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['propertyTypes'] }) });
}
export function useUpdatePropertyType() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<PropertyTypeItem> }) => updatePropertyType(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['propertyTypes'] }) });
}
export function useDeletePropertyType() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => deletePropertyType(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['propertyTypes'] }) });
}

// Phases
export function usePhases() {
  return useQuery({ queryKey: ['phases'], queryFn: phaseService.getAll });
}
export function useAddPhase() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Omit<OptionItem, 'id'>) => phaseService.add(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['phases'] }) });
}
export function useUpdatePhase() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<OptionItem> }) => phaseService.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['phases'] }) });
}
export function useDeletePhase() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => phaseService.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['phases'] }) });
}

// Preferred Systems
export function usePreferredSystems() {
  return useQuery({ queryKey: ['preferredSystems'], queryFn: preferredSystemService.getAll });
}
export function useAddPreferredSystem() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Omit<OptionItem, 'id'>) => preferredSystemService.add(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['preferredSystems'] }) });
}
export function useUpdatePreferredSystem() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<OptionItem> }) => preferredSystemService.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['preferredSystems'] }) });
}
export function useDeletePreferredSystem() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => preferredSystemService.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['preferredSystems'] }) });
}

// Employees
export function useEmployees() {
  return useQuery({ queryKey: ['employees'], queryFn: employeeService.getAll });
}
export function useAddEmployee() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Omit<Employee, 'id'>) => employeeService.add(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }) });
}
export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) => employeeService.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }) });
}
export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => employeeService.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }) });
}
