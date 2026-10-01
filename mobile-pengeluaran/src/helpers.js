export function validate(judul, nominal) {
  if (!judul || !judul.trim()) return 'Judul pengeluaran wajib diisi';
  if (judul.trim().length > 100) return 'Judul maksimal 100 karakter';
  if (!nominal || !/^\d+$/.test(String(nominal).trim())) {
    return 'Nominal harus berupa angka rupiah utuh tanpa titik/koma';
  }
  const nilai = Number(nominal);
  if (!Number.isInteger(nilai) || nilai < 1 || nilai > 2147483647) {
    return 'Nominal harus antara Rp 1 hingga Rp 2.147.483.647';
  }
  return '';
}

export const rupiah = (nilai) => {
  const num = Number(nilai) || 0;
  return `Rp ${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

export function tanggalLokal(value) {
  if (!value) return '-';
  const bulanNama = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parts = value.split('-');
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    return `${parseInt(day, 10)} ${bulanNama[monthIdx]} ${year}`;
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return `${d.getDate()} ${bulanNama[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatBulanTahunCurrent() {
  const d = new Date();
  const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${namaBulan[d.getMonth()]} ${d.getFullYear()}`;
}