import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Colors, CategoryConfig } from '../theme';

const CATEGORIES = [
  'Semua',
  'Makanan',
  'Transport',
  'Pendidikan',
  'Hiburan',
  'Tanpa kategori',
];

export function CategoryFilter({ selectedCategory, onSelectCategory, count = 0 }) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>FILTER KATEGORI</Text>
        <Text style={styles.countText}>{count} Transaksi</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          const config = CategoryConfig[cat];
          const dotColor = config ? config.color : Colors.primary;

          return (
            <Pressable
              key={cat}
              onPress={() => onSelectCategory(cat)}
              style={[
                styles.chip,
                isActive ? styles.chipActive : styles.chipInactive,
              ]}
            >
              {cat !== 'Semua' && (
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: isActive ? Colors.white : dotColor },
                  ]}
                />
              )}
              <Text
                style={[
                  styles.chipText,
                  isActive ? styles.chipTextActive : styles.chipTextInactive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    gap: 6,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  chipInactive: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  colorDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.white,
  },
  chipTextInactive: {
    color: Colors.textSecondary,
  },
});
