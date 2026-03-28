import { useState, useMemo } from 'react';
import {
  useCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
} from '../api/coupons-api';
import type { Coupon, CouponFilters, CouponStatus } from '../types/coupon';

export function useCouponsAdmin() {
  const [filters, setFilters] = useState<CouponFilters>({});

  const couponsQuery = useCoupons(filters);
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const coupons = (couponsQuery.data ?? []) as Coupon[];

  const couponsByStatus = useMemo(() => {
    const grouped: Record<CouponStatus, Coupon[]> = {
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

  const setStatusFilter = (status?: CouponStatus) =>
    setFilters((prev) => ({ ...prev, status, page: 1 }));

  const setSearchFilter = (search?: string) =>
    setFilters((prev) => ({ ...prev, search, page: 1 }));

  const setPage = (page: number) =>
    setFilters((prev) => ({ ...prev, page }));

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
