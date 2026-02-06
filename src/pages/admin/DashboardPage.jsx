import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Star, MessageSquare, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalResponden: 0,
    rataRata: 0,
    totalSaran: 0,
    chartData: [0, 0, 0, 0, 0], // Data H-4 sampai Hari Ini
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // 1. Ambil Semua Responden (untuk Total & Grafik)
      const { data: respData, error: respError } = await supabase
        .from("respondents")
        .select("created_at, kritik_saran");

      if (respError) throw respError;

      // 2. Ambil Semua Jawaban (untuk Rata-rata Skor)
      const { data: ansData, error: ansError } = await supabase
        .from("survey_answers")
        .select("skor");

      if (ansError) throw ansError;

      // --- PERHITUNGAN STATISTIK JS ---

      // A. Total Responden
      const total = respData.length;

      // B. Total Saran (yang tidak kosong)
      const saranCount = respData.filter(
        (r) => r.kritik_saran && r.kritik_saran.length > 5,
      ).length;

      // C. Rata-rata Skor
      const totalSkor = ansData.reduce((acc, curr) => acc + curr.skor, 0);
      const avg =
        ansData.length > 0 ? (totalSkor / ansData.length).toFixed(1) : "0.0";

      // D. Data Grafik (5 Hari Terakhir)
      const chart = [0, 0, 0, 0, 0];
      const today = new Date();

      respData.forEach((item) => {
        const date = new Date(item.created_at);
        // Hitung selisih hari
        const diffTime = Math.abs(today - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 5) {
          // Jika data masuk dalam 5 hari terakhir, masukkan ke array (dibalik urutannya)
          chart[4 - diffDays] += 1;
        }
      });

      setStats({
        totalResponden: total,
        rataRata: avg,
        totalSaran: saranCount,
        chartData: chart,
      });
    } catch (error) {
      console.error("Error fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Ringkasan Statistik</h2>

      {/* KARTU STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Responden"
          value={stats.totalResponden}
          icon={<Users className="text-blue-600" />}
          bg="bg-blue-50"
        />
        <StatsCard
          title="Indeks Kepuasan (1-5)"
          value={stats.rataRata}
          icon={<Star className="text-yellow-600" />}
          bg="bg-yellow-50"
        />
        <StatsCard
          title="Masukan Warga"
          value={stats.totalSaran}
          icon={<MessageSquare className="text-green-600" />}
          bg="bg-green-50"
        />
      </div>

      {/* GRAFIK BATANG MANUAL */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-6">
          Tren Pengisian Survei (5 Hari Terakhir)
        </h3>
        <div className="flex items-end justify-between h-40 gap-4">
          {stats.chartData.map((val, idx) => {
            // Agar grafik tidak overflow, kita buat skala max 100% (asumsi max sehari 50 orang biar kelihatan barnya)
            const heightPerc = Math.min(
              (val / (Math.max(...stats.chartData) || 1)) * 100,
              100,
            );
            return (
              <div
                key={idx}
                className="w-full flex flex-col items-center gap-2 group"
              >
                <div className="relative w-full max-w-[60px] bg-blue-50 rounded-t-lg h-full flex items-end">
                  <div
                    style={{ height: `${heightPerc === 0 ? 2 : heightPerc}%` }}
                    className={`w-full rounded-t-lg transition-all duration-1000 relative group-hover:opacity-90 ${val > 0 ? "bg-blue-600" : "bg-gray-200"}`}
                  >
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {val} Org
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {idx === 4 ? "Hari Ini" : `H-${4 - idx}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, bg }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${bg}`}>{icon}</div>
    </div>
  );
}
