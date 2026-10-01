import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getCategoryInfo } from '../theme';
import { rupiah, tanggalLokal } from '../helpers';

export function ExpenseCard({ item, onPress, disabled = false }) {
  const catInfo = getCategoryInfo(item.kategori);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Pengeluaran ${item.judul}`}
      disabled={disabled}
      onPress={() => onPress(item.id)}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.leftInfo}>
          <View style={[styles.iconBox, { backgroundColor: catInfo.bgColor }]}>
            <Ionicons name={catInfo.icon} size={20} color={catInfo.color} />
          </View>

          <View style={styles.titleColumn}>
            <Text style={styles.titleText} numberOfLines={1} ellipsisMode="tail">
              {item.judul}
            </Text>
            <View style={styles.dateRow}>
              <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.dateText}>{tanggalLokal(item.tanggal)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.amountColumn}>
          <Text style={styles.amountText}>{rupiah(item.nominal)}</Text>
        </View>
      </View>

      {/* Bottom Footer Bar */}
      <View style={styles.bottomBar}>
        <View style={[styles.categoryBadge, { backgroundColor: catInfo.badgeBg }]}>
          <Ionicons name={catInfo.icon} size={12} color={catInfo.badgeText} />
          <Text style={[styles.categoryText, { color: catInfo.badgeText }]}>
            {item.kategori || 'Tanpa kategori'}
          </Text>
        </View>

        <View style={styles.detailLink}>
          <Text style={styles.detailLinkText}>Lihat detail</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleColumn: {
    flex: 1,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  amountColumn: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.error,
    letterSpacing: -0.2,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
});
