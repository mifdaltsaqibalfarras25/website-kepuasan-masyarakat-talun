import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Edit2, Save, X, Loader2 } from "lucide-react";

export default function QuestionPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Form
  const [newQuestion, setNewQuestion] = useState("");
  const [isEditing, setIsEditing] = useState(null); // ID soal yg diedit
  const [editText, setEditText] = useState("");

  // 1. READ (Ambil Data)
  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .order("id", { ascending: true });

    if (error) console.error(error);
    else setQuestions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // 2. CREATE (Tambah Data)
  const handleAdd = async () => {
    if (!newQuestion.trim()) return;

    const { error } = await supabase
      .from("questions")
      .insert([{ pertanyaan: newQuestion, kategori: "Umum", status: true }]);

    if (error) alert("Gagal menambah: " + error.message);
    else {
      setNewQuestion("");
      fetchQuestions(); // Refresh list
    }
  };

  // 3. DELETE (Hapus Data)
  const handleDelete = async (id) => {
    if (
      confirm(
        "Yakin ingin menghapus pertanyaan ini? Data jawaban terkait juga akan terhapus!",
      )
    ) {
      const { error } = await supabase.from("questions").delete().eq("id", id);
      if (error) alert("Gagal hapus: " + error.message);
      else fetchQuestions();
    }
  };

  // 4. UPDATE (Edit Data)
  const startEdit = (q) => {
    setIsEditing(q.id);
    setEditText(q.pertanyaan);
  };

  const saveEdit = async (id) => {
    const { error } = await supabase
      .from("questions")
      .update({ pertanyaan: editText })
      .eq("id", id);

    if (error) alert("Gagal update: " + error.message);
    else {
      setIsEditing(null);
      fetchQuestions();
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center">
        <Loader2 className="animate-spin inline mr-2" /> Loading data...
      </div>
    );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        Kelola Pertanyaan Survei
      </h2>

      {/* Form Tambah */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-3">
        <input
          type="text"
          placeholder="Tulis pertanyaan baru disini..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> Tambah
        </button>
      </div>

      {/* List Data */}
      <div className="space-y-3">
        {questions.map((q) => (
          <div
            key={q.id}
            className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between group hover:border-blue-300 transition-all"
          >
            {isEditing === q.id ? (
              // Mode Edit
              <div className="flex-1 flex gap-2 mr-4">
                <input
                  type="text"
                  className="flex-1 px-3 py-1 border border-blue-400 rounded focus:outline-none"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={() => saveEdit(q.id)}
                  className="text-green-600 p-2 bg-green-50 rounded hover:bg-green-100"
                >
                  <Save size={18} />
                </button>
                <button
                  onClick={() => setIsEditing(null)}
                  className="text-gray-500 p-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              // Mode Tampil
              <div className="flex-1">
                <span className="font-medium text-gray-800 block mb-1">
                  {q.pertanyaan}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  ID: {q.id} • Kategori: {q.kategori}
                </span>
              </div>
            )}

            {isEditing !== q.id && (
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(q)}
                  className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  title="Edit"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                  title="Hapus"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
        ))}

        {questions.length === 0 && (
          <p className="text-center text-gray-400 italic py-8">
            Belum ada pertanyaan.
          </p>
        )}
      </div>
    </div>
  );
}
