import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  House,
  DoorOpen,
  Cpu,
  ChartColumn,
  UserRound,
} from 'lucide-react-native';
import { MainTabParamList } from './types';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { RoomsScreen } from '../screens/rooms/RoomsScreen';
import { DevicesScreen } from '../screens/devices/DevicesScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { Colors, Typography } from '../constants/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

const INACTIVE_COLOR = '#64748B';
const ACTIVE_COLOR = '#087F5B';
const ICON_SIZE = 24;

export const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  // Bottom navigation height accounting for Android edge-to-edge system gestures
  const bottomInset = insets.bottom;
  const baseTabBarHeight = 64;
  const totalTabBarHeight = baseTabBarHeight + (bottomInset > 0 ? bottomInset - 4 : 8);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarLabelStyle: {
          fontSize: Typography.sizes.xxs,
          fontWeight: Typography.weights.semibold,
          marginTop: 2,
          marginBottom: 2,
        },
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: totalTabBarHeight,
          paddingTop: 8,
          paddingBottom: bottomInset > 0 ? bottomInset : 8,
          elevation: 8,
          ...Platform.select({
            ios: {
              shadowColor: Colors.heroNavy,
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
            },
          }),
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <House
              color={color}
              size={ICON_SIZE}
              strokeWidth={color === ACTIVE_COLOR ? 2.3 : 1.8}
            />
          ),
        }}
      />
      <Tab.Screen
        name="RoomsTab"
        component={RoomsScreen}
        options={{
          tabBarLabel: 'Rooms',
          tabBarIcon: ({ color }) => (
            <DoorOpen
              color={color}
              size={ICON_SIZE}
              strokeWidth={color === ACTIVE_COLOR ? 2.3 : 1.8}
            />
          ),
        }}
      />
      <Tab.Screen
        name="DevicesTab"
        component={DevicesScreen}
        options={{
          tabBarLabel: 'Devices',
          tabBarIcon: ({ color }) => (
            <Cpu
              color={color}
              size={ICON_SIZE}
              strokeWidth={color === ACTIVE_COLOR ? 2.3 : 1.8}
            />
          ),
        }}
      />
      <Tab.Screen
        name="AnalyticsTab"
        component={AnalyticsScreen}
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color }) => (
            <ChartColumn
              color={color}
              size={ICON_SIZE}
              strokeWidth={color === ACTIVE_COLOR ? 2.3 : 1.8}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <UserRound
              color={color}
              size={ICON_SIZE}
              strokeWidth={color === ACTIVE_COLOR ? 2.3 : 1.8}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
