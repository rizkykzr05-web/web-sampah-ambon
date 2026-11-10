import React, { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  Truck,
  MapPin,
  Send,
  CheckCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  BarChart3,
  Calendar,
  Users,
  Layers,
  ArrowUpRight,
  Shield,
  FileText,
  Trash2,
  RefreshCw,
  Info,
  Navigation,
  ChevronRight,
  Sparkles,
} from "lucide-react";

// Data Awal Lokasi & Jadwal di Kota Ambon (5 Kecamatan)
const KECAMATAN_LIST = [
  "Sirimau",
  "Nusaniwe",
  "Baguala",
  "Teluk Ambon",
  "Leitimur Selatan",
];

const INITIAL_SCHEDULES = [
  {
    kecamatan: "Sirimau",
    jam: "18:00 - 22:00 WIT",
    lokasiTps: "TPS Batu Meja, TPS Mardika, TPS Karang Panjang",
    hari: "Setiap Hari",
  },
  {
    kecamatan: "Nusaniwe",
    jam: "19:00 - 23:00 WIT",
    lokasiTps: "TPS Kudamati, TPS Benteng, TPS Wainitu",
    hari: "Setiap Hari",
  },
  {
    kecamatan: "Baguala",
    jam: "17:30 - 21:00 WIT",
    lokasiTps: "TPS Passo, TPS Transit Passo, TPS Nania",
    hari: "Senin, Rabu, Jumat, Minggu",
  },
  {
    kecamatan: "Teluk Ambon",
    jam: "18:00 - 22:00 WIT",
    lokasiTps: "TPS Wayame, TPS Rumatiga, TPS Poka",
    hari: "Setiap Hari",
  },
  {
    kecamatan: "Leitimur Selatan",
    jam: "06:00 - 09:00 WIT",
    lokasiTps: "TPS Hutumuri, TPS Leahari",
    hari: "Selasa, Kamis, Sabtu",
  },
];

