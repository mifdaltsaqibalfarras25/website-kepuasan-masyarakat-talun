import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Star, MessageSquare, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalResponden: 0,
    rataRata: 0,
    totalSaran: 0,
    chartData: [0, 0, 0, 0, 0], // Data 5 hari terakhir
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // 1. Ambil Data Responden
      const { data: respData, error: respError } = await supabase
        .from("respondents")
        .select("tanggal_isi, kritik_saran");

      if (respError) throw respError;

      // 2. Ambil Data Jawaban (Skor)
      const { data: ansData, error: ansError } = await supabase
        .from("survey_answers")
        .select("skor");

      if (ansError) throw ansError;

      // --- HITUNG STATISTIK ---

      const total = respData.length;
      const saranCount = respData.filter(
        (r) => r.kritik_saran && r.kritik_saran.trim().length > 0,
      ).length;

      const totalSkor = ansData.reduce((acc, curr) => acc + curr.skor, 0);
      const avg =
        ansData.length > 0 ? (totalSkor / ansData.length).toFixed(1) : "0.0";

      // --- GRAFIK (LOGIKA TANGGAL) ---
      const last5Days = [];
      for (let i = 4; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last5Days.push(d.toDateString());
      }

      const chartCounts = [0, 0, 0, 0, 0];

      respData.forEach((item) => {
        if (!item.tanggal_isi) return;
        const itemDateStr = new Date(item.tanggal_isi).toDateString();
        const index = last5Days.indexOf(itemDateStr);
        if (index !== -1) {
          chartCounts[index] += 1;
        }
      });

      setStats({
        totalResponden: total,
        rataRata: avg,
        totalSaran: saranCount,
        chartData: chartCounts,
      });
    } catch (error) {
      console.error("Error fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-gray-500">
        <Loader2 className="animate-spin text-blue-600" /> Memuat Statistik...
      </div>
    );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Ringkasan Statistik</h2>

      {/* 1. KARTU STATISTIK */}
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

      {/* 2. GRAFIK BATANG DINAMIS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-8">
          Tren Pengisian Survei (5 Hari Terakhir)
        </h3>

        <div className="flex items-end justify-between h-56 gap-4 px-4 pb-2 border-b border-gray-100 relative">
          {/* Garis Grid Tipis (Opsional, Pemanis Visual) */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between text-xs text-gray-300 pr-2">
            <span>Max</span>
            <span>0</span>
          </div>

          {stats.chartData.map((val, idx) => {
            // LOGIKA BARU: Cari nilai tertinggi dari data yang ada.
            // Jika data [0, 1, 2], maka maxVal = 2.
            // Tinggi batang untuk 2 = (2/2)*100 = 100% (Penuh).
            // Tinggi batang untuk 1 = (1/2)*100 = 50% (Setengah).
            const maxVal = Math.max(...stats.chartData) || 1;
            const heightPerc = (val / maxVal) * 100;

            return (
              <div
                key={idx}
                className="w-full flex flex-col items-center gap-3 group relative z-10"
              >
                {/* Batang Grafik */}
                <div className="relative w-full max-w-[60px] h-full flex items-end">
                  <div
                    style={{ height: `${val === 0 ? 0 : heightPerc}%` }}
                    className={`w-full rounded-t-lg transition-all duration-1000 relative flex justify-center items-end 
                      ${val > 0 ? "bg-blue-600 group-hover:bg-blue-500 shadow-lg shadow-blue-200" : "bg-transparent"}`}
                  >
                    {/* Angka di dalam/atas batang */}
                    {val > 0 && (
                      <span className="mb-2 text-xs font-bold text-white">
                        {val}
                      </span>
                    )}
                  </div>

                  {/* Garis dasar jika 0 */}
                  {val === 0 && (
                    <div className="absolute bottom-0 w-full h-[2px] bg-gray-200"></div>
                  )}
                </div>

                {/* Label Hari */}
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
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
