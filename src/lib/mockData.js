export const mockStats = {
  totalResponden: 125,
  rataRataKepuasan: 4.5,
  totalSaran: 48,
  chartData: [85, 90, 75, 60, 95], // Contoh data grafik per hari
};

export const initialQuestions = [
  {
    id: 1,
    text: "Bagaimana kemudahan persyaratan pelayanan?",
    category: "Pelayanan",
    active: true,
  },
  {
    id: 2,
    text: "Bagaimana kecepatan waktu pelayanan?",
    category: "Waktu",
    active: true,
  },
  {
    id: 3,
    text: "Bagaimana kesopanan petugas pelayanan?",
    category: "SDM",
    active: true,
  },
];

// Pastikan variabel ini HANYA ADA SATU KALI
export const mockFeedbacks = [
  {
    id: 1,
    date: "2026-02-06 09:30",
    nama: "Budi Santoso",
    usia: 45,
    jk: "L",
    pendidikan: "S1",
    pekerjaan: "Wiraswasta",
    layanan: "Pembuatan KTP",
    text: "Pelayanan sangat cepat dan ramah, ruang tunggu dingin.",
    type: "Puas",
  },
  {
    id: 2,
    date: "2026-02-06 10:15",
    nama: "Siti Aminah",
    usia: 28,
    jk: "P",
    pendidikan: "D3",
    pekerjaan: "Ibu Rumah Tangga",
    layanan: "Kartu Keluarga",
    text: "Antrian agak panjang, mohon ditambah kursinya.",
    type: "Saran",
  },
  {
    id: 3,
    date: "2026-02-05 14:20",
    nama: "Asep Sunandar",
    usia: 19,
    jk: "L",
    pendidikan: "SMA",
    pekerjaan: "Pelajar/Mahasiswa",
    layanan: "SKCK",
    text: "Petugas menjelaskan syarat dengan sangat jelas.",
    type: "Puas",
  },
];
