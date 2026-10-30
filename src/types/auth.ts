export type StaffRole = 'staff';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  employeeId: string;
  department: string;
  role: StaffRole;
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

