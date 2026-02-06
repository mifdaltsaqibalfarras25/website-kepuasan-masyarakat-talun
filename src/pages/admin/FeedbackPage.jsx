import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  MessageCircle,
  Loader2,
  Download,
  User,
  Trash2,
  Eye,
  X,
  Star,
  AlertTriangle,
} from "lucide-react";

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk Modal Detail
  const [selectedRespondent, setSelectedRespondent] = useState(null);

  // State untuk Modal Hapus (BARU)
  const [deleteId, setDeleteId] = useState(null);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("respondents")
        .select(
          `
          *,
          survey_answers (
            skor,
            question: questions (pertanyaan)
          )
        `,
        )
        .order("id", { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error("Detail Error:", error.message);
      // alert("Gagal mengambil data"); // Opsional, matikan biar bersih
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FUNGSI EKSEKUSI HAPUS (Dipanggil dari Modal) ---
  const confirmDelete = async () => {
    if (!deleteId) return; // Penjagaan

    const { error } = await supabase
      .from("respondents")
      .delete()
      .eq("id", deleteId);

    if (error) {
      alert("Gagal menghapus data!");
    } else {
      fetchData(); // Refresh data
    }

    setDeleteId(null); // Tutup modal
  };

  const calculateAverage = (answers) => {
    if (!answers || answers.length === 0) return 0;
    const total = answers.reduce((acc, curr) => acc + curr.skor, 0);
    return (total / answers.length).toFixed(1);
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-2">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p>Sedang memuat data...</p>
      </div>
    );

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Data Responden</h2>
          <p className="text-gray-500 text-sm">
            Menampilkan {feedbacks.length} data masyarakat yang masuk.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4 w-[150px]">Waktu</th>
                <th className="px-6 py-4 w-[250px]">Identitas</th>
                <th className="px-6 py-4 w-[150px]">Skor Rata-rata</th>
                <th className="px-6 py-4">Kritik & Saran</th>
                <th className="px-4 py-4 w-[100px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {feedbacks.map((item, index) => {
                const avgScore = calculateAverage(item.survey_answers);
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    {/* Kolom Nomor */}
                    <td className="px-6 py-4 text-gray-500 font-medium align-top">
                      {index + 1}
                    </td>
                    {/* Waktu */}
                    <td className="px-6 py-4 text-gray-500 align-top whitespace-nowrap">
                      {item.tanggal_isi
                        ? new Date(item.tanggal_isi).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>

                    {/* Identitas */}
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold uppercase shadow-sm border border-blue-200">
                          {item.nama ? item.nama.charAt(0) : <User size={16} />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 capitalize">
                            {item.nama || "Tanpa Nama"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.pekerjaan || "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Skor Rata-rata */}
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-1 font-semibold text-gray-700">
                        <Star
                          size={14}
                          className="text-yellow-500 fill-yellow-500"
                        />
                        {avgScore}{" "}
                        <span className="text-xs text-gray-400 font-normal">
                          / 5.0
                        </span>
                      </div>
                    </td>

                    {/* Saran */}
                    <td className="px-6 py-4 align-top">
                      {item.kritik_saran ? (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <div className="flex gap-2">
                            <MessageCircle
                              size={14}
                              className="text-gray-400 mt-0.5 shrink-0"
                            />
                            <p className="text-gray-600 italic leading-snug text-xs">
                              "{item.kritik_saran}"
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs italic">
                          - Tidak ada masukan -
                        </span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="px-4 py-4 align-top text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setSelectedRespondent(item)}
                          className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                          title="Lihat Jawaban"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          // UBAH DISINI: Jangan langsung delete, tapi setDeleteId
                          onClick={() => setDeleteId(item.id)}
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Hapus Data"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DETAIL JAWABAN (KODE LAMA) --- */}
      {selectedRespondent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Detail Jawaban
                </h3>
                <p className="text-sm text-gray-500">
                  Responden: {selectedRespondent.nama}
                </p>
              </div>
              <button
                onClick={() => setSelectedRespondent(null)}
                className="p-2 bg-white rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                {selectedRespondent.survey_answers &&
                selectedRespondent.survey_answers.length > 0 ? (
                  selectedRespondent.survey_answers.map((ans, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-start gap-4 p-3 rounded-lg border border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-gray-700 font-medium">
                          {ans.question?.pertanyaan || "Pertanyaan dihapus"}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                          ans.skor >= 4
                            ? "bg-green-100 text-green-700"
                            : ans.skor <= 2
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        Skor: {ans.skor}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 italic">
                    Tidak ada data jawaban detail.
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
              <button
                onClick={() => setSelectedRespondent(null)}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL KONFIRMASI HAPUS (BARU) --- */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              {/* Icon Peringatan */}
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-600" size={28} />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Hapus Data?
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Apakah Anda yakin ingin menghapus data responden ini? Data yang
                dihapus tidak dapat dikembalikan.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
