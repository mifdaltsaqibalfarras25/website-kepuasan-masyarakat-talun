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
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase"; // Pastikan path ini benar

export default function SurveiApp() {
  // --- STATE MANAGEMENT ---
  const [step, setStep] = useState("intro"); // intro -> biodata -> survey -> comment -> success
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Untuk tombol loading

  // State Biodata (Sudah bersih dari 'layanan')
  const [biodata, setBiodata] = useState({
    nama: "",
    jk: "",
    usia: "",
    pendidikan: "",
    pekerjaan: "",
  });

  // --- 1. AMBIL SOAL DARI DATABASE ---
  useEffect(() => {
    const fetchQuestions = async () => {
      // Ambil soal yang statusnya 'true' (aktif)
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("status", true)
        .order("id", { ascending: true });

      if (error) {
        console.error("Gagal ambil soal:", error);
      } else {
        setQuestions(data || []);
      }
    };

    fetchQuestions();
  }, []);

  // Pilihan Jawaban (Skala Likert 1-5)
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
    // Validasi Input (Tanpa Layanan)
    if (
      !biodata.nama ||
      !biodata.jk ||
      !biodata.usia ||
      !biodata.pendidikan ||
      !biodata.pekerjaan
    ) {
      alert("Mohon lengkapi semua data diri terlebih dahulu.");
      return;
    }

    if (questions.length === 0) {
      alert(
        "Pertanyaan sedang dimuat atau koneksi bermasalah. Coba refresh halaman.",
      );
      return;
    }

    setStep("survey");
  };

  const handleAnswer = (val) => {
    // Simpan jawaban berdasarkan ID Soal dari Database
    setAnswers({ ...answers, [questions[qIndex].id]: val });
  };

  const handleNext = () => {
    if (qIndex < questions.length - 1) {
      setQIndex(qIndex + 1);
    } else {
      setStep("comment");
    }
  };

  const handlePrev = () => {
    if (qIndex > 0) {
      setQIndex(qIndex - 1);
    } else {
      setStep("survey");
    }
  };

  // --- 2. KIRIM DATA KE DATABASE ---
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
            kritik_saran: comment,
            // Kolom 'layanan_diterima' SUDAH DIHAPUS, aman.
          },
        ])
        .select()
        .single();

      if (respError) throw respError;

      // B. Simpan Jawaban Detil
      const respondentId = respondentData.id;

      const answersToInsert = Object.keys(answers).map((qId) => ({
        respondent_id: respondentId,
        question_id: parseInt(qId),
        skor: answers[qId],
      }));

      const { error: ansError } = await supabase
        .from("survey_answers")
        .insert(answersToInsert);

      if (ansError) throw ansError;

      // Jika sukses semua
      setStep("success");
    } catch (error) {
      console.error("Error submit:", error);
      alert("Terjadi kesalahan saat mengirim data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Hitung Progress Bar
  const progress =
    questions.length > 0
      ? Math.round(((qIndex + 1) / questions.length) * 100)
      : 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 font-sans text-slate-800">
      {/* Container Kartu Utama */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex flex-col relative">
        {/* Header (Muncul di semua step kecuali success) */}
        {step !== "success" && (
          <div className="pt-8 pb-4 text-center px-6 border-b border-gray-50 bg-white sticky top-0 z-10">
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
            {/* --- HALAMAN 1: INTRO --- */}
            {step === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-center pt-4"
              >
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-left shadow-sm">
                  <h3 className="flex items-center gap-2 font-semibold text-blue-800 mb-3">
                    <Info size={20} /> Informasi Survei
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    Survei ini bertujuan untuk mengukur tingkat kepuasan
                    masyarakat terhadap kualitas pelayanan publik di Kantor
                    Kelurahan Talun.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2 items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />{" "}
                      Identitas responden dirahasiakan.
                    </li>
                    <li className="flex gap-2 items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />{" "}
                      Hanya membutuhkan waktu 2-3 menit.
                    </li>
                  </ul>
                </div>

                <button
                  onClick={goToBiodata}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Mulai Isi Data Diri <ChevronRight size={18} />
                </button>
              </motion.div>
            )}

            {/* --- HALAMAN 2: BIODATA --- */}
            {step === "biodata" && (
              <motion.div
                key="biodata"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 pb-2 border-b border-gray-100">
                  <User className="text-blue-600" size={24} /> Data Responden
                </h2>

                <form onSubmit={startSurvey} className="space-y-5">
                  {/* Nama */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 focus:bg-white"
                      placeholder="Contoh: Budi Santoso"
                      value={biodata.nama}
                      onChange={(e) =>
                        setBiodata({ ...biodata, nama: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Usia */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Usia (Tahun)
                      </label>
                      <input
                        type="number"
                        required
                        min="15"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                        value={biodata.usia}
                        onChange={(e) =>
                          setBiodata({ ...biodata, usia: e.target.value })
                        }
                      />
                    </div>
                    {/* Jenis Kelamin */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jenis Kelamin
                      </label>
                      <select
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Pendidikan */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pendidikan Terakhir
                      </label>
                      <select
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                        value={biodata.pendidikan}
                        onChange={(e) =>
                          setBiodata({ ...biodata, pendidikan: e.target.value })
                        }
                      >
                        <option value="">Pilih...</option>
                        <option value="SD">SD / Sederajat</option>
                        <option value="SMP">SMP / Sederajat</option>
                        <option value="SMA">SMA / Sederajat</option>
                        <option value="SMK">SMK</option>
                        <option value="D3">Diploma (D3)</option>
                        <option value="S1">Sarjana (S1)</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                    {/* Pekerjaan */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pekerjaan
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                        placeholder="Contoh: Wiraswasta"
                        value={biodata.pekerjaan}
                        onChange={(e) =>
                          setBiodata({ ...biodata, pekerjaan: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="pt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep("intro")}
                      className="px-6 py-3 text-gray-600 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 flex justify-center items-center gap-2"
                    >
                      Lanjut ke Soal <ChevronRight size={18} />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* --- HALAMAN 3: SURVEY (PERTANYAAN) --- */}
            {step === "survey" && questions.length > 0 && (
              <motion.div
                key={`q-${qIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                    <span>
                      Pertanyaan {qIndex + 1} dari {questions.length}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-800 transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Teks Pertanyaan */}
                <h2 className="text-xl font-semibold text-gray-800 mb-6 leading-relaxed">
                  {questions[qIndex].pertanyaan}
                </h2>

                {/* Pilihan Jawaban */}
                <div className="space-y-3 flex-1">
                  {options.map((opt) => {
                    const isSelected =
                      answers[questions[qIndex].id] === opt.value;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => handleAnswer(opt.value)}
                        className={`
                          relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4
                          ${
                            isSelected
                              ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                              : "border-gray-100 hover:border-blue-200 hover:bg-gray-50 text-gray-600"
                          }
                        `}
                      >
                        <div
                          className={`
                          w-5 h-5 rounded-full border flex items-center justify-center shrink-0
                          ${isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300"}
                        `}
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

                {/* Navigasi Bawah */}
                <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-2 px-6 py-2.5 text-gray-500 hover:text-gray-800 font-medium transition-colors"
                  >
                    <ChevronLeft size={20} /> Sebelumnya
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!answers[questions[qIndex].id]}
                    className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Selanjutnya <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* --- HALAMAN 4: KOMENTAR --- */}
            {step === "comment" && (
              <motion.div
                key="comment"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col h-full"
              >
                <div className="mb-6">
                  <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                    <span>Langkah Terakhir</span>
                    <span>100%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-800 rounded-full" />
                </div>

                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Kritik & Saran (Opsional)
                </h2>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tuliskan masukan Anda untuk kemajuan Kelurahan Talun..."
                  className="w-full h-40 bg-gray-100 border-none rounded-xl p-5 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none outline-none"
                />

                <div className="flex justify-between mt-auto pt-8">
                  <button
                    onClick={() => setStep("survey")}
                    className="flex items-center gap-2 px-6 py-2.5 text-gray-500 font-medium hover:text-gray-800 transition-colors"
                  >
                    <ChevronLeft size={20} /> Kembali
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />{" "}
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send size={18} /> Kirim Survei
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* --- HALAMAN 5: SUKSES --- */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center text-center h-full py-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
                >
                  <CheckCircle
                    size={48}
                    className="text-green-600"
                    strokeWidth={3}
                  />
                </motion.div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Terima Kasih!
                </h2>
                <p className="text-gray-500 mb-8 max-w-sm">
                  Data Anda telah berhasil kami simpan. Masukan Anda sangat
                  berarti bagi kami.
                </p>

                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl w-full max-w-sm mb-8 text-sm text-left">
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-2">
                    Ringkasan Data:
                  </p>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">Nama:</span>
                    <span className="font-medium text-gray-800">
                      {biodata.nama}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 pt-2">
                    <span className="text-gray-600">Pekerjaan:</span>
                    <span className="font-medium text-gray-800">
                      {biodata.pekerjaan}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
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
