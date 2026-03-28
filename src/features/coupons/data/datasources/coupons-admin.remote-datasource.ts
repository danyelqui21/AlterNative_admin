import { apiClient } from '@/core/api/api-client';
import type { CouponsAdminDatasource } from './coupons-admin.datasource';
import type { CouponModel } from '../models/coupon.model';
import type { CouponFilters, CreateCouponParams, UpdateCouponParams } from '../../domain/entities/coupon.entity';

export class CouponsAdminRemoteDatasource {
  async getAll(filters?: CouponFilters): Promise<CouponModel[]> {
    const { data } = await apiClient.get('/admin/coupons', { params: filters });
    return data?.data ?? data;
  }

  async getById(id: string): Promise<CouponModel> {
    const { data } = await apiClient.get(`/admin/coupons/${id}`);
    return data?.data ?? data;
  }

  async create(params: CreateCouponParams): Promise<CouponModel> {
    const { data } = await apiClient.post('/admin/coupons', params);
    return data?.data ?? data;
  }

  async update(id: string, params: UpdateCouponParams): Promise<CouponModel> {
    const { data } = await apiClient.put(`/admin/coupons/${id}`, params);
    return data?.data ?? data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/coupons/${id}`);
  }
}
