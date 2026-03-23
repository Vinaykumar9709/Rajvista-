export enum UserRole {
  USER = 'USER',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string; // ISO Date string
  faceImage?: string; // Base64 string of captured face
  // Extended Guest Details
  origin?: 'DOMESTIC' | 'INTERNATIONAL';
  location?: string; // State for Domestic, Country for International
  idProofType?: string;
  idProofNumber?: string;
  // Admin/Staff Details
  assignedHotelId?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
}

export interface DashboardStats {
  totalUsers: number;
  totalStaff: number;
  totalAdmins: number;
  recentRegistrations: number;
}