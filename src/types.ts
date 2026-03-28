export interface Booking {
  name: string;
  timestamp: number;
}

export type Bookings = Record<string, Booking>;

export interface SeatInfo {
  id: string;
  row: string;
  number: number;
  x: number;
  z: number;
}

export const ROW_CONFIG: Record<string, number> = {
  J: 16,
  I: 14,
  H: 12,
  G: 12,
  F: 12,
  E: 12,
  D: 15,
  C: 15,
  B: 15,
  A: 15,
};

export const ROWS = Object.keys(ROW_CONFIG).sort().reverse(); // J to A
