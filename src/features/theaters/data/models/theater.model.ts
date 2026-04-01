import type { TheaterEntity, SeatingLayoutEntity, SeatEntity } from '../../domain/entities/theater.entity';

export interface TheaterModel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  imageUrl?: string;
  phone?: string;
  managerId: string;
  capacity: number;
  isActive: boolean;
  layouts?: any[];
  createdAt: string;
  updatedAt: string;
}

export function mapTheaterFromJson(json: any): TheaterEntity {
  return {
    id: json?.id ?? '',
    name: json?.name ?? '',
    description: json?.description ?? '',
    address: json?.address ?? '',
    city: json?.city ?? '',
    imageUrl: json?.imageUrl ?? undefined,
    phone: json?.phone ?? undefined,
    managerId: json?.managerId ?? '',
    capacity: Number(json?.capacity) || 0,
    isActive: json?.isActive ?? true,
    layouts: Array.isArray(json?.layouts)
      ? json.layouts.map(mapLayoutFromJson)
      : undefined,
    createdAt: json?.createdAt ?? '',
    updatedAt: json?.updatedAt ?? '',
  };
}

export function mapLayoutFromJson(json: any): SeatingLayoutEntity {
  return {
    id: json?.id ?? '',
    theaterId: json?.theaterId ?? '',
    name: json?.name ?? '',
    description: json?.description ?? undefined,
    canvasWidth: Number(json?.canvasWidth) || 800,
    canvasHeight: Number(json?.canvasHeight) || 600,
    backgroundUrl: json?.backgroundUrl ?? undefined,
    seats: Array.isArray(json?.seats)
      ? json.seats.map(mapSeatFromJson)
      : undefined,
    isActive: json?.isActive ?? true,
    createdAt: json?.createdAt ?? '',
    updatedAt: json?.updatedAt ?? '',
  };
}

export function mapSeatFromJson(json: any): SeatEntity {
  return {
    id: json?.id ?? undefined,
    label: json?.label ?? '',
    sectionName: json?.sectionName ?? undefined,
    rowName: json?.rowName ?? undefined,
    seatNumber: json?.seatNumber != null ? Number(json.seatNumber) : undefined,
    posX: Number(json?.posX) || 0,
    posY: Number(json?.posY) || 0,
    angle: Number(json?.angle) || 0,
    color: json?.color ?? '#D4663F',
    backgroundColor: json?.backgroundColor ?? undefined,
    seatType: json?.seatType ?? 'standard',
    price: json?.price != null ? Number(json.price) : undefined,
    isActive: json?.isActive ?? true,
  };
}
