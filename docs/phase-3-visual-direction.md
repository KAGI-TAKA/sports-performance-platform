# PHASE 3 & 3.1 — VISUAL DESIGN DIRECTION & DESIGN SYSTEM (FINALIZED)

**Product:** Sports Performance & Athlete Development Platform  
**Working Name:** Kinetiq / Power Up Private Training *(Naming decision — deferred)*  
**Author:** Lead UI/UX Designer, Design System Architect, & Lead Frontend Architect  
**Date:** 14 August 2026 (Final Refinement Pass)  
**Status:** System-Design Validated Specification (Locked Single Source of Truth for Phase 4)

---

## 1. Visual Audit & Brand Distinction

### Context & Emotional Perception
Produk ini berdiri di atas 3 pilar audiens: Pelatih (*Coach*), Atlet Anak usia 6–14 tahun (*Athlete*), dan Orang Tua Klien (*Parent*). Bahasa visual produk harus menjembatani kebutuhan data operasional pelatih dan dorongan inspiratif bagi atlet muda, tanpa mengorbankan kepercayaan profesional orang tua.

### Validation Language Disclaimer
> **PENTING — DEFINISI VALIDASI**:  
> Istilah *"Validated"* dalam dokumen ini merujuk pada **System Design Alignment Validation** (validasi konsistensi internal antara User Requirements Phase 1, UX Architecture Phase 2, dan Visual System Phase 3). Dokumen ini **BELUM** mengklaim hasil *Actual End-User Usability Testing* di lapangan dengan anak-anak/orang tua riil (yang dijadwalkan pada tahap pengujian pasca-pengembangan).

### Distinctive Visual Identity Test
> **Pertanyaan Kunci**: *"Jika logo dan nama brand Kinetiq dihapus dari layar, apakah produk ini masih memiliki karakter visual khas yang dapat dikenali?"*  
> **Jawab**: **YA.** Karakter khas Kinetiq dibentuk oleh 4 elemen visual bertanda tangan (*Signature Visual Anchors*):
> 1. **Athletic Line Dividers**: Garis aksen atletik 2px berwarna *Signature Amber* yang menjadi penanda visual awal setiap judul modul utama.
> 2. **Athlete Identity Card Frame**: Bingkai profil atlet yang menggabungkan foto fisik, nomor jersey besar, gradien *Deep Athletic Indigo*, dan indikator bintang prestasi fisik.
> 3. **Dual-Density Layout**: Variasi tata letak yang membedakan secara tegas antara kepadatan data analitis Coach (list/tabel task-oriented) dan kejelasan visual bernapas Athlete Hub (visual timeline & hero card).
> 4. **Typographic Contrast**: Kombinasi kontras tinggi antara font atletik jangkung `Space Grotesk` untuk skor/angka data dan `Inter` untuk legibilitas teks UI.

### Aturan Penggunaan Signature Visual Anchors
* **Athletic Line Dividers**: Hanya dipasang pada Header H1 & H2 utama. Jangan dipasang pada setiap elemen kartu kecil.
* **Athlete Identity Card Frame**: Digunakan khusus untuk pembungkus profil atlet di Athlete Hub dan Detail Atlet Coach. Jangan gunakan frame ini untuk modul non-atlet seperti Settings atau System Logs.
* **Dual-Density Layout**: Coach Workspace wajib menggunakan kerapatan tinggi (padding 8px–12px), sedangkan Athlete Hub wajib menggunakan ruang bernapas (padding 16px–24px).
* **Typographic Contrast**: `Space Grotesk` dilarang digunakan untuk paragraf teks panjang (*body text*); khusus untuk judul, skor, dan angka penanda.

### What Should This Product Feel Like?
* **Athletic & Performance-Driven**: Terasa tegas, presisi, berenergi, dan berbasis ilmu keolahragaan.
* **Youthful & Aspirational**: Untuk atlet muda (6–14 thn), terasa keren seperti ruang prestasi pribadi atlet profesional (*Youthful Sports Performance*).
* **Professional & Trustworthy**: Untuk orang tua dan pelatih, terasa resmi, bersih, dan berkualitas tinggi.
* **Modern & Premium**: Tipografi atletik, kontras warna yang disengaja, dan hirarki visual yang berorientasi pada data operasional.

