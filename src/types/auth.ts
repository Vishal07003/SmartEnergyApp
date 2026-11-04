export type StaffRole = 'staff' | 'admin' | 'ADMIN' | 'STAFF';

export interface StaffUser {
  id: string;
  username?: string;
  name: string;
  email: string;
  phoneNumber: string;
  employeeId: string;
  department: string;
  role: StaffRole;
  isAdmin?: boolean;
  avatarUrl?: string;
  assignedBlock: string;
  notificationsEnabled: boolean;
  alertPushEnabled: boolean;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  refreshToken: string;
  user: StaffUser;
}

