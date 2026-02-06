import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  MessageCircle,
  FileText,
  Briefcase,
  Loader2,
  Download,
} from "lucide-react";

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Ambil data responden, urutkan dari yang terbaru
      const { data, error } = await supabase
        .from("respondents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else setFeedbacks(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center">
        <Loader2 className="animate-spin inline mr-2" /> Mengambil data...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Data Responden</h2>
          <p className="text-gray-500 text-sm">
            Menampilkan {feedbacks.length} data masyarakat yang masuk.
          </p>
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Download size={16} /> Export Excel
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Identitas</th>
                <th className="px-6 py-4">Layanan & Profesi</th>
                <th className="px-6 py-4">Kritik & Saran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {feedbacks.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-blue-50/50 transition-colors"
                >
                  {/* Waktu */}
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap align-top">
                    {new Date(item.created_at).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>

                  {/* Identitas */}
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs uppercase">
                        {item.nama ? item.nama.charAt(0) : "U"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 capitalize">
                          {item.nama}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.jk === "L" ? "Laki-laki" : "Perempuan"},{" "}
                          {item.usia} Thn
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Layanan */}
                  <td className="px-6 py-4 align-top">
                    <div className="space-y-1">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded w-fit">
                        <FileText size={12} /> {item.layanan_diterima}
                      </span>
                      <div className="text-gray-600 text-xs flex items-center gap-1.5">
                        <Briefcase size={12} /> {item.pekerjaan}
                      </div>
                      <div className="text-gray-400 text-xs pl-4 italic">
                        ({item.pendidikan})
                      </div>
                    </div>
                  </td>

                  {/* Saran */}
                  <td className="px-6 py-4 text-gray-800 align-top max-w-xs">
                    {item.kritik_saran ? (
                      <div className="flex gap-2">
                        <MessageCircle
                          size={16}
                          className="text-gray-400 mt-0.5 shrink-0"
                        />
                        <p className="text-gray-600 leading-snug">
                          "{item.kritik_saran}"
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs italic">
                        - Tidak ada masukan -
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {feedbacks.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-400">
                    Belum ada data survei yang masuk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