// Data Laporan Awal Simulasi
const INITIAL_REPORTS = [
  {
    id: "REP-101",
    nama: "Bapak Ahmad",
    telepon: "081234567890",
    kecamatan: "Sirimau",
    detailLokasi: "Depan Pasar Mardika dekat Jembatan",
    lat: -3.695,
    lng: 128.181,
    deskripsi:
      "Tumpukan sampah meluber ke badan jalan utama, bau menyengat membahayakan pedagang dan pengguna jalan.",
    fotoUrl:
      "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=60",
    tingkatTumpukan: "Besar", // Nilai bobot keparahan: 3
    tglLapor: "2026-11-08T08:30:00",
    jumlahPelapor: 14,
    status: "Pending", // Pending, Diverifikasi, Ditolak, Proses Pengangkutan, Selesai
    trukDialokasikan: null,
  },
  {
    id: "REP-102",
    nama: "Ona Maria",
    telepon: "081198765432",
    kecamatan: "Nusaniwe",
    detailLokasi: "Tepi Jurang Kudamati Lorong Kayu Putih",
    lat: -3.708,
    lng: 128.165,
    deskripsi:
      "Warga sering buang ke jurang karena TPS jauh. Sudah makin menumpuk 3 hari.",
    fotoUrl:
      "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=500&auto=format&fit=crop&q=60",
    tingkatTumpukan: "Sangat Besar", // Bobot: 4
    tglLapor: "2026-11-07T14:15:00",
    jumlahPelapor: 8,
    status: "Diverifikasi",
    trukDialokasikan: "Truk DLHP-04",
  },
  {
    id: "REP-103",
    nama: "Usman Latuconsina",
    telepon: "085243110099",
    kecamatan: "Teluk Ambon",
    detailLokasi: "Samping Kampus Poka bawah jembatan Merah Putih",
    lat: -3.662,
    lng: 128.194,
    deskripsi: "Sampah plastik pembungkus makanan bertumpuk di trotoar.",
    fotoUrl:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500&auto=format&fit=crop&q=60",
    tingkatTumpukan: "Sedang", // Bobot: 2
    tglLapor: "2026-11-09T10:00:00",
    jumlahPelapor: 3,
    status: "Pending",
    trukDialokasikan: null,
  },
  {
    id: "REP-104",
    nama: "Dominggus",
    telepon: "082199887766",
    kecamatan: "Baguala",
    detailLokasi: "Terminal Transit Passo Bagian Belakang",
    lat: -3.648,
    lng: 128.232,
    deskripsi: "Tumpukan limbah sisa sayuran dan buah busuk.",
    fotoUrl:
      "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500&auto=format&fit=crop&q=60",
    tingkatTumpukan: "Sangat Besar", // Bobot: 4
    tglLapor: "2026-11-06T09:00:00",
    jumlahPelapor: 19,
    status: "Proses Pengangkutan",
    trukDialokasikan: "Truk DLHP-02",
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("warga"); // 'warga', 'admin', 'peta'
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [filterKecamatan, setFilterKecamatan] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [selectedReportForMap, setSelectedReportForMap] = useState(null);

  // Form State untuk Pelaporan Warga
  const [formData, setFormData] = useState({
    nama: "",
    telepon: "",
    kecamatan: "Sirimau",
    detailLokasi: "",
    lat: -3.695,
    lng: 128.181,
    deskripsi: "",
    tingkatTumpukan: "Sedang",
    fotoUrl: "",
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Perhitungan Skor Urgensi (Algoritma Prioritas Pengangkutan)
  // Formulasi Skor Urgensi = (Hari Menumpuk * 25) + (Jumlah Pelapor * 15) + (Bobot Keparahan * 20)
  const calculateUrgencyScore = (report) => {
    const reportDate = new Date(report.tglLapor);
    const now = new Date("2026-11-10T18:00:00"); // simulasi waktu sistem saat ini
    const diffHours = Math.max(
      1,
      Math.floor((now - reportDate) / (1000 * 60 * 60)),
    );
    const diffDays = Math.max(0.5, diffHours / 24);

    let bobotKeparahan = 1;
    if (report.tingkatTumpukan === "Sedang") bobotKeparahan = 2;
    if (report.tingkatTumpukan === "Besar") bobotKeparahan = 3;
    if (report.tingkatTumpukan === "Sangat Besar") bobotKeparahan = 4;

    const score =
      diffDays * 25 + report.jumlahPelapor * 15 + bobotKeparahan * 20;
    return Math.round(score);
  };

  // Mengurutkan Laporan Berdasarkan Prioritas
  const sortedReports = useMemo(() => {
    return [...reports].sort((a, b) => {
      const scoreA = calculateUrgencyScore(a);
      const scoreB = calculateUrgencyScore(b);
      return scoreB - scoreA;
    });
  }, [reports]);

  // Filter Laporan untuk Admin & Visualisasi
  const filteredReports = useMemo(() => {
    return sortedReports.filter((r) => {
      const matchKec =
        filterKecamatan === "Semua" || r.kecamatan === filterKecamatan;
      const matchStat = filterStatus === "Semua" || r.status === filterStatus;
      return matchKec && matchStat;
    });
  }, [sortedReports, filterKecamatan, filterStatus]);

  // Submit Handler Laporan Warga
  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!formData.nama || !formData.detailLokasi || !formData.deskripsi) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newRep = {
        id: `REP-${Math.floor(100 + Math.random() * 900)}`,
        nama: formData.nama,
        telepon: formData.telepon,
        kecamatan: formData.kecamatan,
        detailLokasi: formData.detailLokasi,
        lat: parseFloat(formData.lat) || -3.695,
        lng: parseFloat(formData.lng) || 128.181,
        deskripsi: formData.deskripsi,
        fotoUrl:
          formData.fotoUrl ||
          "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=60",
        tingkatTumpukan: formData.tingkatTumpukan,
        tglLapor: new Date().toISOString(),
        jumlahPelapor: 1,
        status: "Pending",
        trukDialokasikan: null,
      };

      setReports([newRep, ...reports]);
      setIsSubmitting(false);
      setSubmitSuccess(true);

      // Reset Form
      setFormData({
        nama: "",
        telepon: "",
        kecamatan: "Sirimau",
        detailLokasi: "",
        lat: -3.695,
        lng: 128.181,
        deskripsi: "",
        tingkatTumpukan: "Sedang",
        fotoUrl: "",
      });

      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 600);
  };

  // Update Status Laporan oleh Admin
  const handleUpdateStatus = (id, newStatus, truk = null) => {
    setReports(
      reports.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status: newStatus,
            trukDialokasikan: truk !== null ? truk : r.trukDialokasikan,
          };
        }
        return r;
      }),
    );
  };

  // Tambah Dukungan Laporan (Crowdsourcing Upvote)
  const handleUpvoteReport = (id) => {
    setReports(
      reports.map((r) => {
        if (r.id === id) {
          return { ...r, jumlahPelapor: r.jumlahPelapor + 1 };
        }
        return r;
      }),
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* 1. HEADER & BRANDING BAR */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Branding Title & Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-2.5 rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-bold text-white tracking-wide">
                    Sistem Pelaporan & Prioritas Sampah Kota Ambon
                  </h1>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    DLHP Kota Ambon
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-400 inline" />
                  Keputusan Menteri LH No 2567/2025:{" "}
                  <span className="text-amber-400 font-semibold">
                    Status Darurat Sampah
                  </span>
                </p>
              </div>
            </div>

            {/* Global Quick Action / Nav Tab Buttons */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab("warga")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "warga"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Mode Warga</span>
              </button>
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "admin"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard DLHP (Admin)</span>
              </button>
              <button
                onClick={() => setActiveTab("peta")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "peta"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Peta & Jadwal</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* STATISTIK KRISIS SAMPAH KOTA AMBON */}
      <section className="bg-slate-900/60 border-b border-slate-800/80 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Volume Total Harian
                </span>
                <p className="text-lg font-bold text-slate-100">
                  256.41{" "}
                  <span className="text-xs font-normal text-slate-400">
                    ton/hari
                  </span>
                </p>
              </div>
              <Layers className="w-5 h-5 text-indigo-400 opacity-80" />
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Terangkut ke TPA
                </span>
                <p className="text-lg font-bold text-emerald-400">
                  180.50{" "}
                  <span className="text-xs font-normal text-slate-400">
                    ton/hari
                  </span>
                </p>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-400 opacity-80" />
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Terbuang ke Lingkungan
                </span>
                <p className="text-lg font-bold text-rose-400">
                  53.35{" "}
                  <span className="text-xs font-normal text-slate-400">
                    ton/hari
                  </span>
                </p>
              </div>
              <AlertTriangle className="w-5 h-5 text-rose-400 opacity-80" />
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Armada Truk DLHP
                </span>
                <p className="text-lg font-bold text-amber-400">
                  23 Truk{" "}
                  <span className="text-xs font-normal text-slate-400">
                    (Kurang 20)
                  </span>
                </p>
              </div>
              <Truck className="w-5 h-5 text-amber-400 opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: MODE WARGA (PELAPORAN & DUKUNGAN) */}
        {activeTab === "warga" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Input Laporan Warga */}
            <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-semibold text-white">
                  Formulir Pelaporan Penumpukan Sampah
                </h2>
              </div>

              {submitSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start space-x-3 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Laporan Berhasil Terkirim!</p>
                    <p className="text-slate-300 mt-0.5">
                      Terima kasih atas partisipasi Anda. Tim DLHP Kota Ambon
                      akan melakukan verifikasi dan menentukan prioritas
                      penanganan.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Nama Pelapor / Warga *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bpk. Dominggus / Ibu Sarah"
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Nomor Telepon / WA (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="0812xxxx..."
                    value={formData.telepon}
                    onChange={(e) =>
                      setFormData({ ...formData, telepon: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">
                      Kecamatan *
                    </label>
                    <select
                      value={formData.kecamatan}
                      onChange={(e) =>
                        setFormData({ ...formData, kecamatan: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                    >
                      {KECAMATAN_LIST.map((kec) => (
                        <option key={kec} value={kec}>
                          {kec}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-300 mb-1">
                      Tingkat Penumpukan *
                    </label>
                    <select
                      value={formData.tingkatTumpukan}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tingkatTumpukan: e.target.value,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Sedang">
                        Sedang (Perkiraan &lt; 1 Ton)
                      </option>
                      <option value="Besar">Besar (Perkiraan 1 - 3 Ton)</option>
                      <option value="Sangat Besar">
                        Sangat Besar (&gt; 3 Ton / Meluber)
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Detail Patokan Lokasi / Jalan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Depan Pasar Mardika / Tepi Jurang Kudamati"
                    value={formData.detailLokasi}
                    onChange={(e) =>
                      setFormData({ ...formData, detailLokasi: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Simulasi Input Foto */}
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Tautan Foto Bukti Tumpukan (Opsional)
                  </label>
                  <input
                    type="url"
                    placeholder="Paste URL foto tumpukan sampah (atau biarkan kosong untuk simulasi)"
                    value={formData.fotoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, fotoUrl: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Deskripsi Kondisi Sampah *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Jelaskan jenis sampah (organik/plastik), bau, hambatan jalan, dll..."
                    value={formData.deskripsi}
                    onChange={(e) =>
                      setFormData({ ...formData, deskripsi: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    Koordinat GPS Peta (Otomatis/Manual)
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-300 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px]">
                        Latitude:
                      </span>
                      <input
                        type="number"
                        step="any"
                        value={formData.lat}
                        onChange={(e) =>
                          setFormData({ ...formData, lat: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">
                        Longitude:
                      </span>
                      <input
                        type="number"
                        step="any"
                        value={formData.lng}
                        onChange={(e) =>
                          setFormData({ ...formData, lng: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 text-xs"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Mengirim Laporan...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim Laporan Pengaduan</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Daftar Laporan Publik & Dukungan Warga */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-white">
                      Laporan Penumpukan Sampah Saat Ini
                    </h2>
                    <p className="text-xs text-slate-400">
                      Dukungan warga (Upvote) akan meningkatkan skor urgensi
                      pengangkutan
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                      value={filterKecamatan}
                      onChange={(e) => setFilterKecamatan(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200"
                    >
                      <option value="Semua">Semua Kecamatan</option>
                      {KECAMATAN_LIST.map((kec) => (
                        <option key={kec} value={kec}>
                          {kec}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Cards List */}
                <div className="mt-4 space-y-3">
                  {filteredReports.map((report) => {
                    const urgency = calculateUrgencyScore(report);
                    return (
                      <div
                        key={report.id}
                        className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row gap-4 hover:border-slate-700 transition-all"
                      >
                        <img
                          src={report.fotoUrl}
                          alt="Sampah"
                          className="w-full sm:w-28 h-28 object-cover rounded-lg border border-slate-800 shrink-0"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                  {report.id}
                                </span>
                                <h3 className="text-sm font-semibold text-slate-100 mt-1">
                                  {report.detailLokasi}
                                </h3>
                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-emerald-400" />{" "}
                                  Kec. {report.kecamatan}
                                </p>
                              </div>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                                  report.status === "Pending"
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : report.status === "Diverifikasi"
                                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                      : report.status === "Proses Pengangkutan"
                                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                }`}
                              >
                                {report.status}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                              {report.deskripsi}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
                              <span>
                                Oleh:{" "}
                                <strong className="text-slate-200">
                                  {report.nama}
                                </strong>
                              </span>
                              <span>•</span>
                              <span>
                                Skor Urgensi:{" "}
                                <strong className="text-amber-400">
                                  {urgency} pt
                                </strong>
                              </span>
                            </div>

                            <button
                              onClick={() => handleUpvoteReport(report.id)}
                              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-xs transition-all"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>Dukung ({report.jumlahPelapor})</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MODE ADMIN / DLHP (ALOKASI ARMADA & MANAJEMEN PRIORITAS) */}
        {activeTab === "admin" && (
          <div className="space-y-6">
            {/* Control Header Admin */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  Dashboard Prioritas & Alokasi Armada DLHP
                </h2>
                <p className="text-xs text-slate-400">
                  Algoritma perangkingan berbasis tingkat keparahan, durasi
                  penumpukan, dan jumlah warga pelapor.
                </p>
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center space-x-1 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Kecamatan:</span>
                  <select
                    value={filterKecamatan}
                    onChange={(e) => setFilterKecamatan(e.target.value)}
                    className="bg-transparent text-slate-100 focus:outline-none"
                  >
                    <option value="Semua">Semua</option>
                    {KECAMATAN_LIST.map((kec) => (
                      <option key={kec} value={kec}>
                        {kec}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-1 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Status:</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-transparent text-slate-100 focus:outline-none"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Diverifikasi">Diverifikasi</option>
                    <option value="Proses Pengangkutan">
                      Proses Pengangkutan
                    </option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table Priority Reports */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4 font-semibold">
                        Rangking Prioritas
                      </th>
                      <th className="py-3 px-4 font-semibold">ID & Lokasi</th>
                      <th className="py-3 px-4 font-semibold">
                        Tingkat Tumpukan
                      </th>
                      <th className="py-3 px-4 font-semibold">
                        Jumlah Pelapor
                      </th>
                      <th className="py-3 px-4 font-semibold">Skor Urgensi</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">
                        Alokasi Armada Truk
                      </th>
                      <th className="py-3 px-4 font-semibold text-right">
                        Aksi Manajemen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredReports.map((report, idx) => {
                      const score = calculateUrgencyScore(report);
                      return (
                        <tr
                          key={report.id}
                          className="hover:bg-slate-800/30 transition-all"
                        >
                          {/* Rangking Badge */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                                idx === 0
                                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                                  : idx === 1
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                    : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              #{idx + 1}
                            </span>
                          </td>

                          {/* ID & Lokasi */}
                          <td className="py-3 px-4">
                            <span className="font-mono text-emerald-400 font-semibold">
                              {report.id}
                            </span>
                            <div className="font-medium text-slate-200 mt-0.5">
                              {report.detailLokasi}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              Kec. {report.kecamatan}
                            </span>
                          </td>

                          {/* Tingkat Tumpukan */}
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                report.tingkatTumpukan === "Sangat Besar"
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                  : report.tingkatTumpukan === "Besar"
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              }`}
                            >
                              {report.tingkatTumpukan}
                            </span>
                          </td>

                          {/* Pelapor */}
                          <td className="py-3 px-4 text-slate-300 font-semibold">
                            {report.jumlahPelapor} Warga
                          </td>

                          {/* Skor Urgensi */}
                          <td className="py-3 px-4">
                            <span className="text-sm font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                              {score} pt
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                report.status === "Pending"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : report.status === "Diverifikasi"
                                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                    : report.status === "Proses Pengangkutan"
                                      ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              }`}
                            >
                              {report.status}
                            </span>
                          </td>

                          {/* Alokasi Armada */}
                          <td className="py-3 px-4 text-slate-300">
                            {report.trukDialokasikan ? (
                              <span className="flex items-center space-x-1.5 text-purple-400 font-medium">
                                <Truck className="w-3.5 h-3.5" />
                                <span>{report.trukDialokasikan}</span>
                              </span>
                            ) : (
                              <span className="text-slate-500 italic">
                                Belum Dialokasi
                              </span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              {report.status === "Pending" && (
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(
                                      report.id,
                                      "Diverifikasi",
                                    )
                                  }
                                  className="bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded text-[11px] font-medium transition-all"
                                >
                                  Verifikasi
                                </button>
                              )}

                              {report.status === "Diverifikasi" && (
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(
                                      report.id,
                                      "Proses Pengangkutan",
                                      "Truk DLHP-03",
                                    )
                                  }
                                  className="bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1 rounded text-[11px] font-medium transition-all flex items-center space-x-1"
                                >
                                  <Truck className="w-3 h-3" />
                                  <span>Kirim Truk</span>
                                </button>
                              )}

                              {report.status === "Proses Pengangkutan" && (
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(report.id, "Selesai")
                                  }
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-[11px] font-medium transition-all flex items-center space-x-1"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Tandai Selesai</span>
                                </button>
                              )}

                              {report.status === "Selesai" && (
                                <span className="text-emerald-400 text-[11px] font-medium">
                                  Terangkut
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PETA SEBARAN & JADWAL PEMBUANGAN */}
        {activeTab === "peta" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visualisasi Peta Digital Interaktif (Simulasi Peta Spasial Ambon) */}
            <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-emerald-400" />
                    Peta Spasial Sebaran Titik Penumpukan (Kota Ambon)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Klik pada titik lokasi untuk melihat rincian laporan
                  </p>
                </div>
                <span className="text-[10px] bg-slate-950 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-full">
                  5 Kecamatan Interaktif
                </span>
              </div>

              {/* Mockup Map Canvas */}
              <div className="relative w-full h-[380px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
                {/* Background Grid Pattern simulating GIS Layer */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

                {/* Visual Landmark Kota Ambon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center opacity-20 pointer-events-none">
                  <span className="text-2xl font-bold uppercase tracking-widest text-slate-400">
                    Teluk Ambon
                  </span>
                </div>

                {/* Markers Laporan Sampah */}
                {reports.map((rep) => {
                  const score = calculateUrgencyScore(rep);
                  // Dynamic coordinate positioning mapping to CSS percentage for UI view
                  const topPos = ((rep.lat - -3.63) / (-3.72 - -3.63)) * 100;
                  const leftPos =
                    ((rep.lng - 128.14) / (128.25 - 128.14)) * 100;

                  return (
                    <div
                      key={rep.id}
                      onClick={() => setSelectedReportForMap(rep)}
                      style={{
                        top: `${Math.min(85, Math.max(10, topPos))}%`,
                        left: `${Math.min(85, Math.max(10, leftPos))}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                    >
                      <div className="relative flex items-center justify-center">
                        <span
                          className={`animate-ping absolute inline-flex h-8 w-8 rounded-full opacity-75 ${
                            score > 100 ? "bg-rose-500" : "bg-amber-500"
                          }`}
                        ></span>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 transition-transform group-hover:scale-125 ${
                            score > 100
                              ? "bg-rose-600 text-white"
                              : "bg-amber-500 text-slate-950"
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Tooltip Hover */}
                      <div className="hidden group-hover:block absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-slate-100 p-2 rounded-lg text-[11px] whitespace-nowrap shadow-xl z-20">
                        <p className="font-semibold text-emerald-400">
                          {rep.id} - {rep.kecamatan}
                        </p>
                        <p className="text-slate-300">{rep.detailLokasi}</p>
                        <p className="text-amber-400 font-mono font-bold">
                          Skor: {score} pt
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Marker Detail Card */}
              {selectedReportForMap && (
                <div className="mt-4 p-3 bg-slate-950 border border-emerald-500/30 rounded-xl flex items-start justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                      {selectedReportForMap.id}
                    </span>
                    <h4 className="font-bold text-slate-100">
                      {selectedReportForMap.detailLokasi} (
                      {selectedReportForMap.kecamatan})
                    </h4>
                    <p className="text-slate-400 mt-1">
                      {selectedReportForMap.deskripsi}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedReportForMap(null)}
                    className="text-slate-500 hover:text-slate-300 text-xs font-bold"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </div>

            {/* Jadwal Pembuangan Sampah Per Wilayah */}
            <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Jadwal Resmi Pembuangan DLHP
                    </h2>
                    <p className="text-xs text-slate-400">
                      Pengingat waktu buang warga untuk cegah penumpukan
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {INITIAL_SCHEDULES.map((sched) => (
                    <div
                      key={sched.kecamatan}
                      className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-400 text-sm">
                          {sched.kecamatan}
                        </span>
                        <span className="bg-slate-900 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {sched.jam}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px]">
                        Hari Operasional:{" "}
                        <span className="text-slate-100 font-medium">
                          {sched.hari}
                        </span>
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        Titik Penampungan:{" "}
                        <span className="text-slate-300">
                          {sched.lokasiTps}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start space-x-2 text-[11px] text-amber-300">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  Masyarakat diimbau hanya membawa sampah ke TPS sesuai jam
                  operasional di atas untuk mencegah tumpukan tak terangkut.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          <p>
            © 2026 Penelitian Rancang Bangun Sistem Informasi Persampahan Kota
            Ambon — Skema Penelitian Dosen
          </p>
          <p className="mt-1 text-[11px] text-slate-600">
            Dikembangkan berbasis Metode Agile Scrum & GIS Spasial Crowdsourcing
          </p>
        </div>
      </footer>
    </div>
  );
}
