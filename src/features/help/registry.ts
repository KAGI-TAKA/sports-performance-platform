import { HelpArticle } from "./types";

export const HELP_REGISTRY: Record<string, HelpArticle> = {
  "/dashboard": {
    id: "dashboard",
    title: "Pusat Kendali Pelatihan (Dashboard)",
    badge: "Pusat Kendali",
    subtitle: "Pantau kesiapan atlet, jadwal latihan hari ini, dan peringatan evaluasi berkala.",
    description:
      "Halaman ini adalah pusat komando untuk memantau kondisi fisik atlet, jadwal sesi latihan harian, beban kerja pelatih, dan peringatan evaluasi ulang (re-test) secara real-time.",
    sections: [
      {
        title: "Fungsi & Informasi Utama",
        bullets: [
          "Melihat kondisi & performa umum organisasi (total atlet aktif, sesi minggu ini, rata-rata skor asesmen, rasio kehadiran).",
          "Memantau jadwal sesi latihan hari ini dan memeriksa status kehadiran lapangan.",
          "Melihat peringatan re-test otomatis untuk atlet yang telah melewati siklus evaluasi berkala.",
          "Memantau distribusi beban kerja melatih tim pelatih agar seimbang.",
          "Meninjau direktori cepat atlet dan grafik adaptasi kesiapan skuad.",
          "Menggunakan pintasan cepat (Ctrl+K) untuk mencari atlet, sesi, atau halaman modul secara instan.",
        ],
      },
      {
        title: "Panduan Alur & Penggunaan Fitur",
        steps: [
          "Pemantauan Kondisi Organisasi: Kartu 'Statistik Utama' di bagian atas menyajikan rangkuman indikator utama akademi, meliputi total atlet aktif, akumulasi sesi minggu ini, dan skor rata-rata skuad.",
          "Pemeriksaan Agenda Sesi Hari Ini: Widget 'Sesi Latihan Hari Ini' menampilkan sesi lapangan yang sedang atau akan berjalan, lengkap dengan jam mulai, lokasi latihan, dan status presensi atlet.",
          "Evaluasi Berkala (Re-Test): Panel 'Jadwal Re-Test Atlet' secara otomatis menandai atlet yang telah jatuh tempo evaluasi. Klik nama atlet untuk membuka profil atau memulai asesmen lanjutan.",
          "Pencarian Cepat dengan Command Palette: Tekan tombol Ctrl+K (atau ⌘K di Mac) untuk membuka Command Palette dan menavigasi nama atlet atau modul sistem dalam sekejap.",
        ],
      },
      {
        title: "Penjelasan Field & Metrik Penting",
        bullets: [
          "Jadwal Re-Test: Peringatan otomatis yang muncul ketika seorang atlet belum menjalani tes fisik dalam jangka waktu periodisasi tertentu (misal >30–90 hari).",
          "Beban Kerja Kepelatihan: Volume jam melatih asisten pelatih dalam 30 hari terakhir untuk memastikan beban supervisi tidak berlebihan.",
          "Adaptasi Skuad: Agregat skor kesiapan fisik tim secara kolektif untuk mendeteksi apakah tim siap menghadapi intensitas kompetisi.",
        ],
      },
    ],
    roleNotes: [
      {
        role: "admin",
        note: "Sebagai Admin, Anda dapat memantau seluruh metrik operasional, ringkasan beban semua pelatih, dan log supervisi organisasi.",
      },
      {
        role: "head_coach",
        note: "Sebagai Head Coach, Anda dapat menggunakan tombol aksi cepat untuk segera memulai sesi asesmen baru atau merancang program latihan.",
      },
      {
        role: "assistant_coach",
        note: "Sebagai Asisten Pelatih, fokus utama Anda di dashboard adalah memeriksa sesi hari ini dan mencatat kehadiran atlet di lapangan.",
      },
    ],
    tips: [
      "Tekan Ctrl+K (atau ⌘K di Mac) kapan saja untuk mencari data atlet atau modul latihan tanpa harus membuka menu satu per satu.",
      "Periksa widget 'Jadwal Re-Test' secara berkala agar siklus periodisasi latihan atlet tetap terpantau tepat waktu.",
    ],
  },

  "/users": {
    id: "users",
    title: "Manajemen Pengguna & Tim",
    badge: "Administrasi Organisasi",
    subtitle: "Kelola akun pelatih, staf, orang tua, relasi anak, dan evaluasi supervisi tim.",
    description:
      "Halaman ini digunakan oleh Administrator untuk mengundang staf pelatih, mengelola akun orang tua murid, menghubungkan relasi anak, dan memantau mutu supervisi sesi.",
    sections: [
      {
        title: "Apa yang Bisa Anda Lakukan?",
        bullets: [
          "Menambahkan user baru (Admin, Head Coach, Assistant Coach, Parent).",
          "Mengubah profil dan data pengguna (nama lengkap, email, foto avatar preset).",
          "Mengaktifkan atau menonaktifkan akun staf/pelatih.",
          "Menghubungkan akun orang tua dengan profil atlet anaknya.",
          "Mencari pengguna berdasarkan nama/email dan memfilter berdasarkan peran.",
          "Memantau evaluasi supervisi kinerja asisten pelatih.",
        ],
      },
      {
        title: "Cara Melakukan Sesuatu",
        steps: [
          "Penambahan Pengguna Baru: Tombol '+ Tambah Pengguna' di sudut kanan atas memungkinkan penambahan staf atau wali murid dengan memilih peran, melengkapi email aktif, serta menautkan nama anak.",
          "Pengaturan Status Keaktifan: Tombol toggle status / Power pada masing-masing baris memungkinkan aktivasi atau penonaktifan akun staf tanpa menghilangkan histori kepelatihannya.",
          "Pembaruan Profil Pengguna: Ikon pensil 'Edit' pada baris pengguna menyediakan akses cepat untuk memperbarui nama lengkap, foto avatar preset, atau informasi akun.",
          "Sinkronisasi Relasi Orang Tua: Ikon rantai 'Hubungkan Anak' pada baris Orang Tua digunakan untuk menautkan profil atlet anak agar wali dapat memantau rapor di portal khusus.",
          "Penyaringan & Pencarian Akun: Kotak pencarian dan tab filter peran di atas tabel mempermudah penelusuran anggota staf kepelatihan atau orang tua secara spesifik.",
        ],
      },
      {
        title: "Penjelasan Peran & Hak Akses (Role)",
        bullets: [
          "Admin / Owner: Memiliki kontrol penuh atas seluruh sistem, konfigurasi benchmark master, manajemen akun, dan penghapusan data.",
          "Head Coach: Mengelola biodata atlet, melaksanakan asesmen fisik, merancang rencana program latihan, dan mengunduh laporan PDF resmi.",
          "Assistant Coach: Mencatat log kehadiran sesi latihan lapangan dan menginput nilai asesmen (tanpa izin menghapus riwayat).",
          "Orang Tua (Parent): Memiliki akses ke Portal Khusus Orang Tua untuk memantau kehadiran, grafik kebugaran, dan rapor anak mereka.",
          "Atlet (Athlete): Memiliki akses ke Portal Pribadi Atlet untuk memantau target pribadi, jadwal sesi, dan medali pencapaian.",
        ],
      },
    ],
    roleNotes: [
      {
        role: "admin",
        note: "Sebagai Admin, Anda memiliki hak penuh untuk menambah, mengedit, menonaktifkan pengguna, serta mengatur relasi orang tua dan atlet.",
      },
      {
        role: "head_coach",
        note: "Halaman ini diproteksi untuk Administrator. Head Coach berfokus pada manajemen teknis atlet dan program latihan.",
      },
    ],
    tips: [
      "Jika ada pelatih yang sedang cuti atau tidak aktif, gunakan toggle nonaktif daripada menghapus akun agar histori sesi latihannya tetap tersimpan rapi.",
      "Pastikan setiap akun orang tua sudah terhubung dengan nama atlet anaknya agar data perkembangan di portal orang tua tersinkronisasi.",
    ],
  },

  "/benchmarks": {
    id: "benchmarks",
    title: "Manajemen Benchmark & Item Tes",
    badge: "Norma Standar Fisik",
    subtitle: "Konfigurasi parameter tes fisik, satuan ukur, arah penilaian, dan ambang batas norma (Grade A–D).",
    description:
      "Halaman ini digunakan untuk mengelola daftar item tes fisik dan standar acuan norma benchmark (Grade A-D) sebagai dasar kalkulasi scoring dan radar chart.",
    sections: [
      {
        title: "Apa yang Bisa Anda Lakukan?",
        bullets: [
          "Menambahkan Item Tes baru pada komponen fisik apa pun (termasuk Koordinasi).",
          "Mengatur dan mengubah angka threshold grade (A, B, C, D) pada benchmark yang ada.",
          "Menambahkan bracket acuan khusus berdasarkan usia dan jenis kelamin atlet.",
          "Menonaktifkan item tes yang sudah tidak digunakan.",
          "Memilih arah penilaian skor (Tinggi = Baik vs Rendah = Baik) dan tipe pengukuran.",
        ],
      },
      {
        title: "Cara Melakukan Sesuatu",
        steps: [
          "Penambahan Parameter Tes Baru: Tombol '+ Tambah Item Tes' pada komponen fisik membuka form penentuan nama tes, satuan ukur, tipe tes, urutan, dan arah kalkulasi nilai.",
          "Pengaturan Item Tes Koordinasi: Kartu komponen 'Koordinasi' mendukung penambahan parameter ketangkasan koordinatif (seperti wall toss atau reaksi gerak) sesuai spesialisasi cabor.",
          "Penyesuaian Ambang Batas Nilai: Ikon pensil 'Edit' pada baris norma memungkinkan pembaruan angka target Grade A, B, C, dan D agar selaras dengan kurikulum kepelatihan.",
          "Penerapan Bracket Usia & Gender: Tombol '+ Tambah Bracket Usia/Gender' memungkinkan Anda membedakan standar norma atlet putra dan putri serta menyesuaikan target menurut rentang usia.",
          "Penonaktifan Item Tes: Ikon tempat sampah menonaktifkan item tes dari formulir penilaian baru, sementara data historis asesmen lama tetap terlindungi secara permanen.",
        ],
      },
      {
        title: "Penjelasan Field & Istilah Penting",
        bullets: [
          "Physical Component: 8 pilar kemampuan fisik standar (Fleksibilitas, Kecepatan, Power, Kelincahan, Daya Tahan Otot, Daya Tahan Anaerobik, Daya Tahan Aerobik, dan Koordinasi).",
          "Score Direction (Arah Nilai): 'Tinggi = Baik' berarti semakin besar angka capaian atlet semakin baik (contoh: Vertical Jump dalam CM). 'Rendah = Baik' berarti semakin kecil angka waktu tempuh semakin baik (contoh: Sprint 20m dalam Detik).",
          "Threshold A (Sangat Baik): Target standar emas. Jika atlet mencapai nilai ini, skor otomatis 100% dan GAP adalah 0%.",
          "Threshold B (Baik): Batas performa kompeten menengah ke atas.",
          "Threshold C (Cukup): Batas performa rata-rata atletik standar.",
          "Threshold D (Kurang): Ambang batas minimum sebelum atlet dinyatakan membutuhkan pembinaan khusus.",
          "Bracket Usia/Gender: Pengelompokan acuan norma agar perbandingan adil dan sesuai dengan tahapan biologis atlet.",
        ],
      },
    ],
    roleNotes: [
      {
        role: "admin",
        note: "Sebagai Admin, Anda memiliki hak penuh untuk menambah item tes baru, mengubah ambang batas benchmark, serta mengatur norma bracket usia/gender.",
      },
      {
        role: "head_coach",
        note: "Sebagai Head Coach, Anda dapat melihat standar acuan benchmark organisasi yang digunakan saat mengevaluasi atlet.",
      },
      {
        role: "assistant_coach",
        note: "Asisten Pelatih dapat melihat standar nilai acuan ini, namun modifikasi benchmark master dibatasi untuk Admin organisasi.",
      },
    ],
    tips: [
      "Perubahan benchmark di halaman ini hanya memengaruhi asesmen baru di masa depan. Hasil asesmen historis tetap terkunci menggunakan snapshot nilai saat tes disimpan.",
    ],
  },

  "/assessments": {
    id: "assessments",
    title: "Riwayat Asesmen & Evaluasi Fisik",
    badge: "Histori & Arsip",
    subtitle: "Daftar seluruh sesi asesmen fisik atlet yang tersimpan dalam organisasi.",
    description:
      "Halaman ini digunakan untuk melihat, mencari, dan meninjau seluruh riwayat evaluasi fisik atlet lengkap dengan grade, skor agregat, dan profil benchmark yang digunakan.",
    sections: [
      {
        title: "Apa yang Bisa Anda Lakukan?",
        bullets: [
          "Melihat daftar riwayat asesmen fisik atlet lengkap dengan tanggal, grade, dan skor.",
          "Mencari riwayat asesmen berdasarkan nama atlet.",
          "Membuka halaman detail laporan komprehensif asesmen atlet.",
          "Memulai asesmen fisik baru untuk atlet individu.",
          "Memulai asesmen massal untuk satu tim sekaligus (Penilaian Squad).",
        ],
      },
      {
        title: "Cara Melakukan Sesuatu",
        steps: [
          "Peninjauan Rapor Hasil Asesmen: Tombol 'Detail' atau tanda panah kanan pada baris riwayat membuka analisis komprehensif, grafik radar fisik, dan dokumen cetak rapor.",
          "Pencarian Riwayat Atlet: Kotak pencarian di bagian atas tabel memungkinkan penyaringan riwayat pengujian atlet secara instan berdasarkan nama.",
          "Pelaksanaan Asesmen Baru: Tombol biru '+ Assessment Baru' di sudut kanan atas header membuka formulir wizard 4 langkah untuk pengujian atlet individu secara terarah.",
          "Penilaian Massal di Lapangan (Squad): Tombol 'Penilaian Squad' menyajikan lembar kerja matriks lapangan guna menginput nilai tes seluruh skuad sekaligus dalam satu sesi.",
        ],
      },
      {
        title: "Penjelasan Field & Mode Evaluasi",
        bullets: [
          "Mode Benchmark: Penilaian fisik di mana capaian atlet dibandingkan terhadap target acuan norma (menghasilkan persentase GAP dan Grade).",
          "Mode Progress: Penilaian fisik yang berfokus membandingkan peningkatan angka riil atlet terhadap sesi tes baseline sebelumnya.",
          "Standar Benchmark: Menampilkan nama profil acuan norma yang disnapshot saat asesmen disimpan (tidak berubah walau master benchmark diedit).",
          "Skor Agregat & Grade: Skor komprehensif (0–100%) dan predikat huruf (A, B+, B, C+, C, D) yang mewakili kondisi kebugaran atlet.",
        ],
      },
    ],
    roleNotes: [
      {
        role: "head_coach",
        note: "Sebagai Head Coach, Anda dapat membuka detail asesmen untuk mengunduh laporan PDF resmi atau membagikannya kepada orang tua atlet.",
      },
      {
        role: "assistant_coach",
        note: "Sebagai Asisten Pelatih, Anda dapat mencatat asesmen baru di lapangan, namun hak menghapus rekaman riwayat asesmen dibatasi.",
      },
    ],
    tips: [
      "Gunakan fitur 'Penilaian Squad' jika Anda sedang menguji banyak atlet sekaligus di lapangan untuk menghemat waktu input data.",
    ],
  },

  "/assessments/new": {
    id: "assessments-new",
    title: "Pelaksanaan Asesmen Baru",
    badge: "Formulir Wizard",
    subtitle: "Alur pencatatan hasil tes fisik atlet secara terstruktur dan terstandar.",
    description:
      "Halaman ini adalah formulir wizard untuk memilih atlet, menentukan profil acuan benchmark yang sesuai, dan menginput hasil pengukuran tes fisik di lapangan.",
    sections: [
      {
        title: "Apa yang Bisa Anda Lakukan?",
        bullets: [
          "Memilih atlet yang akan dievaluasi dari direktori atlet aktif.",
          "Memilih Benchmark Profile yang paling cocok berdasarkan cabang olahraga, kelompok usia, dan gender atlet.",
          "Menginput angka hasil pengukuran tes fisik menggunakan slider horizontal atau keyboard.",
          "Melihat kalkulasi skor, grade, dan radar preview secara live saat data diinput.",
          "Menyimpan asesmen dan langsung lanjut menguji atlet berikutnya tanpa bolak-balik.",
        ],
      },
      {
        title: "Langkah-Langkah Pelaksanaan Asesmen",
        steps: [
          "Langkah 1 — Pilih Atlet: Pada tab 'Individu', klik kartu nama atlet yang akan diuji dari daftar atlet aktif organisasi. (Atau beralih ke tab 'Matriks Squad' jika ingin input massal).",
          "Langkah 2 — Pilih Benchmark Profile: Tinjau kartu profil benchmark yang tersedia. Pilih profil bertanda bintang hijau 'Rekomendasi Terbaik' yang paling sesuai dengan cabang olahraga dan usia atlet, lalu klik 'Pilih Profil Ini' (atau klik 'Gunakan Acuan Standar' untuk default).",
          "Langkah 3 — Isi Formulir Pengukuran (Wizard): Masukkan angka capaian atlet pada tab komponen fisik. Anda dapat menggeser slider atau mengetik angka langsung di kotak input. Tekan tombol Enter pada keyboard untuk otomatis pindah ke item berikutnya.",
          "Langkah 4 — Simpan Hasil Asesmen: Periksa panel 'Live Preview' di sisi kanan untuk memastikan skor dan grade. Terakhir, klik 'Selesai & Simpan Analisis' untuk mengunci hasil dan membuka rapor detail.",
        ],
      },
      {
        title: "Penjelasan Field & Fitur Pintar Wizard",
        bullets: [
          "Raw Value: Angka riil hasil pengukuran di lapangan (contoh: 45 CM, 3.2 Detik, 35 Repetisi).",
          "Benchmark Profile: Kumpulan standar norma acuan yang dispesifikasikan untuk cabang olahraga atau kelompok umur tertentu.",
          "Live Engine Preview: Panel interaktif di sisi kanan yang langsung menghitung estimasi skor agregat, grade, dan bentuk radar chart tanpa reload.",
          "Delta vs Lalu: Indikator selisih angka otomatis dibanding sesi tes sebelumnya (contoh: '+2.5 CM Meningkat' / 'Menurun').",
          "Simpan & Lanjut: Tombol khusus untuk pelatih lapangan agar bisa langsung berpindah ke atlet berikutnya tanpa kembali ke halaman awal.",
        ],
      },
    ],
    roleNotes: [
      {
        role: "admin",
        note: "Sebagai Admin atau Head Coach, Anda bebas memilih profil benchmark apa pun atau melewati pemilihan untuk memakai acuan default.",
      },
      {
        role: "assistant_coach",
        note: "Sebagai Asisten Pelatih, Anda dapat mengisi nilai tes fisik di lapangan dengan cepat menggunakan tombol navigasi Enter antar item tes.",
      },
    ],
    tips: [
      "Anda tidak diwajibkan mengisi seluruh item tes sekaligus; asesmen parsial tetap valid dan dapat disimpan dengan kalkulasi yang akurat.",
      "Gunakan tombol Enter saat mengetik angka untuk berpindah ke item tes berikutnya secara cepat saat berada di lapangan.",
    ],
  },

  "/assessments/[id]": {
    id: "assessment-detail",
    title: "Detail Hasil & Analisis Asesmen",
    badge: "Laporan Komprehensif",
    subtitle: "Evaluasi mendalam performa atlet, radar fisik, deviasi GAP, dan ekspor laporan PDF.",
    description:
      "Halaman ini menyajikan rapor komprehensif hasil tes fisik atlet pada sesi tertentu, mencakup radar chart keseimbangan fisik, kalkulasi GAP terhadap standar emas, dan dokumen cetak resmi.",
    sections: [
      {
        title: "Apa yang Bisa Anda Lakukan?",
        bullets: [
          "Memeriksa skor keseluruhan, predikat grade, dan grafik radar profil fisik atlet.",
          "Mengidentifikasi kelemahan fisik atlet melalui kolom GAP (%).",
          "Membandingkan hasil tes atlet terhadap standar acuan target Threshold A.",
          "Mengunduh rapor resmi dalam format PDF berlogo organisasi.",
          "Mengedit catatan rekomendasi pelatih dan menetapkan target cepat (Quick Goal).",
          "Menghapus rekaman asesmen jika terjadi kesalahan input (khusus Admin & Head Coach).",
        ],
      },
      {
        title: "Cara Melakukan Sesuatu",
        steps: [
          "Interpretasi Rapor & Keseimbangan Fisik: Kartu 'Skor Assessment Keseluruhan' dan Grade A–D merangkum status kebugaran, sedangkan grafik Radar Profil Fisik memperlihatkan simetri perkembangan kapasitas fisik.",
          "Identifikasi Komponen Butuh Perhatian: Panel 'Komponen Butuh Perhatian' dan angka minus pada kolom 'GAP (%)' memetakan aspek fisik yang berada di bawah target acuan emas.",
          "Standar Target Acuan: Kolom 'Target Benchmark (A)' menampilkan acuan standar emas yang disnapshot saat sesi tes disimpan sebagai tolok ukur objektif.",
          "Penerbitan Dokumen Resmi (PDF): Tombol 'Export PDF' di sudut kanan atas menghasilkan dokumen rapor cetak resmi berlogo organisasi yang siap dibagikan ke orang tua.",
          "Penghapusan Rekaman Asesmen: Jika terjadi kekeliruan data lapangan, tombol 'Hapus Assessment' memungkinkan penghapusan aman dengan konfirmasi ganda (khusus Admin & Head Coach).",
        ],
      },
      {
        title: "Penjelasan Field & Metrik Analisis",
        bullets: [
          "Overall Score (%): Nilai rata-rata tertimbang dari seluruh item tes yang telah diuji (skala 0–100%).",
          "GAP (%): Deviasi capaian atlet terhadap target Threshold A. Jika atlet mencapai atau melebihi target, skor adalah 100% dan GAP adalah 0%.",
          "Radar Profil Fisik: Visualisasi jaring laba-laba untuk mendeteksi apakah kebugaran atlet seimbang atau timpang di aspek tertentu.",
          "Rekomendasi Pelatih: Catatan diagnostik terarah mengenai fokus latihan yang perlu ditingkatkan pada siklus latihan berikutnya.",
        ],
      },
    ],
    roleNotes: [
      {
        role: "admin",
        note: "Tombol 'Hapus Assessment' hanya aktif untuk Admin dan Head Coach dengan konfirmasi transaksional ganda untuk mencegah kehilangan data.",
      },
      {
        role: "assistant_coach",
        note: "Asisten Pelatih dapat meninjau rapor dan grafik hasil evaluasi, namun aksi penghapusan asesmen dibatasi untuk manajemen tim.",
      },
    ],
    tips: [
      "Target benchmark pada halaman ini bersifat permanen karena disnapshot saat tes disimpan. Modifikasi acuan benchmark di masa depan tidak akan mengubah rapor ini.",
    ],
  },

  "/reports": {
    id: "reports",
    title: "Pusat Laporan & Analitik Organisasi",
    badge: "Pelaporan & Ekspor",
    subtitle: "Ringkasan metrik performa makro organisasi, distribusi grade atlet, dan ekspor data.",
    description:
      "Halaman ini digunakan untuk menganalisis sebaran performa fisik makro organisasi, mengevaluasi rata-rata kemampuan atlet, dan mengekspor data rekapitulasi ke format CSV/PDF.",
    sections: [
      {
        title: "Apa yang Bisa Anda Lakukan?",
        bullets: [
          "Meninjau statistik performa makro organisasi (total asesmen, rata-rata skor, grade dominan, atlet aktif).",
          "Melihat grafik distribusi grade performa seluruh atlet binaan.",
          "Menganalisis grafik rata-rata skor per komponen fisik (Kelenturan, Kecepatan, Daya Ledak, dll).",
          "Mengekspor seluruh rekapitulasi data asesmen ke berkas CSV (Excel).",
          "Mengekspor log kehadiran dan volume sesi latihan ke berkas CSV.",
          "Mengunduh PDF rapor individual atau membagikan pesan ringkasan via WhatsApp.",
        ],
      },
      {
        title: "Cara Melakukan Sesuatu",
        steps: [
          "Evaluasi Kebugaran Skuad Kolektif: Kartu ringkasan utama dan diagram 'Distribusi Grade' memberikan gambaran menyeluruh tentang sebaran predikat fisik tim pada periode berjalan.",
          "Penentuan Prioritas Siklus Latihan: Grafik 'Rata-rata Skor per Komponen Fisik' menyoroti komponen dengan capaian terendah sebagai fokus perbaikan pada program tim berikutnya.",
          "Ekspor Data Tabular untuk Analisis: Tombol 'Export CSV Assessment' dan 'Export CSV Sesi' mengunduh seluruh rekapitulasi ke lembar kerja Excel untuk arsip dan evaluasi kepelatihan.",
          "Penyampaian Rapor ke Orang Tua: Tabel laporan menyediakan tombol unduh PDF resmi serta tombol WhatsApp untuk mengirimkan ringkasan perkembangan langsung ke wali murid.",
        ],
      },
      {
        title: "Penjelasan Metrik & Format Laporan",
        bullets: [
          "Rata-rata Skor Organisasi: Indeks kebugaran rata-rata gabungan dari seluruh atlet aktif yang pernah diasesmen.",
          "Distribusi Grade: Proporsi persentase atlet yang meraih predikat Sangat Baik (A), Baik (B), Cukup (C), atau Kurang (D).",
          "Export CSV: Format data mentah tabel yang kompatibel langsung dengan Microsoft Excel, Google Sheets, atau aplikasi pengolah data statistik.",
        ],
      },
    ],
    roleNotes: [
      {
        role: "admin",
        note: "Sebagai Admin, Anda dapat memanfaatkan ekspor data CSV untuk laporan pertanggungjawaban manajemen klub dan pengarsipan tahunan.",
      },
      {
        role: "head_coach",
        note: "Sebagai Head Coach, gunakan analisis rata-rata komponen untuk merancang tema periodisasi latihan tim pada bulan berikutnya.",
      },
    ],
    tips: [
      "Gunakan tombol 'Export CSV' secara berkala di akhir bulan untuk mengarsipkan data perkembangan fisik seluruh skuad.",
    ],
  },

  "/progress": {
    id: "progress",
    title: "Tren Progres & Garis Waktu Atlet",
    badge: "Grafik Perkembangan",
    subtitle: "Pemantauan kurva peningkatan fisik atlet antar waktu dari sesi baseline ke sesi terbaru.",
    description:
      "Halaman ini digunakan untuk memantau grafik tren peningkatan kemampuan fisik atlet dari waktu ke waktu (longitudinal) guna mengevaluasi efektivitas program latihan.",
    sections: [
      {
        title: "Apa yang Bisa Anda Lakukan?",
        bullets: [
          "Memilih nama atlet tertentu untuk dianalisis kurva perkembangan fisiknya.",
          "Menyaring rentang periode waktu evaluasi (Semua, 90 Hari, 30 Hari, atau 7 Hari).",
          "Membaca grafik garis tren peningkatan fisik time-series per komponen.",
          "Mengetahui komponen fisik yang mengalami lonjakan kemajuan tertinggi.",
          "Mengidentifikasi komponen fisik yang mengalami penurunan (regresi) atau stagnasi.",
          "Meninjau garis waktu kronologis seluruh sesi asesmen yang pernah dijalani atlet.",
        ],
      },
      {
        title: "Cara Melakukan Sesuatu",
        steps: [
          "Pemilihan Profil Atlet: Pilih nama atlet dari daftar pemilih dropdown di bagian atas untuk memperbarui kurva tren dan statistik kemajuan secara seketika.",
          "Filter Siklus Waktu: Tombol filter rentang waktu di sudut kanan atas memudahkan penyesuaian evaluasi menurut mikrosiklus (7–30 hari) maupun makrosiklus (90 hari ke atas).",
          "Interpretasi Kurva Tren: Garis grafik yang bergerak menanjak mencerminkan adaptasi positif terhadap latihan, sementara garis mendatar atau menurun menandakan perlunya penyesuaian beban pemulihan.",
          "Analisis Lonjakan & Regresi: Panel 'Lonjakan Paling Menonjol' menampilkan komponen dengan lonjakan skor tertinggi, sedangkan kartu 'Evaluasi Regresi' mendeteksi area yang membutuhkan pemulihan.",
        ],
      },
      {
        title: "Penjelasan Metrik Progres",
        bullets: [
          "Baseline: Sesi asesmen pertama atlet yang dijadikan titik acuan awal (titik nol) untuk mengukur seluruh kemajuan berikutnya.",
          "Delta (%): Persentase perubahan nilai antara sesi tes terbaru terhadap baseline atau sesi tes sebelumnya.",
          "Garis Waktu Asesmen: Rekam jejak kronologis yang mencatat tanggal, pelatih penguji, dan skor di setiap sesi tes.",
        ],
      },
    ],
    roleNotes: [
      {
        role: "head_coach",
        note: "Head Coach dapat menggunakan kurva tren ini saat berdiskusi dengan atlet dan orang tua mengenai efektivitas program latihan.",
      },
      {
        role: "assistant_coach",
        note: "Asisten Pelatih dapat memeriksa apakah beban latihan harian di lapangan berhasil mendorong kenaikan kurva kebugaran atlet.",
      },
    ],
    tips: [
      "Kurva progres yang melandai atau menurun tajam sering kali merupakan tanda awal overtraining atau kejenuhan fisik pada atlet.",
    ],
  },

  "/compare": {
    id: "compare",
    title: "Komparasi Atlet & Analisis Komparatif",
    badge: "Analisis Multi-Atlet",
    subtitle: "Bandingkan profil fisik 2–4 atlet atau evaluasi lompatan progres 1 atlet antar sesi.",
    description:
      "Halaman ini digunakan untuk membandingkan profil kemampuan fisik antar 2–4 atlet secara objektif, atau mengevaluasi lonjakan perkembangan satu atlet dari dua sesi berbeda.",
    sections: [
      {
        title: "Apa yang Bisa Anda Lakukan?",
        bullets: [
          "Membandingkan profil fisik 2 hingga 4 atlet sekaligus (Mode Komparasi Skuad).",
          "Membandingkan 2 tanggal sesi asesmen dari atlet yang sama (Mode Analisis Longitudinal).",
          "Melihat visualisasi grafik radar bertumpuk (multi-radar overlay) lintas profil.",
          "Menganalisis tabel perbandingan metrik fisik side-by-side untuk melihat keunggulan relatif.",
        ],
      },
      {
        title: "Cara Melakukan Sesuatu",
        steps: [
          "Komparasi Antar-Atlet Skuad: Pada tab 'Komparasi Skuad', pilih 2 hingga 4 atlet untuk menampilkan perbandingan jaring multi-radar dan tabel selisih angka riil tiap parameter fisik.",
          "Analisis Longitudinal Satu Atlet: Pada tab 'Analisis Longitudinal', pilih atlet dan tentukan dua sesi pengujian berbeda untuk mengevaluasi lompatan adaptasi fisik secara presisi.",
          "Pembacaan Grafik Multi-Radar: Garis warna yang berbeda mewakili tiap profil atau sesi. Semakin luas jaring warna mencakup sisi luar diagram, semakin tinggi skor kebugaran pada aspek tersebut.",
        ],
      },
      {
        title: "Tujuan & Interpretasi Komparasi",
        bullets: [
          "Bukan Untuk Menghakimi: Modul komparasi dirancang untuk evaluasi objektif, bukan menjatuhkan atlet.",
          "Penentuan Posisi Bermain: Membantu pelatih menentukan penempatan posisi bertanding yang paling sesuai berdasarkan keunggulan spesifik (contoh: daya tahan vs kecepatan).",
          "Penentuan Sparring Partner: Membantu pelatih memasangkan atlet dengan lawan latihan yang memiliki profil fisik saling melengkapi.",
        ],
      },
    ],
    roleNotes: [
      {
        role: "head_coach",
        note: "Gunakan komparasi multi-radar ini sebagai pertimbangan objektif dalam seleksi skuad utama dan penentuan strategi tim.",
      },
      {
        role: "assistant_coach",
        note: "Asisten Pelatih dapat menggunakan data perbandingan ini untuk memberikan drill latihan khusus pada atlet yang tertinggal di aspek tertentu.",
      },
    ],
    tips: [
      "Mode Komparasi Skuad sangat efektif saat pelatih bingung menentukan 2 pemain cadangan dengan karakteristik fisik yang berbeda.",
    ],
  },
};

