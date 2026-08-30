import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLeadStatuses, addLeadStatus, updateLeadStatus, deleteLeadStatus,
  getPropertyTypes, addPropertyType, updatePropertyType, deletePropertyType,
} from '@/services/optionService';
import type { LeadStatusItem, PropertyTypeItem } from '@/services/optionService';

// Lead Statuses
export function useLeadStatuses() {
  return useQuery({
    queryKey: ['leadStatuses'],
    queryFn: getLeadStatuses,
  });
}

export function useAddLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<LeadStatusItem, 'id'>) => addLeadStatus(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leadStatuses'] }),
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LeadStatusItem> }) => updateLeadStatus(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leadStatuses'] }),
  });
}

export function useDeleteLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLeadStatus(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leadStatuses'] }),
  });
}

// Property Types
export function usePropertyTypes() {
  return useQuery({
    queryKey: ['propertyTypes'],
    queryFn: getPropertyTypes,
  });
}

export function useAddPropertyType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<PropertyTypeItem, 'id'>) => addPropertyType(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['propertyTypes'] }),
  });
}

export function useUpdatePropertyType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PropertyTypeItem> }) => updatePropertyType(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['propertyTypes'] }),
  });
}

export function useDeletePropertyType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePropertyType(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['propertyTypes'] }),
  });
}
