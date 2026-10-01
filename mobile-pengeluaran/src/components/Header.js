import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';

export function Header({ subtitle = 'Beranda', onBack }) {
  const isNotHome = subtitle !== 'Beranda';

  return (
    <View style={styles.headerContainer}>
      <Pressable
        style={styles.leftContainer}
        onPress={isNotHome ? onBack : null}
        disabled={!isNotHome}
      >
        {isNotHome ? (
          <View style={styles.backBadge}>
            <Ionicons name="arrow-back" size={20} color={Colors.white} />
          </View>
        ) : (
          <View style={styles.logoBadge}>
            <Ionicons name="wallet-outline" size={20} color={Colors.white} />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>Aplikasi Pengeluaran</Text>
          <Text style={styles.subtitleText}>{subtitle}</Text>
        </View>
      </Pressable>

      <View style={styles.avatarCircle}>
        <Ionicons name="person" size={18} color={Colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(250, 248, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.6)',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  backBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  subtitleText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryContainer,
  },
});