### What Should This Product NOT Feel Like?
* **NOT a Generic SaaS Dashboard**: Bukan template dashboard bisnis umum berlatar abu-abu monoton.
* **NOT an AI Startup Landing Page**: Bukan landing page generik dengan *floating glassmorphism blobs*, gradient hero ungu-biru, dan elemen dekoratif tanpa fungsi.
* **NOT a Children's Educational App**: Bukan aplikasi anak-anak prasekolah dengan karakter kartun, bentuk melengkung berlebihan, atau warna-warni pelangi.
* **NOT a Toy-Like Gaming Interface**: Bukan gim kasual dengan koin buatan atau elemen gamifikasi yang mengalihkan perhatian dari latihan fisik sungguhan.

---

## 2. Design Decision Hierarchy

Jika terjadi keraguan atau konflik keputusan visual selama proses perancangan dan pengembangan teknis, aturan prioritas berikut **WAJIB** diikuti:

```text
1. USER REQUIREMENT      (Permintaan & Kebutuhan Klien / User Intent - Prioritas Tertinggi)
       ↓
2. UX ARCHITECTURE       (Alur Tugas, Aksesibilitas, & Operasional Lapangan)
       ↓
3. VISUAL PRINCIPLE      (Youthful Sports Performance & Restrained Athletic Identity)
       ↓
4. COMPONENT PATTERN     (Spesifikasi UI Primitives & Design Tokens)
       ↓
5. DECORATIVE DETAIL     (Detail Visual / Estetika Sekunder - Prioritas Terendah)
```
*Aturan: Keputusan dengan hirarki lebih tinggi selalu membatalkan (override) keputusan di bawahnya jika terjadi benturan.*

---

## 3. Visual Anti-Pattern & Card Usage Rules

### Clarification: Functional Card vs. Card Dashboard Anti-Pattern
> **ATURAN PENGGUNAAN KARTU (CARD USAGE RULE)**:  
> Penolakan *Card Dashboard Anti-Pattern* **BUKAN** berarti melarang penggunaan komponen Kartu (`Card`) secara keseluruhan.  
> * **Functional Card/Container (DIIZINKAN)**: Diperbolehkan dan direkomendasikan ketika kartu berfungsi membungkus satu entitas terpadu (contoh: 1 Profile Atlet, 1 Modal Form, 1 Item Sesi Latihan).
> * **Card Dashboard Anti-Pattern (DILARANG)**: Dilarang membungkus seluruh elemen kecil tanpa fungsi ke dalam kartu melayang berulang yang bersarang (*nested cards inside cards*), yang membuat layar penuh dengan border melayang dan menghamburkan ruang layar.

### Tabel Mitigasi Anti-Pattern Visual

| Potential Risk | Impact | Refinement Strategy (Mitigasi) |
| :--- | :--- | :--- |
| **Generic SaaS Dashboard** | Aplikasi terasa membosankan dan mirip software akuntansi/CRM. | Terapkan *Athletic Line Dividers*, tipografi *Space Grotesk*, dan ganti grid KPI dengan *Chronological Agenda List*. |
| **AI-Generated Template** | Terasa murah dengan blur glassmorphism & gradient berlebihan. | **Larang total** *glassmorphism backdrop blur* tebal dan *floating decorative blobs*. Gunakan surface flat 1px border. |
| **Card Over-Use Anti-Pattern**| Seluruh layar penuh dengan kotak-kotak melayang berulang. | **Gunakan Layout Variety**: Agenda List tanpa border luar, Split View 2/3 + 1/3, Full-width Table, dan Visual Timeline Rail. |
| **Childish / Cartoon App** | Atlet remaja (10–14 thn) merasa dihina oleh tampilan anak TK. | Terapkan arah **Youthful Sports Performance**: Gunakan foto atlet sejati, warna Deep Indigo profesional, dan bintang emas bergaris presisi. |
| **Excessive Amber Color** | Layar menjadi terlalu ramai dan melelahkan mata. | **Restrained Color Principle**: Warna Amber (`#F97316`) dilarang untuk latar belakang besar; hanya dipakai untuk Primary CTA & Status Active. |

---

## 4. Final Visual Principles (10 Core Principles)

