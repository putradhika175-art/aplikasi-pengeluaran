import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { api } from './src/api';
import { rupiah, tanggalLokal, validate, formatBulanTahunCurrent } from './src/helpers';
import { Colors, CategoryConfig, getCategoryInfo } from './src/theme';

import { Header } from './src/components/Header';
import { SummaryCard } from './src/components/SummaryCard';
import { CategoryFilter } from './src/components/CategoryFilter';
import { ExpenseCard } from './src/components/ExpenseCard';
import { EmptyState } from './src/components/EmptyState';
import { ErrorAlert } from './src/components/ErrorAlert';
import { DeleteModal } from './src/components/DeleteModal';

const DEFAULT_CATEGORIES = [
  { id: 1, nama: 'Makanan' },
  { id: 2, nama: 'Transport' },
  { id: 3, nama: 'Pendidikan' },
  { id: 4, nama: 'Hiburan' },
];

export default function App() {
  return (
    <SafeAreaProvider>
      <Utama />
    </SafeAreaProvider>
  );
}

function Utama() {
  const [screen, setScreen] = useState('list'); // 'list' | 'create' | 'detail' | 'edit'
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [judul, setJudul] = useState('');
  const [nominal, setNominal] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [catatan, setCatatan] = useState('');

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const lock = useRef(false);

  // Switch Screen safely clearing error
  function changeScreen(nextScreen) {
    setError('');
    setScreen(nextScreen);
  }

  // Load list from backend
  async function load() {
    if (lock.current) return;
    lock.current = true;
    setLoading(true);
    setError('');
    try {
      const rows = await api.list();
      if (!Array.isArray(rows)) throw new Error('Daftar pengeluaran harus berupa array');
      setItems(rows);
    } catch (e) {
      setError(e.message);
    } finally {
      lock.current = false;
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Back Navigation
  function back() {
    if (lock.current) return;
    setError('');
    if (screen === 'edit') {
      changeScreen('detail');
    } else {
      changeScreen('list');
    }
  }

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'list' && !lock.current) return false;
      back();
      return true;
    });
    return () => sub.remove();
  }, [screen]);

  // Actions
  async function openDetail(id) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    
    const localItem = items.find((it) => String(it.id) === String(id));

    try {
      const data = await api.detail(id);
      if (data) {
        if (!data.kategori && localItem) {
          data.kategori = localItem.kategori;
        }
        setSelected(data);
      } else if (localItem) {
        setSelected(localItem);
      }
      changeScreen('detail');
    } catch (e) {
      if (localItem) {
        setSelected(localItem);
        changeScreen('detail');
      } else {
        setError(e.message);
      }
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  function openCreate() {
    if (lock.current) return;
    setError('');
    setJudul('');
    setNominal('');
    setCategoryId(1);
    setCatatan('');
    changeScreen('create');

    // Background fetch categories silently
    api.categories()
      .then((rows) => {
        if (Array.isArray(rows) && rows.length) setCategories(rows);
      })
      .catch(() => {});
  }

  function openEdit() {
    if (!selected) return;
    setError('');
    setJudul(selected.judul || '');
    setNominal(String(selected.nominal || ''));
    changeScreen('edit');
  }

  async function save() {
    if (lock.current) return;
    const pesan = validate(judul, nominal);
    if (pesan) {
      setError(pesan);
      return;
    }
    lock.current = true;
    setBusy(true);
    setError('');
    let saved = false;
    try {
      const body = { judul: judul.trim(), nominal: Number(nominal) };
      if (screen === 'create') {
        const res = await api.create({ ...body, id_kategori: categoryId });
        saved = true;
        const catObj = categories.find((c) => c.id === categoryId);
        const newItem = {
          id: res?.id || Date.now(),
          judul: body.judul,
          nominal: body.nominal,
          tanggal: new Date().toISOString(),
          kategori: catObj ? catObj.nama : 'Makanan',
          id_kategori: categoryId,
        };
        setItems((prev) => [newItem, ...prev]);
      } else {
        await api.update(selected.id, body);
        saved = true;
        setItems((prev) =>
          prev.map((it) =>
            it.id === selected.id ? { ...it, ...body } : it
          )
        );
      }
      changeScreen('list');
      setSelected(null);
      // Background sync
      api.list().then((rows) => {
        if (Array.isArray(rows)) setItems(rows);
      }).catch(() => {});
    } catch (e) {
      setError(
        saved
          ? `Data tersimpan. Gagal memuat ulang daftar: ${e.message}`
          : `${e.message}`
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function remove() {
    if (lock.current || !selected) return;
    lock.current = true;
    setBusy(true);
    setError('');
    const targetId = selected.id;
    try {
      await api.remove(targetId);
      setShowDeleteModal(false);
      setItems((prev) => prev.filter((it) => it.id !== targetId));
      setSelected(null);
      changeScreen('list');
      api.list().then((rows) => {
        if (Array.isArray(rows)) setItems(rows);
      }).catch(() => {});
    } catch (e) {
      setError(e.message);
    } finally {
      lock.current = false;
      setBusy(false);
      setShowDeleteModal(false);
    }
  }

  // Calculation for Total Expenses
  const totalAmount = items.reduce((acc, curr) => acc + Number(curr.nominal || 0), 0);

  // Filter items by category
  const filteredItems = items.filter((item) => {
    if (selectedCategory === 'Semua') return true;
    if (selectedCategory === 'Tanpa kategori') return !item.kategori || item.kategori === 'Tanpa kategori';
    return String(item.kategori).toLowerCase() === selectedCategory.toLowerCase();
  });

  const disabled = loading || busy;
  const subtitles = {
    list: 'Beranda',
    create: 'Tambah Pengeluaran',
    detail: 'Detail Pengeluaran',
    edit: 'Ubah Pengeluaran',
  };

  return (
    <SafeAreaView style={styles.page}>
      {/* App Header */}
      <Header subtitle={subtitles[screen]} onBack={back} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 1. DASHBOARD LIST SCREEN */}
        {screen === 'list' && (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={load} colors={[Colors.primary]} />
            }
            ListHeaderComponent={
              <>
                <SummaryCard
                  totalAmount={totalAmount}
                  onAdd={openCreate}
                  onRefresh={load}
                  disabled={disabled}
                />
                {!!error && (
                  <View style={styles.alertWrapper}>
                    <ErrorAlert message={error} onRetry={load} />
                  </View>
                )}
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  count={filteredItems.length}
                />
                {loading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Memuat data pengeluaran...</Text>
                  </View>
                )}
              </>
            }
            ListEmptyComponent={
              !loading && !error ? (
                <EmptyState onAdd={openCreate} />
              ) : null
            }
            renderItem={({ item }) => (
              <ExpenseCard item={item} onPress={openDetail} disabled={disabled} />
            )}
          />
        )}

        {/* 2. FORM TAMBAH PENGELUARAN */}
        {screen === 'create' && (
          <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
            {/* Top Bar with Back Button */}
            <View style={styles.formNavRow}>
              <Pressable style={styles.backButton} onPress={back} disabled={disabled}>
                <Ionicons name="arrow-back" size={20} color={Colors.primary} />
                <Text style={styles.backButtonText}>Kembali</Text>
              </Pressable>
              <Text style={styles.formNavTitle}>Tambah Pengeluaran</Text>
              <View style={{ width: 60 }} />
            </View>

            {!!error && (
              <View style={styles.alertWrapperForm}>
                <ErrorAlert message={error} />
              </View>
            )}

            {/* Large Nominal Display Input */}
            <View style={styles.nominalCard}>
              <View style={styles.nominalCardHeader}>
                <Text style={styles.nominalLabel}>NOMINAL TRANSAKSI *</Text>
                <View style={styles.currencyBadge}>
                  <Ionicons name="cash-outline" size={14} color={Colors.primary} />
                  <Text style={styles.currencyBadgeText}>IDR</Text>
                </View>
              </View>
              <View style={styles.nominalInputRow}>
                <Text style={styles.rpPrefix}>Rp</Text>
                <TextInput
                  style={styles.nominalInput}
                  value={nominal}
                  onChangeText={(val) => {
                    setError('');
                    setNominal(val);
                  }}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.border}
                  editable={!busy}
                />
              </View>
              <Text style={styles.inputHint}>Masukkan nominal angka tanpa titik</Text>
            </View>

            {/* Form Details Card */}
            <View style={styles.formCard}>
              {/* Judul Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Judul Pengeluaran <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={judul}
                  onChangeText={(val) => {
                    setError('');
                    setJudul(val);
                  }}
                  placeholder="Contoh: Makan Siang Nasi Padang"
                  placeholderTextColor={Colors.textMuted}
                  editable={!busy}
                  maxLength={100}
                />
              </View>

              {/* Category Radio Grid */}
              <View style={styles.inputGroup}>
                <View style={styles.categoryLabelRow}>
                  <Text style={styles.inputLabel}>Kategori *</Text>
                  <Text style={styles.selectedCatName}>
                    {categories.find((c) => c.id === categoryId)?.nama || 'Makanan'}
                  </Text>
                </View>
                <View style={styles.categoryGrid}>
                  {[
                    { id: 1, nama: 'Makanan', key: 'Makanan' },
                    { id: 2, nama: 'Transport', key: 'Transport' },
                    { id: 3, nama: 'Pendidikan', key: 'Pendidikan' },
                    { id: 4, nama: 'Hiburan', key: 'Hiburan' },
                    { id: null, nama: 'Tanpa Kategori', key: 'Tanpa kategori' },
                  ].map((cat) => {
                    const isSelected = categoryId === cat.id;
                    const catInfo = getCategoryInfo(cat.key);
                    return (
                      <Pressable
                        key={String(cat.id)}
                        disabled={busy}
                        onPress={() => setCategoryId(cat.id)}
                        style={[
                          styles.catChoiceCard,
                          isSelected && styles.catChoiceCardSelected,
                        ]}
                      >
                        <View style={[styles.catIconCircle, { backgroundColor: catInfo.bgColor }]}>
                          <Ionicons name={catInfo.icon} size={18} color={catInfo.color} />
                        </View>
                        <View style={styles.catChoiceTextCol}>
                          <Text style={styles.catChoiceTitle}>{cat.nama}</Text>
                          <Text style={styles.catChoiceSub}>{catInfo.subtitle}</Text>
                        </View>
                        {isSelected && (
                          <View style={styles.checkBadge}>
                            <Ionicons name="checkmark" size={10} color={Colors.white} />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Automatic Date Note */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tanggal</Text>
                <View style={styles.dateLockInput}>
                  <Ionicons name="calendar-outline" size={18} color={Colors.textMuted} />
                  <Text style={styles.dateLockText}>{formatBulanTahunCurrent()}</Text>
                  <Ionicons name="lock-closed-outline" size={16} color={Colors.border} />
                </View>
                <Text style={styles.inputHint}>Tanggal diisi otomatis oleh server</Text>
              </View>

              {/* Optional Note */}
              <View style={styles.inputGroup}>
                <View style={styles.categoryLabelRow}>
                  <Text style={styles.inputLabel}>
                    Catatan <Text style={styles.optionalText}>(Opsional)</Text>
                  </Text>
                  <Text style={styles.charCount}>{catatan.length}/120</Text>
                </View>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={catatan}
                  onChangeText={setCatatan}
                  placeholder="Tambahkan keterangan tambahan jika ada..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={3}
                  maxLength={120}
                  editable={!busy}
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.formActionGroup}>
              <Pressable
                disabled={disabled}
                onPress={save}
                style={[styles.primaryButton, disabled && styles.disabled]}
              >
                {busy ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color={Colors.white} />
                    <Text style={styles.primaryButtonText}>Simpan Pengeluaran</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                disabled={disabled}
                onPress={back}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Batal</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}

        {/* 3. DETAIL PENGELUARAN SCREEN */}
        {screen === 'detail' && selected && (
          <ScrollView contentContainerStyle={styles.formContent}>
            {/* Top Nav Row */}
            <View style={styles.formNavRow}>
              <Pressable style={styles.backButton} onPress={back} disabled={disabled}>
                <Ionicons name="arrow-back" size={20} color={Colors.primary} />
                <Text style={styles.backButtonText}>Kembali</Text>
              </Pressable>
              <Text style={styles.formNavTitle}>Detail Pengeluaran</Text>
              <View style={{ width: 60 }} />
            </View>

            {!!error && (
              <View style={styles.alertWrapperForm}>
                <ErrorAlert message={error} />
              </View>
            )}

            {/* Detail Card Container */}
            <View style={styles.detailCard}>
              <View style={styles.detailHeaderRow}>
                {(() => {
                  const catInfo = getCategoryInfo(selected.kategori);
                  return (
                    <View style={[styles.detailCatBadge, { backgroundColor: catInfo.badgeBg }]}>
                      <Ionicons name={catInfo.icon} size={14} color={catInfo.badgeText} />
                      <Text style={[styles.detailCatText, { color: catInfo.badgeText }]}>
                        {selected.kategori || 'Tanpa kategori'}
                      </Text>
                    </View>
                  );
                })()}
                <Text style={styles.detailDate}>{tanggalLokal(selected.tanggal)}</Text>
              </View>

              <Text style={styles.detailTitle}>{selected.judul}</Text>
              <Text style={styles.detailAmount}>{rupiah(selected.nominal)}</Text>

              <View style={styles.detailDivider} />

              <View style={styles.detailFieldRow}>
                <Text style={styles.fieldLabel}>ID Pengeluaran</Text>
                <Text style={styles.fieldValue}>#{selected.id}</Text>
              </View>

              <View style={styles.detailFieldRow}>
                <Text style={styles.fieldLabel}>ID Kategori</Text>
                <Text style={styles.fieldValue}>
                  {selected.id_kategori !== null && selected.id_kategori !== undefined
                    ? selected.id_kategori
                    : 'Tanpa kategori'}
                </Text>
              </View>

              <View style={styles.detailFieldRow}>
                <Text style={styles.fieldLabel}>Catatan</Text>
                <Text style={styles.fieldValue}>{selected.catatan || 'Belum ada catatan'}</Text>
              </View>

              <View style={styles.readOnlyNote}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.readOnlyNoteText}>
                  Kategori, tanggal, dan catatan bersifat informasi sistem.
                </Text>
              </View>
            </View>

            {/* Edit & Delete Action Buttons */}
            <View style={styles.detailActionRow}>
              <Pressable
                disabled={disabled}
                onPress={openEdit}
                style={styles.editOutlineButton}
              >
                <Ionicons name="create-outline" size={18} color={Colors.primary} />
                <Text style={styles.editOutlineText}>Ubah</Text>
              </Pressable>

              <Pressable
                disabled={disabled}
                onPress={() => setShowDeleteModal(true)}
                style={styles.deleteDangerButton}
              >
                <Ionicons name="trash-outline" size={18} color={Colors.white} />
                <Text style={styles.deleteDangerText}>Hapus</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}

        {/* 4. FORM UBAH PENGELUARAN */}
        {screen === 'edit' && selected && (
          <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
            {/* Top Bar */}
            <View style={styles.formNavRow}>
              <Pressable style={styles.backButton} onPress={back} disabled={disabled}>
                <Ionicons name="arrow-back" size={20} color={Colors.primary} />
                <Text style={styles.backButtonText}>Kembali</Text>
              </Pressable>
              <Text style={styles.formNavTitle}>Ubah Pengeluaran</Text>
              <View style={{ width: 60 }} />
            </View>

            {!!error && (
              <View style={styles.alertWrapperForm}>
                <ErrorAlert message={error} />
              </View>
            )}

            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Judul Pengeluaran <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={judul}
                  onChangeText={(val) => {
                    setError('');
                    setJudul(val);
                  }}
                  placeholder="Judul pengeluaran"
                  placeholderTextColor={Colors.textMuted}
                  editable={!busy}
                  maxLength={100}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Nominal Rupiah <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={nominal}
                  onChangeText={(val) => {
                    setError('');
                    setNominal(val);
                  }}
                  keyboardType="number-pad"
                  placeholder="Nominal"
                  placeholderTextColor={Colors.textMuted}
                  editable={!busy}
                />
              </View>

              <View style={styles.readOnlyNote}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.primary} />
                <Text style={styles.readOnlyNoteText}>
                  API ubah memperbarui judul dan nominal pengeluaran.
                </Text>
              </View>
            </View>

            <View style={styles.formActionGroup}>
              <Pressable
                disabled={disabled}
                onPress={save}
                style={[styles.primaryButton, disabled && styles.disabled]}
              >
                {busy ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color={Colors.white} />
                    <Text style={styles.primaryButtonText}>Simpan Perubahan</Text>
                  </>
                )}
              </Pressable>

              <Pressable disabled={disabled} onPress={back} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Batal</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {/* 5. MODAL KONFIRMASI HAPUS (Screen 6) */}
      <DeleteModal
        visible={showDeleteModal}
        itemTitle={selected?.judul || ''}
        onCancel={() => setShowDeleteModal(false)}
        onDelete={remove}
        busy={busy}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  alertWrapper: {
    marginBottom: 8,
  },
  alertWrapperForm: {
    marginBottom: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textMuted,
  },

  // Form Styles
  formContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingRight: 10,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  formNavTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },

  // Nominal Box
  nominalCard: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  nominalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nominalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.6,
  },
  currencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  currencyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  nominalInputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  rpPrefix: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  nominalInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    padding: 0,
  },
  inputHint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 6,
  },

  // Form Details Card
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    gap: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 20,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  requiredStar: {
    color: Colors.error,
  },
  optionalText: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  categoryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCatName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  textInput: {
    height: 48,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: Colors.textMuted,
  },

  // Category Selector Grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  catChoiceCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
  },
  catChoiceCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  catIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catChoiceTextCol: {
    flex: 1,
  },
  catChoiceTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  catChoiceSub: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Locked Date Note
  dateLockInput: {
    height: 44,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  dateLockText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },

  // Buttons
  formActionGroup: {
    gap: 10,
  },
  primaryButton: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  secondaryButton: {
    height: 48,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  disabled: {
    opacity: 0.5,
  },

  // Detail Screen Styles
  detailCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 20,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailCatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  detailCatText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailDate: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  detailAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.error,
    letterSpacing: -0.5,
  },
  detailDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 16,
  },
  detailFieldRow: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  readOnlyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryBg,
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  readOnlyNoteText: {
    fontSize: 12,
    color: Colors.primary,
    flex: 1,
  },
  detailActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  editOutlineButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
  },
  editOutlineText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  deleteDangerButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteDangerText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
});