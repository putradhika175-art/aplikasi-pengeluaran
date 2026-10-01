const DEFAULT_URL = 'http://10.139.68.232:3000';
const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || DEFAULT_URL).replace(/\/$/, '');

export async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });
    
    if (response.status === 204) return null;
    
    const raw = await response.text();
    let data;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      throw new Error(`Respons server bukan JSON valid (${response.status})`);
    }

    if (!response.ok) {
      const error = new Error(data?.pesan || `Terjadi kesalahan HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Waktu tunggu koneksi habis. Silakan periksa koneksi backend.');
    }
    const msg = error.message || '';
    if (msg.includes('Network request failed') || msg.includes('canceled') || msg.includes('Failed to fetch')) {
      throw new Error(`Gagal terhubung ke API backend (${BASE_URL}). Pastikan server backend berjalan.`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  list: () => request('/pengeluaran'),
  detail: (id) => request(`/pengeluaran/${id}`),
  categories: () => request('/kategori'),
  create: (body) =>
    request('/pengeluaran', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (id, body) =>
    request(`/pengeluaran/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  remove: (id) => request(`/pengeluaran/${id}`, { method: 'DELETE' }),
};