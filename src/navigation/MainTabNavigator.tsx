import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from './types';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { RoomsScreen } from '../screens/rooms/RoomsScreen';
import { DevicesScreen } from '../screens/devices/DevicesScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { Colors, Typography } from '../constants/theme';
import { Icon, IconName } from '../components/common/Icon';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  // Bottom navigation height accounting for Android edge-to-edge system gestures
  const bottomInset = insets.bottom;
  const baseTabBarHeight = 60;
  const totalTabBarHeight = baseTabBarHeight + (bottomInset > 0 ? bottomInset - 4 : 8);

  const renderTabIcon = (iconName: IconName, focused: boolean) => (
    <Icon
      name={iconName}
      size={20}
      color={focused ? Colors.primary : Colors.textMuted}
    />
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true, // Prevents Android keyboard from pushing tab bar upward
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: Typography.sizes.xxs,
          fontWeight: Typography.weights.semibold,
          marginTop: -2,
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
          tabBarIcon: ({ focused }) => renderTabIcon('bolt', focused),
        }}
      />
      <Tab.Screen
        name="RoomsTab"
        component={RoomsScreen}
        options={{
          tabBarLabel: 'Rooms',
          tabBarIcon: ({ focused }) => renderTabIcon('room', focused),
        }}
      />
      <Tab.Screen
        name="DevicesTab"
        component={DevicesScreen}
        options={{
          tabBarLabel: 'Devices',
          tabBarIcon: ({ focused }) => renderTabIcon('device', focused),
        }}
      />
      <Tab.Screen
        name="AnalyticsTab"
        component={AnalyticsScreen}
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ focused }) => renderTabIcon('analytics', focused),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => renderTabIcon('user', focused),
        }}
      />
    </Tab.Navigator>
  );
};