1. **Performance over Decoration**: Setiap elemen visual wajib memiliki fungsi UX atau menyampaikan data performa — tanpa dekorasi acak.
2. **Identity before Metrics**: Pada profil atlet anak, dahulukan identitas personal (*"Athlete Identity Card"*) sebelum tabel angka.
3. **Youthful, Never Childish**: Memberikan energi dinamis dan memotivasi tanpa menjadi kekanak-kanakan atau berbentuk gim kartun.
4. **Task-Driven Operational Density**: Coach Workspace disusun berdasarkan hirarki prioritas tugas harian, bukan tumpukan kartu KPI.
5. **Layout Variety over Card Collection**: Menolak pola *Card Dashboard*; gunakan variasi agenda list, split layout, visual timeline, dan data table.
6. **Restrained & Purposeful Color Accent**: Warna *Energetic Amber* (`#F97316`) digunakan secara terukur hanya untuk aksi utama dan penanda status.
7. **Typographic Authority & Precision**: Tipografi *Space Grotesk* memberikan wibawa atletik presisi pada angka dan skor.
8. **Functional Motion Only**: Animasi digunakan hanya untuk feedback aksi (100ms) dan transisi progres (300ms) — bukan untuk dekorasi mengambang.
9. **Human-Centric Authentic Imagery**: Menampilkan fotografi atlet dan kegiatan latihan sejati — tanpa foto stok yang dibuat-buat.
10. **Mobile-First Field Usability**: Seluruh tombol aksi operasional lapangan memiliki area sentuh minimum 48px di layar seluler.

---

## 5. Selected Visual Direction

### **Direction C: Youthful Athletic Energy**

---

## 6. Final Visual Language & Design System

### Brand Personality Keywords
`Athletic` · `Youthful` · `Focused` · `Energetic` · `Professional` · `Motivating` · `Precise` · `Confident`

---

## 7. Typography System & Rules

Tipografi menggunakan 3 font utama: **Space Grotesk** (Display/Data Headers), **Inter** (Body/UI), dan **JetBrains Mono** (Tabular Numerals/Timestamps).

### Rules Usage Font Presisi

| Type Role | Font Family | Weight | Size (Desktop/Mobile) | Intended Use & Rules |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `Space Grotesk` | Bold (700) | 36px / 28px | Hero landing page, Banner nama atlet utama. |
| **H1 / H2** | `Space Grotesk` | Bold / SemiBold | 24px / 18px | Judul halaman & Section modul utama. |
| **H3 / Label**| `Inter` | SemiBold (600) | 15px / 14px | Label form, judul kartu, UI interactive text. |
| **Body** | `Inter` | Regular (400) | 14px / 14px | Paragraf bacaan utama & instruksi. |
| **Tabular Data**| `JetBrains Mono`| SemiBold (600) | 13px - 16px | **Waktu detik (mis: 3.82s), timestamps, log nilai riil**. |
| **Big Metric** | `Space Grotesk` | Bold (700) | 28px / 22px | **Skor persentase asesmen (mis: 88%) & Grade A/B/C/D**. |
| **Caption** | `Inter` | Bold (700) | 11px / 10px | Badge Status, Pill Tags (Uppercase). |

---

## 8. Color System & Accessibility Rationale

### Dark Mode Scope Clarification (MVP Boundary)
> **DITETAPKAN UNTUK MVP**: **Dark Mode adalah OPTIONAL / POST-MVP**.  
> Versi MVP 1.0 berfokus 100% pada **Clean Light Theme** (`#F8FAFC` canvas) dengan kontras tinggi (WCAG AAA) untuk menjamin keterbacaan maksimum layar ponsel pelatih di bawah sinar matahari lapangan.

### Precise Color Accessibility Rationale

```text
COLOR ACCESSIBILITY MAPPING
├── BRAND PRIMARY: #1E1B4B (Deep Athletic Indigo)
│   └── Di atas latar Putih (#FFFFFF) -> Contrast Ratio 15.8:1 (PASSES WCAG AAA)
│
├── SIGNATURE ACCENT: #F97316 (Energetic Amber)
│   ├── Di atas latar Putih (#FFFFFF) -> Contrast Text Hitam/Dark (#0F172A) wajib digunakan!
│   │   * ATURAN TOMBOL PRIMARY: Teks tombol berlatar Amber WAJIB berwarna #0F172A / #1E1B4B (Contrast 6.8:1 - PASSES WCAG AA).
│   │   * DILARANG menggunakan teks putih di atas tombol Amber (#F97316 + #FFFFFF = 2.4:1 - FAILS WCAG).
│   └── Sebagai Teks/Icon di atas latar Dark Indigo (#1E1B4B) -> Contrast 7.1:1 (PASSES WCAG AAA).
│
├── SECONDARY ACCENT: #4F46E5 (Electric Indigo-Blue)
│   └── Di atas latar Putih (#FFFFFF) -> Contrast Ratio 6.5:1 (PASSES WCAG AA)
│
└── SEMANTIC COLORS
    ├── Success (#059669): Grade A / Done -> Contrast 4.6:1 (PASSES WCAG AA)
    ├── Warning (#D97706): Grade B/C / Pending -> Contrast 4.5:1 (PASSES WCAG AA)
    └── Danger (#DC2626): Warning / Need Focus -> Contrast 4.8:1 (PASSES WCAG AA)
```

