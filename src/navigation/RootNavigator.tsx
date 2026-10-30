import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { RoomDetailsScreen } from '../screens/rooms/RoomDetailsScreen';
import { DeviceDetailsScreen } from '../screens/devices/DeviceDetailsScreen';
import { AlertsScreen } from '../screens/alerts/AlertsScreen';
import { Colors } from '../constants/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainApp"
        screenOptions={{
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.navy,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainApp"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RoomDetails"
          component={RoomDetailsScreen}
          options={({ route }) => ({ title: route.params.roomName })}
        />
        <Stack.Screen
          name="DeviceDetails"
          component={DeviceDetailsScreen}
          options={({ route }) => ({ title: route.params.deviceName })}
        />
        <Stack.Screen
          name="Alerts"
          component={AlertsScreen}
          options={{ title: 'AI Alerts & Interventions' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
