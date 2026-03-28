export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export type VerificationType = 'organizer' | 'restaurant' | 'identity';

export interface VerificationEntity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: VerificationType;
  status: VerificationStatus;
  documentUrl?: string;
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationActionParams {
  id: string;
  action: 'approve' | 'reject';
  notes?: string;
}

export interface VerificationFilters {
  status?: VerificationStatus;
  type?: VerificationType;
  search?: string;
  page?: number;
  limit?: number;
}
