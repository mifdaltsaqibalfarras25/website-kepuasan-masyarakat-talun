import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react"; // Tambah ikon Loader
import { supabase } from "@/lib/supabase"; // Import koneksi Supabase

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // State loading
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 1. Cek ke Database Supabase
      // "Cari di tabel admins yang username = X dan password = Y"
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .eq("username", username)
        .eq("password", password) // Catatan: Untuk ujikom ini OK, tapi di real world password harus di-hash (bcrypt)
        .single(); // .single() artinya kita harap cuma nemu 1 data

      if (error || !data) {
        // Jika error atau data kosong (tidak ketemu)
        throw new Error("Username atau Password salah!");
      }

      // 2. Jika Ketemu -> Simpan Sesi
      // Kita simpan data admin (ID dan Nama) ke LocalStorage biar browser "ingat"
      localStorage.setItem("admin_session", JSON.stringify(data));

      // 3. Pindah ke Dashboard
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Lock size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Login Petugas</h1>
          <p className="text-gray-500 text-sm mt-1">
            Sistem Survei Kepuasan Masyarakat
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 text-center border border-red-100 flex items-center justify-center gap-2">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 focus:bg-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 focus:bg-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-blue-200 mt-2 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Masuk Dashboard"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
