import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
  ListFilter,
  AlertTriangle,
} from "lucide-react";

export default function QuestionPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Form Tambah
  const [newQuestion, setNewQuestion] = useState("");
  const [newCategory, setNewCategory] = useState("Pelayanan");

  // State Edit
  const [isEditing, setIsEditing] = useState(null);
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState("");

  // State Modal Hapus (BARU)
  const [deleteId, setDeleteId] = useState(null);

  const categories = ["Pelayanan", "Fasilitas", "SDM", "Waktu", "Lainnya"];

  // --- 1. READ ---
  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .order("id", { ascending: true });

    if (error) console.error(error);
    else setQuestions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // --- 2. CREATE ---
  const handleAdd = async () => {
    if (!newQuestion.trim()) return;

    const { error } = await supabase.from("questions").insert([
      {
        pertanyaan: newQuestion,
        kategori: newCategory,
        status: true,
      },
    ]);

    if (error) {
      alert("Gagal menambah: " + error.message);
    } else {
      setNewQuestion("");
      setNewCategory("Pelayanan");
      fetchQuestions();
    }
  };

  // --- 3. DELETE (EKSEKUSI HAPUS) ---
  const confirmDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", deleteId);

    if (error) {
      alert("Gagal hapus: " + error.message);
    } else {
      fetchQuestions();
    }
    setDeleteId(null); // Tutup modal
  };

  // --- 4. UPDATE ---
  const startEdit = (q) => {
    setIsEditing(q.id);
    setEditText(q.pertanyaan);
    setEditCategory(q.kategori);
  };

  const saveEdit = async (id) => {
    const { error } = await supabase
      .from("questions")
      .update({ pertanyaan: editText, kategori: editCategory })
      .eq("id", id);

    if (error) {
      alert("Gagal update: " + error.message);
    } else {
      setIsEditing(null);
      fetchQuestions();
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center">
        <Loader2 className="animate-spin inline mr-2 text-blue-600" /> Loading
        data...
      </div>
    );

  return (
    <div className="space-y-6 relative">
      <h2 className="text-2xl font-bold text-gray-800">
        Kelola Pertanyaan Survei
      </h2>

      {/* --- FORM TAMBAH --- */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3">
        <div className="w-full md:w-1/4 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <ListFilter size={18} />
          </div>
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white cursor-pointer hover:border-blue-400 transition-colors"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          placeholder="Tulis pertanyaan baru disini..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
        />

        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-200"
        >
          <Plus size={18} /> Tambah
        </button>
      </div>

      {/* --- LIST PERTANYAAN --- */}
      <div className="space-y-3">
        {questions.map((q, index) => (
          <div
            key={q.id}
            className="bg-white p-4 rounded-xl border border-gray-200 flex items-start md:items-center justify-between gap-4 group hover:border-blue-300 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0 mt-1 md:mt-0">
              {index + 1}
            </div>

            {isEditing === q.id ? (
              // --- MODE EDIT ---
              <div className="flex-1 flex flex-col md:flex-row gap-2 w-full">
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full md:w-1/4 px-3 py-2 border border-blue-400 rounded focus:outline-none bg-blue-50"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-blue-400 rounded focus:outline-none"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(q.id)}
                    className="text-white px-3 py-2 bg-green-600 rounded hover:bg-green-700 flex items-center gap-1 text-sm"
                  >
                    <Save size={16} /> Simpan
                  </button>
                  <button
                    onClick={() => setIsEditing(null)}
                    className="text-gray-600 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 flex items-center gap-1 text-sm"
                  >
                    <X size={16} /> Batal
                  </button>
                </div>
              </div>
            ) : (
              // --- MODE TAMPIL BIASA ---
              <>
                <div className="flex-1">
                  <span className="font-medium text-gray-800 block mb-1.5 leading-snug">
                    {q.pertanyaan}
                  </span>
                  <div className="flex gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        q.kategori === "Pelayanan"
                          ? "bg-blue-50 text-blue-600 border-blue-100"
                          : q.kategori === "Fasilitas"
                            ? "bg-purple-50 text-purple-600 border-purple-100"
                            : q.kategori === "SDM"
                              ? "bg-orange-50 text-orange-600 border-orange-100"
                              : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {q.kategori}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 self-start md:self-center shrink-0">
                  <button
                    onClick={() => startEdit(q)}
                    className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    // UBAH DISINI: Set ID untuk dihapus, jangan langsung hapus
                    onClick={() => setDeleteId(q.id)}
                    className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {questions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <p>Belum ada pertanyaan.</p>
            <p className="text-xs">Gunakan form di atas untuk menambah.</p>
          </div>
        )}
      </div>

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
                Hapus Pertanyaan?
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Yakin ingin menghapus? <strong>Semua jawaban masyarakat</strong>{" "}
                yang terkait dengan soal ini juga akan hilang permanen.
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
