import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';

export function DeleteModal({ visible, itemTitle, onCancel, onDelete, busy = false }) {
  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogCard}>
          {/* Warning Icon Badge */}
          <View style={styles.iconCircle}>
            <Ionicons name="trash-outline" size={28} color={Colors.error} />
          </View>

          <Text style={styles.title}>Hapus Pengeluaran?</Text>

          <Text style={styles.message}>
            Apakah Anda yakin ingin menghapus <Text style={styles.boldText}>"{itemTitle}"</Text>? Tindakan ini tidak dapat dibatalkan.
          </Text>

          <View style={styles.buttonRow}>
            <Pressable
              disabled={busy}
              onPress={onCancel}
              style={[styles.cancelButton, busy && styles.disabled]}
            >
              <Text style={styles.cancelText}>Batal</Text>
            </Pressable>

            <Pressable
              disabled={busy}
              onPress={onDelete}
              style={[styles.deleteButton, busy && styles.disabled]}
            >
              {busy ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <>
                  <Ionicons name="trash" size={16} color={Colors.white} />
                  <Text style={styles.deleteText}>Ya, Hapus</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(19, 27, 46, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  deleteButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    elevation: 2,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  disabled: {
    opacity: 0.5,
  },
});
