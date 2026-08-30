import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, updateUserRole, updateUserActive } from '@/services/userService';
import type { UserRole } from '@/types';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, role }: { uid: string; role: UserRole }) =>
      updateUserRole(uid, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUserActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, active }: { uid: string; active: boolean }) =>
      updateUserActive(uid, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
