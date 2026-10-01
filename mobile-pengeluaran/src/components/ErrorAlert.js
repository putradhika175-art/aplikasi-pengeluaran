import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';

export function ErrorAlert({ message, onRetry }) {
  if (!message) return null;

  return (
    <View style={styles.alertContainer}>
      <Ionicons name="alert-circle-outline" size={22} color={Colors.error} />
      <View style={styles.textContainer}>
        <Text style={styles.errorTitle}>Terjadi Kesalahan</Text>
        <Text style={styles.errorMessage}>{message}</Text>
      </View>
      {onRetry && (
        <Pressable style={styles.retryButton} onPress={onRetry}>
          <Ionicons name="reload" size={16} color={Colors.error} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  alertContainer: {
    backgroundColor: Colors.errorContainer,
    borderRadius: 12,
    padding: 14,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  textContainer: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.errorText,
    marginBottom: 2,
  },
  errorMessage: {
    fontSize: 13,
    color: Colors.errorText,
    lineHeight: 18,
  },
  retryButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});
