import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from '../navigation/AppNavigator';
import { useProductStore, selectIsLoading, selectError, selectIsInitialized } from '../store/useProductStore';
import { colors, typography, spacing, borderRadius } from '../../theme';

function AppContent() {
  const initialize = useProductStore((s) => s.initialize);
  const isLoading = useProductStore(selectIsLoading);
  const error = useProductStore(selectError);
  const isInitialized = useProductStore(selectIsInitialized);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleRetry = useCallback(() => {
    // Reset store to allow re-initialization
    useProductStore.setState({ isInitialized: false, error: null });
    initialize();
  }, [initialize]);

  if (!isInitialized || isLoading) {
    return (
      <View style={styles.center} accessibilityLabel="Loading products">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center} accessibilityRole="alert">
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry loading products"
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <AppNavigator />;
}

export function AppProvider() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <AppContent />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xxxl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  retryText: {
    ...typography.label,
    color: '#FFFFFF',
    fontSize: 16,
  },
});
