import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLeads, getLead, createLead, updateLead, deleteLead, getNextCustomerCode,
} from '@/services/leadService';
import type { Lead, LeadStatus } from '@/types';

interface UseLeadsOptions {
  status?: LeadStatus;
  salesExecutive?: string;
  location?: string;
  propertyType?: string;
  search?: string;
  limit?: number;
  createdBy?: string;
  enabled?: boolean;
}

export function useLeads(options: UseLeadsOptions = {}) {
  return useQuery({
    queryKey: ['leads', options],
    queryFn: () => getLeads(options),
    enabled: options.enabled !== false,
  });
}

export function useLead(id: string | undefined) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => getLead(id!),
    enabled: Boolean(id),
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { leadData: Parameters<typeof createLead>[0]; userId: string; userName: string }) =>
      createLead(data.leadData, data.userId, data.userName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: string;
      data: Partial<Lead>;
      userId: string;
      userName: string;
      oldData?: Partial<Lead>;
    }) => updateLead(data.id, data.data, data.userId, data.userName, data.oldData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; customerCode: string; userId: string; userName: string }) =>
      deleteLead(data.id, data.customerCode, data.userId, data.userName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useNextCustomerCode() {
  return useQuery({
    queryKey: ['nextCustomerCode'],
    queryFn: getNextCustomerCode,
  });
}
