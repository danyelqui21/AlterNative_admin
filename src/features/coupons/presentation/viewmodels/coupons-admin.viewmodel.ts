import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CouponEntity, CouponFilters, CouponStatus, CreateCouponParams, UpdateCouponParams } from '../../domain/entities/coupon.entity';
import { CouponsAdminRepositoryImpl } from '../../data/repositories/coupons-admin.repository-impl';
import { CouponsAdminRemoteDatasource } from '../../data/datasources/coupons-admin.remote-datasource';

const datasource = new CouponsAdminRemoteDatasource();
const repository = new CouponsAdminRepositoryImpl(datasource);

export function useCouponsAdminViewModel() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<CouponFilters>({});

  const couponsQuery = useQuery<CouponEntity[]>({
    queryKey: ['admin-coupons', filters],
    queryFn: () => repository.getAll(filters),
  });

  const createCoupon = useMutation<CouponEntity, Error, CreateCouponParams>({
    mutationFn: (params) => repository.create(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  const updateCoupon = useMutation<CouponEntity, Error, { id: string; params: UpdateCouponParams }>({
    mutationFn: ({ id, params }) => repository.update(id, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  const deleteCoupon = useMutation<void, Error, string>({
    mutationFn: (id) => repository.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  const coupons = (couponsQuery.data ?? []) as CouponEntity[];

  const couponsByStatus = useMemo(() => {
    const grouped: Record<CouponStatus, CouponEntity[]> = {
      active: [],
      expired: [],
      disabled: [],
    };
    coupons.forEach((c) => {
      grouped[c.status]?.push(c);
    });
    return grouped;
  }, [coupons]);

  const totalRedemptions = useMemo(
    () => coupons.reduce((sum, c) => sum + c.usedCount, 0),
    [coupons],
  );

  const setStatusFilter = useCallback((status?: CouponStatus) =>
    setFilters((prev) => ({ ...prev, status, page: 1 })), []);

  const setSearchFilter = useCallback((search?: string) =>
    setFilters((prev) => ({ ...prev, search, page: 1 })), []);

  const setPage = useCallback((page: number) =>
    setFilters((prev) => ({ ...prev, page })), []);

  return {
    coupons,
    couponsByStatus,
    totalRedemptions,
    isLoading: couponsQuery.isLoading,
    isError: couponsQuery.isError,
    error: couponsQuery.error,
    filters,
    setFilters,
    setStatusFilter,
    setSearchFilter,
    setPage,
    createCoupon,
    updateCoupon,
    deleteCoupon,
  };
}
