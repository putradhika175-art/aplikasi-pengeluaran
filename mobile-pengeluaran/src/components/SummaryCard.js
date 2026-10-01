import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';
import { rupiah, formatBulanTahunCurrent } from '../helpers';

export function SummaryCard({ totalAmount, onAdd, onRefresh, disabled = false }) {
  return (
    <View style={styles.cardContainer}>
      {/* Visual background accent */}
      <View style={styles.bgCircle} />

      <View style={styles.topRow}>
        <View>
          <Text style={styles.cardTitle}>Daftar pengeluaran</Text>
          <View style={styles.subInfoRow}>
            <Text style={styles.monthText}>{formatBulanTahunCurrent()}</Text>
            <View style={styles.dotSeparator} />
            <Text style={styles.totalLabel}>Total: </Text>
            <Text style={styles.totalValue}>{rupiah(totalAmount)}</Text>
          </View>
        </View>
        <View style={styles.calendarBadge}>
          <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tambah pengeluaran"
          disabled={disabled}
          onPress={onAdd}
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.pressed,
            disabled && styles.disabled,
          ]}
        >
          <Ionicons name="add-circle" size={20} color={Colors.white} />
          <Text style={styles.addButtonText}>Tambah pengeluaran</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Muat ulang data"
          disabled={disabled}
          onPress={onRefresh}
          style={({ pressed }) => [
            styles.refreshButton,
            pressed && styles.pressed,
            disabled && styles.disabled,
          ]}
        >
          <Ionicons name="refresh" size={20} color={Colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(15, 118, 110, 0.05)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  monthText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  totalLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  calendarBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addButton: {
    flex: 1,
    height: 46,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  refreshButton: {
    width: 46,
    height: 46,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