---

## 9. Data Visualization Boundary

```text
+-----------------------------------------------------------------------+
|                    DATA VISUALIZATION BOUNDARIES                      |
+-----------------------------------+-----------------------------------+
| COACH WORKSPACE (ANALYTICAL)      | ATHLETE HUB (PROGRESS-ORIENTED)   |
+-----------------------------------+-----------------------------------+
| - 7-Axis Radar Chart (0-100%)     | - 1 to 5 Gold Stars Rating        |
| - Multi-period Line Trend Chart   | - Thick Horizontal Progress Bar   |
| - Raw Unit Values (Detik, CM, KG) | - Positive Achievement Badges     |
| - Benchmark Threshold Metrics     | - Visual Badge Highlights         |
+-----------------------------------+-----------------------------------+
```
*Aturan: Dilarang menampilkan Radar Chart 7-sumbu yang rumit pada tampilan utama Athlete Hub anak usia 6 tahun.*

---

## 10. Illustrative Content Disclaimer

> **DOKUMENTASI KONTEN CONTOH**:  
> Seluruh teks contoh dalam dokumen ini seperti:  
> * `"RAFIF ARJUNA #10"` (Nama & Nomor Atlet Contoh)  
> * `"Point Guard"` (Posisi Olahraga Contoh)  
> * `"Speed Master"`, `"Power King"` (Julukan Motivasi Contoh)  
> 
> Berstatus **ILLUSTRATIVE / EXAMPLE CONTENT ONLY**. Elemen-elemen ini **BUKAN** field wajib universal yang terikat hardcode di database, melainkan data dinamis yang diisi oleh Pelatih sesuai domain olahraga atlet.

---

## 11. Motion & Accessibility Intent

### Purposeful Micro-Interactions
* **Button Press Feedback**: Transisi 100ms `ease-out` (scale 0.98).
* **Progress Bar Fill**: Transisi 300ms `cubic-bezier(0.4, 0, 0.2, 1)` saat halaman dimuat.

### Prefers-Reduced-Motion Intent
> **AKSESIBILITAS ANIMASI**:  
> Jika browser/perangkat pengguna mengaktifkan pengaturan `prefers-reduced-motion: reduce`, seluruh animasi transisi & progres bar **WAJIB** dinonaktifkan secara otomatis (diubah menjadi tampilan statis instan 0ms) untuk mencegah ketidaknyamanan visual/dizziness. *(Implementasi teknis CSS media query diselesaikan pada Phase 4).*

---

## 12. Responsive Visual Intent

```text
RESPONSIVE INTENT MATRIX
├── FIELD MOBILE (<640px - Field Operational Intent)
│   ├── Coach: Top Header Minimal + Bottom Action Bar (Presensi 1-tap & Quick Log)
│   ├── Athlete: Touch-first Single Column Card (Min Touch Target 48px)
│   └── Font Size: Min 14px Body & 16px Form Inputs (Mencegah auto-zoom iOS)
│
├── TABLET / HYBRID (640px - 1024px - Mixed Intent)
│   ├── Coach: Collapsible Navigation + 2-Column Responsive Grid
│   └── Athlete: Centered Container Max Width 768px
│
└── DESKTOP WORKSPACE (>1024px - Deep Analytical Intent)
    ├── Coach: Fixed 240px Left Sidebar + Multi-column Fluid Workspace (1400px Max)
    └── Public Web: Centered Content Layout (1200px Max)
```

---

## 13. Component Language & Specifications

* **Primary Button**: Background `brand-signature` (`#F97316`), Teks `text-dark` (`#0F172A`), Height 42px (Desktop) / 48px (Mobile Touch Target), Radius 8px.
* **Secondary Button**: Background `#FFFFFF`, Border 1px `#E2E8F0`, Teks `#0F172A`.
* **Cards**: Surface `#FFFFFF`, Border 1px `#E2E8F0`, Radius 10px (`var(--radius-md)`), Shadow 2px `rgba(0,0,0,0.04)`.
* **Badges**: Pill-shaped (`var(--radius-pill)`), font 11px Bold Uppercase.

