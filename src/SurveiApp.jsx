import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Info,
  Send,
  User,
  FileText,
} from "lucide-react";
import { supabase } from "@/lib/supabase"; // Import Supabase

export default function SurveiApp() {
  // --- STATE ---
  const [step, setStep] = useState("intro");
  const [questions, setQuestions] = useState([]); // Data Soal dari DB
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const [biodata, setBiodata] = useState({
    nama: "",
    jk: "",
    usia: "",
    pendidikan: "",
    pekerjaan: "",
    layanan: "",
  });

  // --- 1. AMBIL SOAL DARI SUPABASE SAAT LOAD ---
  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("status", true) // Hanya ambil soal aktif
        .order("id", { ascending: true });

      if (error) console.error("Gagal ambil soal:", error);
      else setQuestions(data || []);
    };

    fetchQuestions();
  }, []);

  const options = [
    { value: 1, label: "Sangat Tidak Puas" },
    { value: 2, label: "Tidak Puas" },
    { value: 3, label: "Cukup Puas" },
    { value: 4, label: "Puas" },
    { value: 5, label: "Sangat Puas" },
  ];

  // --- LOGIKA NAVIGASI ---
  const goToBiodata = () => setStep("biodata");

  const startSurvey = (e) => {
    e.preventDefault();
    if (
      !biodata.nama ||
      !biodata.jk ||
      !biodata.usia ||
      !biodata.pendidikan ||
      !biodata.pekerjaan ||
      !biodata.layanan
    ) {
      alert("Mohon lengkapi data diri.");
      return;
    }
    if (questions.length === 0) {
      alert("Gagal memuat pertanyaan. Cek koneksi internet.");
      return;
    }
    setStep("survey");
  };

  const handleAnswer = (val) => {
    // Simpan jawaban berdasarkan ID Pertanyaan Database
    setAnswers({ ...answers, [questions[qIndex].id]: val });
  };

  const handleNext = () => {
    if (qIndex < questions.length - 1) setQIndex(qIndex + 1);
    else setStep("comment");
  };

  const handlePrev = () => {
    if (qIndex > 0) setQIndex(qIndex - 1);
    else setStep("survey");
  };

  // --- 2. KIRIM DATA KE SUPABASE (INTI PROSES) ---
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // A. Simpan Data Responden
      const { data: respondentData, error: respError } = await supabase
        .from("respondents")
        .insert([
          {
            nama: biodata.nama,
            usia: parseInt(biodata.usia),
            jk: biodata.jk,
            pendidikan: biodata.pendidikan,
            pekerjaan: biodata.pekerjaan,
            layanan_diterima: biodata.layanan, // Sesuai kolom DB
            kritik_saran: comment, // Sesuai kolom DB
          },
        ])
        .select()
        .single();

      if (respError) throw respError;

      // B. Simpan Jawaban (Looping)
      const answersToInsert = Object.keys(answers).map((qId) => ({
        respondent_id: respondentData.id, // Ambil ID responden barusan
        question_id: parseInt(qId),
        skor: answers[qId], // Sesuai kolom DB
      }));

      const { error: ansError } = await supabase
        .from("survey_answers")
        .insert(answersToInsert);

      if (ansError) throw ansError;

      // Sukses!
      setStep("success");
    } catch (error) {
      alert("Terjadi kesalahan: " + error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const progress =
    questions.length > 0
      ? Math.round(((qIndex + 1) / questions.length) * 100)
      : 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex flex-col relative">
        {/* HEADER */}
        {step !== "success" && (
          <div className="pt-8 pb-4 text-center px-6 border-b border-gray-50">
            <div className="mx-auto w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mb-3 text-white shadow-blue-200 shadow-lg">
              <FileText size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Survei Kepuasan Masyarakat
            </h1>
            <p className="text-gray-500 text-sm">Kelurahan Talun Sumedang</p>
          </div>
        )}

        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* 1. INTRO */}
            {step === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-center"
              >
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-left">
                  <h3 className="flex items-center gap-2 font-semibold text-blue-800 mb-3">
                    <Info size={20} /> Informasi
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Bantu kami meningkatkan pelayanan Kelurahan Talun.
                  </p>
                </div>
                <button
                  onClick={goToBiodata}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200"
                >
                  Mulai Isi Data Diri
                </button>
              </motion.div>
            )}

            {/* 2. BIODATA */}
            {step === "biodata" && (
              <motion.div
                key="biodata"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <User className="text-blue-600" size={24} /> Data Responden
                </h2>
                <form onSubmit={startSurvey} className="space-y-4">
                  {/* Nama */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={biodata.nama}
                      onChange={(e) =>
                        setBiodata({ ...biodata, nama: e.target.value })
                      }
                    />
                  </div>
                  {/* Usia & JK */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Usia
                      </label>
                      <input
                        type="number"
                        required
                        min="17"
                        className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={biodata.usia}
                        onChange={(e) =>
                          setBiodata({ ...biodata, usia: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Jenis Kelamin
                      </label>
                      <select
                        required
                        className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={biodata.jk}
                        onChange={(e) =>
                          setBiodata({ ...biodata, jk: e.target.value })
                        }
                      >
                        <option value="">Pilih...</option>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>
                  </div>
                  {/* Pendidikan & Pekerjaan */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Pendidikan
                      </label>
                      <select
                        required
                        className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={biodata.pendidikan}
                        onChange={(e) =>
                          setBiodata({ ...biodata, pendidikan: e.target.value })
                        }
                      >
                        <option value="">Pilih...</option>
                        <option value="SD">SD</option>
                        <option value="SMP">SMP</option>
                        <option value="SMA">SMA/SMK</option>
                        <option value="D3">D3</option>
                        <option value="S1">S1</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Pekerjaan
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={biodata.pekerjaan}
                        onChange={(e) =>
                          setBiodata({ ...biodata, pekerjaan: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  {/* Layanan */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Layanan Diterima
                    </label>
                    <select
                      required
                      className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={biodata.layanan}
                      onChange={(e) =>
                        setBiodata({ ...biodata, layanan: e.target.value })
                      }
                    >
                      <option value="">Pilih Layanan...</option>
                      <option value="KTP">KTP / KK</option>
                      <option value="Surat Pindah">Surat Pindah</option>
                      <option value="SKCK">Pengantar SKCK</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep("intro")}
                      className="px-4 py-2 bg-gray-100 rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
                    >
                      Lanjut
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* 3. SURVEY */}
            {step === "survey" && questions.length > 0 && (
              <motion.div
                key={`q-${qIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>
                      Soal {qIndex + 1}/{questions.length}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  {questions[qIndex].pertanyaan}
                </h2>
                <div className="space-y-3 flex-1">
                  {options.map((opt) => {
                    const isSelected =
                      answers[questions[qIndex].id] === opt.value;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => handleAnswer(opt.value)}
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${isSelected ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-100 hover:bg-gray-50"}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="font-medium">{opt.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
                  <button
                    onClick={handlePrev}
                    className="text-gray-500 hover:text-gray-800 font-medium"
                  >
                    Sebelumnya
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!answers[questions[qIndex].id]}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                  >
                    Selanjutnya
                  </button>
                </div>
              </motion.div>
            )}

            {/* 4. KOMENTAR */}
            {step === "comment" && (
              <motion.div
                key="comment"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col h-full"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Kritik & Saran (Opsional)
                </h2>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tuliskan masukan Anda..."
                  className="w-full h-40 bg-gray-100 border-none rounded-xl p-5 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
                <div className="flex justify-between mt-auto pt-8">
                  <button
                    onClick={() => setStep("survey")}
                    className="text-gray-500 font-medium"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-lg flex items-center gap-2"
                  >
                    {isLoading ? (
                      "Mengirim..."
                    ) : (
                      <>
                        <Send size={18} /> Kirim Survei
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* 5. SUKSES */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center justify-center text-center h-full py-10"
              >
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={48} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Terima Kasih!
                </h2>
                <p className="text-gray-500 mb-8">
                  Data Anda telah tersimpan di sistem kami.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium"
                >
                  Isi Survei Baru
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
