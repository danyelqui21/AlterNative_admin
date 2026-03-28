import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import type {
  Coupon,
  CouponFilters,
  CreateCouponRequest,
  UpdateCouponRequest,
} from '../types/coupon';

export function useCoupons(filters?: CouponFilters) {
  return useQuery<Coupon[]>({
    queryKey: ['admin-coupons', filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/coupons', { params: filters });
      return data?.data ?? data;
    },
  });
}

export function useCoupon(id: string) {
  return useQuery<Coupon>({
    queryKey: ['admin-coupon', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/coupons/${id}`);
      return data?.data ?? data;
    },
    enabled: !!id,
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation<Coupon, Error, CreateCouponRequest>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/admin/coupons', payload);
      return data?.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation<Coupon, Error, { id: string; updates: UpdateCouponRequest }>({
    mutationFn: async ({ id, updates }) => {
      const { data } = await api.put(`/admin/coupons/${id}`, updates);
      return data?.data ?? data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
      qc.invalidateQueries({ queryKey: ['admin-coupon', id] });
    },
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/admin/coupons/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });
}
