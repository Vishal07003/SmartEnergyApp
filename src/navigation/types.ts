import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  RoomsTab: undefined;
  DevicesTab: undefined;
  AnalyticsTab: undefined;
  AlertsTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  MainApp: NavigatorScreenParams<MainTabParamList>;
  RoomDetails: { roomId: string; roomName: string };
  DeviceDetails: { deviceId: string; deviceName: string };
  Alerts: undefined;
  AlertDetails: { alertId: string; alertTitle: string };
  PersonalInfo: undefined;
  ChangePassword: undefined;
  HelpSupport: undefined;
  PrivacyPolicy: undefined;
  About: undefined;
};
