import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { RoomDetailsScreen } from '../screens/rooms/RoomDetailsScreen';
import { DeviceDetailsScreen } from '../screens/devices/DeviceDetailsScreen';
import { AddDeviceScreen } from '../screens/devices/AddDeviceScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { AlertsScreen } from '../screens/alerts/AlertsScreen';
import { AlertDetailsScreen } from '../screens/alerts/AlertDetailsScreen';
import {
  PersonalInfoScreen,
  ChangePasswordScreen,
  HelpSupportScreen,
  PrivacyPolicyScreen,
  AboutScreen,
} from '../screens/profile';
import { Colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { fcmService } from '../services/fcm';
import { useNavigationContainerRef } from '@react-navigation/native';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  React.useEffect(() => {
    fcmService.initialize(navigationRef);
  }, [navigationRef]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.navy,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{ headerShown: false }}
          />
        ) : (
          <>
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
              name="AddDevice"
              component={AddDeviceScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Analytics"
              component={AnalyticsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Alerts"
              component={AlertsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AlertDetails"
              component={AlertDetailsScreen}
              options={({ route }) => ({ title: route.params.alertTitle })}
            />
            <Stack.Screen
              name="PersonalInfo"
              component={PersonalInfoScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="HelpSupport"
              component={HelpSupportScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicyScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="About"
              component={AboutScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
