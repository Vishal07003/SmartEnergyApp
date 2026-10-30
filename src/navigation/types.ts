import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  RoomsTab: undefined;
  DevicesTab: undefined;
  AnalyticsTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  MainApp: NavigatorScreenParams<MainTabParamList>;
  RoomDetails: { roomId: string; roomName: string };
  DeviceDetails: { deviceId: string; deviceName: string };
  Alerts: undefined;
  AlertDetails: { alertId: string; alertTitle: string };
};