export const DEFAULT_FALLBACK_HELP: HelpArticle = {
  id: "general-help",
  title: "Pusat Bantuan & Panduan Sistem",
  badge: "Bantuan Umum",
  subtitle: "Panduan navigasi dan penggunaan platform performa atletik Kinetiq.",
  description:
    "Halaman ini menyediakan panduan cepat mengenai navigasi dan fitur utama sistem kepelatihan dan performa atletik Kinetiq.",
  sections: [
    {
      title: "Apa yang Bisa Anda Lakukan?",
      bullets: [
        "Mengakses modul operasional utama melalui bilah navigasi di sebelah kiri.",
        "Menggunakan pintasan Ctrl+K untuk mencari nama atlet, sesi, atau fitur dengan cepat.",
        "Menekan tombol '?' di bilah atas pada halaman mana pun untuk membuka panduan kontekstual yang relevan.",
      ],
    },
    {
      title: "Navigasi Menu Utama",
      bullets: [
        "Dashboard: Pusat kendali operasional, sesi latihan harian, dan peringatan evaluasi berkala.",
        "Atlet: Direktori biodata atlet, nomor punggung, posisi bermain, dan kontak wali murid.",
        "Asesmen: Evaluasi berkala, tes fisik wizard, dan riwayat rapor komprehensif atlet.",
        "Jadwal & Sesi: Kalender sesi latihan, pencatatan absensi lapangan, dan beban RPE atlet.",
        "Laporan: Cetak dokumen PDF rapor resmi berlogo klub dan ekspor data ke Excel (CSV).",
      ],
    },
    {
      title: "Butuh Bantuan Lebih Lanjut?",
      description:
        "Jika Anda mengalami kendala teknis atau memiliki pertanyaan mengenai standardisasi acuan benchmark organisasi, silakan hubungi tim Administrator organisasi Anda.",
    },
  ],
  tips: [
    "Ikon tanda tanya '?' di bilah atas akan selalu menyajikan panduan yang relevan dengan halaman apa pun yang sedang Anda buka.",
  ],
};