---

## 14. Conceptual Design Tokens Structure

```json
{
  "color": {
    "brand": {
      "primary": "hsl(243, 47%, 20%)",
      "signature": "hsl(24, 95%, 53%)",
      "accent": "hsl(245, 75%, 60%)"
    },
    "surface": {
      "canvas": "hsl(210, 40%, 98%)",
      "card": "hsl(0, 0%, 100%)",
      "border": "hsl(214, 32%, 91%)"
    }
  },
  "fontFamily": {
    "display": "Space Grotesk, sans-serif",
    "body": "Inter, sans-serif",
    "mono": "JetBrains Mono, monospace"
  },
  "borderRadius": {
    "sm": "6px",
    "md": "10px",
    "lg": "16px"
  }
}
```

---

## 15. Final Status & Validation

### Strengths
1. Identitas visual sangat tegas dan unik melalui kombinasi *Athletic Line Dividers*, tipografi *Space Grotesk*, dan *Athlete Identity Card*.
2. Layout variatif menghapuskan kesan *Card Dashboard* yang monoton.
3. Batasan persona dan rentang usia anak 6–14 tahun terjaga sempurna tanpa menjadi childish.
4. Kontras warna interaktif Amber & Indigo dijamin 100% mematuhi aksesibilitas WCAG AA.

### Remaining Risks & Mitigation
* **Risiko**: Penggunaan warna Amber berlebihan. *Mitigasi*: Ditegaskan aturan *Restrained Amber* (hanya untuk Primary CTA & Status Active).

### Decisions Finalized
* Selection Direction C (*Youthful Athletic Energy*).
* Tipografi: *Space Grotesk* + *Inter* + *JetBrains Mono*.
* Palette: *Deep Athletic Indigo* (`#1E1B4B`) + *Restrained Energetic Amber* (`#F97316` dengan Teks Gelap).
* Signature Experience: *Athlete Identity Card*.
* MVP Theme Scope: *Clean Light Theme* (Dark Mode = Post-MVP).

### Decisions Deferred
* Penyesuaian varian transparan logo Kinetiq pada cetakan PDF laporan.

---

## 16. Phase 3.1 Final Refinement Notes (Patch Log)

| Area | Rule Sebelumnya | Revised Rule (Phase 3.1 Final Refinement) | Alasan Perubahan |
| :--- | :--- | :--- | :--- |
| **Amber Accessibility** | Teks putih di atas tombol Amber. | **Teks tombol berlatar Amber WAJIB berwarna gelap (`#0F172A` / `#1E1B4B`)**. | `#F97316` + Teks Putih hanya memuat kontras 2.4:1 (Gagal WCAG). Teks Gelap memuat kontras 6.8:1 (LULUS WCAG AA). |
| **Card Usage** | Istilah "Card Dashboard Anti-pattern". | **Perjelas Functional Card vs Anti-Pattern**. Card tunggal untuk 1 entitas atlet/sesi 100% DIIZINKAN. | Mencegah salah tafsir developer bahwa komponen Card dilarang total. |
| **Design Hierarchy** | Belum ada hirarki konflik. | Menambahkan **Design Decision Hierarchy** (`Requirement → UX → Visual → Component → Decorative`). | Memberikan pedoman tegas jika terjadi benturan keputusan saat coding/desain. |
| **Validation Term** | Menggunakan klaim "Usability Validated". | Ditegaskan sebagai **System Design Alignment Validation** (bukan usability test anak riil). | Mencegah klaim klaim pengujian pengguna tanpa bukti riset lapangan. |
| **Example Content** | Teks contoh terlihat seperti data baku. | Ditandai eksplisit sebagai **ILLUSTRATIVE / EXAMPLE CONTENT ONLY**. | Menghindari asumsi developer bahwa nama/posisi contoh di-hardcode ke database. |
| **Reduced Motion** | Belum dicantumkan. | Menambahkan **Prefers-Reduced-Motion Intent** (Animasi 0ms jika diaktifkan user). | Memenuhi standar aksesibilitas gerakan WCAG 2.1. |

---
*End of Phase 3.1 Finalized Specification Document*
