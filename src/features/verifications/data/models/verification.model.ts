import type { VerificationEntity } from '../../domain/entities/verification.entity';

export interface VerificationModel {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: string;
  status: string;
  documentUrl?: string;
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function mapVerificationFromJson(json: any): VerificationEntity {
  return {
    id: json?.id ?? '',
    userId: json?.userId ?? '',
    userName: json?.userName ?? '',
    userEmail: json?.userEmail ?? '',
    type: json?.type ?? 'identity',
    status: json?.status ?? 'pending',
    documentUrl: json?.documentUrl ?? undefined,
    notes: json?.notes ?? undefined,
    reviewedBy: json?.reviewedBy ?? undefined,
    reviewedAt: json?.reviewedAt ?? undefined,
    createdAt: json?.createdAt ?? '',
    updatedAt: json?.updatedAt ?? '',
  };
}
