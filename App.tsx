/**
 * Smart Energy Manager - Mobile Client
 * React Native CLI Application
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider, DialogProvider } from './src/components/common';
import { RootNavigator } from './src/navigation/RootNavigator';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <ToastProvider>
        <DialogProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </DialogProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

export default App;
