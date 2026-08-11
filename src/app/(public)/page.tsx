import Link from "next/link";

// ─── Atomic logo mark ─────────────────────────────────────────────────────────
function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M11 2 L19 7 L19 15 L11 20 L3 15 L3 7 Z"
        fill="hsl(var(--surface-3))"
        stroke="hsl(var(--border-strong))"
        strokeWidth="1"
      />
      <path
        d="M12.2 5.5 L8.5 12 L11.5 12 L9.8 16.5 L14.5 10 L11.2 10 Z"
        fill="hsl(var(--signature))"
      />
    </svg>
  );
}

// ─── Authentic trainer dashboard — looks like real software ───────────────────
function TrainerView() {
  return (
    <div
      style={{
        border: "1px solid hsl(var(--border-color))",
        borderRadius: "var(--radius-lg)",
        background: "hsl(var(--surface-1))",
        overflow: "hidden",
        fontSize: "0.75rem",
      }}
    >
      {/* App top bar */}
      <div
        style={{
          borderBottom: "1px solid hsl(var(--border-color))",
          padding: "0.625rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "hsl(var(--surface-2))",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <LogoMark size={16} />
          <span style={{ fontWeight: 600, color: "hsl(var(--foreground))", fontSize: "0.6875rem", letterSpacing: "0.02em" }}>
            POWER UP
          </span>
        </div>
        <span style={{ color: "hsl(var(--muted))", fontSize: "0.6875rem" }}>
          Sen, 11 Agt 2026
        </span>
      </div>

      {/* Two-panel layout */}
      <div style={{ display: "flex", minHeight: 340 }}>
        {/* Left: Athlete list */}
        <div
          style={{
            width: 160,
            borderRight: "1px solid hsl(var(--border-color))",
            padding: "0.75rem 0",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: "0 0.75rem",
              marginBottom: "0.5rem",
              fontSize: "0.625rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "hsl(var(--muted))",
              textTransform: "uppercase",
            }}
          >
            Klien Aktif · 18
          </div>
          {[
            { name: "Rafif Arjuna", age: "9 thn", active: true },
            { name: "Kayla Putri", age: "12 thn", active: false },
            { name: "Daffa Rizky", age: "8 thn", active: false },
            { name: "Nadia Salsabila", age: "14 thn", active: false },
            { name: "Bima Santoso", age: "7 thn", active: false },
          ].map((a) => (
            <div
              key={a.name}
              style={{
                padding: "0.5rem 0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: a.active ? "hsl(var(--accent-bg))" : "transparent",
                borderLeft: a.active
                  ? "2px solid hsl(var(--accent))"
                  : "2px solid transparent",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: a.active
                    ? "hsl(var(--accent))"
                    : "hsl(var(--surface-3))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.5625rem",
                  fontWeight: 700,
                  color: a.active ? "#fff" : "hsl(var(--muted))",
                  flexShrink: 0,
                }}
              >
                {a.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: a.active ? 600 : 400,
                    color: a.active
                      ? "hsl(var(--foreground))"
                      : "hsl(var(--secondary))",
                    fontSize: "0.6875rem",
                    lineHeight: 1.2,
                  }}
                >
                  {a.name}
                </div>
                <div
                  style={{
                    color: "hsl(var(--muted))",
                    fontSize: "0.5625rem",
                    marginTop: 1,
                  }}
                >
                  {a.age}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Athlete detail */}
        <div style={{ flex: 1, padding: "1rem", overflow: "hidden" }}>
          {/* Athlete header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "1rem",
              paddingBottom: "0.875rem",
              borderBottom: "1px solid hsl(var(--border-color))",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  letterSpacing: "-0.01em",
                }}
              >
                Rafif Arjuna Pratama
              </div>
              <div style={{ color: "hsl(var(--muted))", fontSize: "0.6875rem", marginTop: 2 }}>
                9 tahun · Anak Usia Dini · Program Sprint & Agility
              </div>
            </div>
            <div
              style={{
                background: "hsl(var(--success-bg))",
                color: "hsl(var(--success))",
                border: "1px solid hsl(var(--success) / 0.25)",
                borderRadius: "var(--radius-sm)",
                padding: "0.1875rem 0.5rem",
                fontSize: "0.625rem",
                fontWeight: 700,
              }}
            >
              Grade A · 84%
            </div>
          </div>

          {/* Today's session */}
          <div style={{ marginBottom: "1rem" }}>
            <div
              style={{
                fontSize: "0.625rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: "hsl(var(--muted))",
                textTransform: "uppercase",
                marginBottom: "0.375rem",
              }}
            >
              Sesi Hari Ini · 09.00–10.00
            </div>
            <div
              style={{
                background: "hsl(var(--surface-2))",
                border: "1px solid hsl(var(--border-color))",
                borderRadius: "var(--radius-md)",
                padding: "0.625rem 0.75rem",
              }}
            >
              {["Sprint 20m × 6 rep", "Shuttle Run × 4 set", "Koordinasi ladder"].map(
                (item, i) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.25rem 0",
                      borderTop: i > 0 ? "1px solid hsl(var(--border-color))" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "hsl(var(--accent))",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ color: "hsl(var(--secondary))" }}>{item}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Performance bars */}
          <div>
            <div
              style={{
                fontSize: "0.625rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: "hsl(var(--muted))",
                textTransform: "uppercase",
                marginBottom: "0.5rem",
              }}
            >
              Hasil Tes Terakhir
            </div>
            {[
              { label: "Kecepatan Sprint", value: 91 },
              { label: "Kelincahan", value: 78 },
              { label: "Fleksibilitas", value: 82 },
              { label: "Daya Tahan", value: 69 },
            ].map((bar) => (
              <div key={bar.label} style={{ marginBottom: "0.4rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.2rem",
                  }}
                >
                  <span style={{ color: "hsl(var(--secondary))" }}>{bar.label}</span>
                  <span
                    style={{
                      color: "hsl(var(--foreground))",
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {bar.value}
                  </span>
                </div>
                <div
                  style={{
                    height: 3,
                    borderRadius: 99,
                    background: "hsl(var(--surface-3))",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${bar.value}%`,
                      borderRadius: 99,
                      background:
                        bar.value >= 85
                          ? "hsl(var(--success))"
                          : bar.value >= 70
                          ? "hsl(var(--accent))"
                          : "hsl(var(--signature))",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div
        style={{
          borderTop: "1px solid hsl(var(--border-color))",
          padding: "0.625rem 1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "hsl(var(--surface-2))",
        }}
      >
        <button
          style={{
            background: "hsl(var(--accent))",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-sm)",
            padding: "0.3125rem 0.75rem",
            fontSize: "0.6875rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          📝 Catat Sesi
        </button>
        <button
          style={{
            background: "transparent",
            color: "hsl(var(--secondary))",
            border: "1px solid hsl(var(--border-color))",
            borderRadius: "var(--radius-sm)",
            padding: "0.3125rem 0.75rem",
            fontSize: "0.6875rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          📄 Laporan PDF
        </button>
        <button
          style={{
            background: "transparent",
            color: "hsl(142 60% 50%)",
            border: "1px solid hsl(142 60% 50% / 0.3)",
            borderRadius: "var(--radius-sm)",
            padding: "0.3125rem 0.75rem",
            fontSize: "0.6875rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          💬 Kirim WA
        </button>
      </div>
    </div>
  );
}

// ─── Workflow step ────────────────────────────────────────────────────────────
function WorkflowStep({
  number,
  title,
  body,
  isLast = false,
}: {
  number: string;
  title: string;
  body: string;
  isLast?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      {/* Number + connector */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "1.5px solid hsl(var(--accent))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.6875rem",
            fontWeight: 700,
            color: "hsl(var(--accent))",
            background: "hsl(var(--accent-bg))",
            flexShrink: 0,
          }}
        >
          {number}
        </div>
        {!isLast && (
          <div
            style={{
              width: 1,
              flex: 1,
              minHeight: 24,
              background: "hsl(var(--border-color))",
              marginTop: 4,
            }}
          />
        )}
      </div>
      {/* Text */}
      <div style={{ paddingBottom: isLast ? 0 : "1.5rem" }}>
        <div
          className="font-display"
          style={{
            fontWeight: 600,
            color: "hsl(var(--foreground))",
            fontSize: "0.9375rem",
            marginBottom: "0.25rem",
          }}
        >
          {title}
        </div>
        <p
          style={{
            color: "hsl(var(--secondary))",
            fontSize: "0.875rem",
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          {body}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "hsl(var(--background))" }}>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid hsl(var(--border-color))",
          background: "hsl(var(--background))",
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            padding: "0 1.5rem",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <LogoMark size={20} />
            <div>
              <span
                className="font-display"
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "hsl(var(--foreground))",
                }}
              >
                Power Up
              </span>
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "hsl(var(--muted))",
                  marginLeft: "0.375rem",
                }}
              >
                Private Training
              </span>
            </div>
          </div>

          <nav style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Link
              href="/login"
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "hsl(var(--secondary))",
                padding: "0.5rem 0.75rem",
                display: "inline-block",
              }}
            >
              Masuk
            </Link>
            <Link
              href="/register"
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#fff",
                background: "hsl(var(--accent))",
                borderRadius: "var(--radius-md)",
                padding: "0.5rem 1rem",
                minHeight: 44,
                display: "flex",
                alignItems: "center",
              }}
            >
              Daftar Gratis
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            padding: "4rem 1.5rem 3.5rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4rem",
              alignItems: "start",
            }}
            className="responsive-hero-grid"
          >
            {/* Left: Editorial text */}
            <div>
              <p
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "hsl(var(--signature))",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 20,
                    height: 1.5,
                    background: "hsl(var(--signature))",
                    verticalAlign: "middle",
                  }}
                />
                Platform untuk Personal Trainer
              </p>

              <h1
                className="font-display"
                style={{
                  fontSize: "clamp(2rem, 4vw, 2.75rem)",
                  fontWeight: 800,
                  color: "hsl(var(--foreground))",
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                  marginBottom: "1.25rem",
                }}
              >
                Kelola progres atlet muda Anda dengan serius.
              </h1>

              <p
                style={{
                  fontSize: "1rem",
                  color: "hsl(var(--secondary))",
                  lineHeight: 1.75,
                  marginBottom: "2rem",
                  maxWidth: "38ch",
                }}
              >
                Dari jadwal sesi hingga laporan hasil tes fisik ke orang tua —
                semua dalam satu platform yang dirancang untuk instruktur private training.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-start" }}>
                <Link
                  href="/register"
                  style={{
                    background: "hsl(var(--accent))",
                    color: "#fff",
                    borderRadius: "var(--radius-md)",
                    padding: "0.875rem 1.5rem",
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    minHeight: 52,
                    textDecoration: "none",
                  }}
                >
                  Mulai Gratis
                  <span aria-hidden="true" style={{ opacity: 0.7 }}>→</span>
                </Link>
                <Link
                  href="/login"
                  style={{
                    fontSize: "0.875rem",
                    color: "hsl(var(--secondary))",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: "0.25rem 0",
                    textDecoration: "none",
                  }}
                >
                  Sudah punya akun
                  <span style={{ color: "hsl(var(--accent))" }}>→</span>
                </Link>
              </div>
            </div>

            {/* Right: Actual product UI */}
            <div>
              <TrainerView />
            </div>
          </div>
        </section>

        {/* ── METRIC STRIP ────────────────────────────────────────────────── */}
        <div
          style={{
            borderTop: "1px solid hsl(var(--border-color))",
            borderBottom: "1px solid hsl(var(--border-color))",
            background: "hsl(var(--surface-1))",
          }}
        >
          <div
            style={{
              maxWidth: 1080,
              margin: "0 auto",
              padding: "1.25rem 1.5rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "1.5rem",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {[
              { n: "7", label: "Komponen fisik terukur" },
              { n: "1-on-1", label: "& grup kecil 2–3 orang" },
              { n: "PDF + WA", label: "Format laporan ke orang tua" },
              { n: "5–17 th", label: "Rentang usia klien utama" },
            ].map((m) => (
              <div key={m.n} style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                <span
                  className="font-display"
                  style={{
                    fontWeight: 800,
                    fontSize: "1.125rem",
                    color: "hsl(var(--foreground))",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {m.n}
                </span>
                <span
                  style={{
                    fontSize: "0.8125rem",
                    color: "hsl(var(--muted))",
                  }}
                >
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CONTEXT: PROBLEM → SOLUTION ─────────────────────────────────── */}
        <section
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            padding: "5rem 1.5rem",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "5rem",
            alignItems: "start",
          }}
          className="responsive-two-col"
        >
          {/* Left: Before */}
          <div>
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "hsl(var(--muted))",
                marginBottom: "1rem",
              }}
            >
              Selama ini
            </p>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(1.25rem, 2.5vw, 1.625rem)",
                fontWeight: 700,
                color: "hsl(var(--foreground))",
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
                marginBottom: "1.5rem",
              }}
            >
              Terlalu banyak waktu terbuang di hal yang bukan coaching.
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                "Jadwal sesi tersebar di WA, notes, dan omongan langsung",
                "Program latihan ditulis ulang dari nol setiap bulan",
                "Catatan progress atlet hilang atau tidak konsisten",
                "Laporan ke orang tua dibuat manual, memakan waktu jam",
                "Tidak ada cara mudah melihat perkembangan jangka panjang",
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    padding: "0.75rem 0",
                    borderBottom: "1px solid hsl(var(--border-color))",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      color: "hsl(var(--muted))",
                      fontSize: "0.75rem",
                      fontVariantNumeric: "tabular-nums",
                      fontWeight: 600,
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "hsl(var(--secondary))", lineHeight: 1.5 }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: After */}
          <div>
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "hsl(var(--accent))",
                marginBottom: "1rem",
              }}
            >
              Dengan Power Up
            </p>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(1.25rem, 2.5vw, 1.625rem)",
                fontWeight: 700,
                color: "hsl(var(--foreground))",
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
                marginBottom: "1.5rem",
              }}
            >
              Fokus ke coaching. Bukan ke administrasi.
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                "Jadwal sesi terpusat, bisa dilihat per hari atau per atlet",
                "Template program latihan tersimpan dan bisa digunakan ulang",
                "Setiap sesi tercatat lengkap dengan feedback dan video progres",
                "Laporan PDF dan ringkasan WA siap kirim ke orang tua dalam detik",
                "Grafik perkembangan atlet dari waktu ke waktu, otomatis",
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    padding: "0.75rem 0",
                    borderBottom: "1px solid hsl(var(--border-color))",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      color: "hsl(var(--accent))",
                      fontSize: "0.8125rem",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    ✓
                  </span>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "hsl(var(--secondary))", lineHeight: 1.5 }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WORKFLOW: HOW IT WORKS ───────────────────────────────────────── */}
        <section
          style={{
            borderTop: "1px solid hsl(var(--border-color))",
            background: "hsl(var(--surface-1))",
            padding: "5rem 1.5rem",
          }}
        >
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "280px 1fr",
                gap: "5rem",
                alignItems: "start",
              }}
              className="responsive-workflow-grid"
            >
              {/* Left: Label */}
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "hsl(var(--muted))",
                    marginBottom: "1rem",
                  }}
                >
                  Cara Kerja
                </p>
                <h2
                  className="font-display"
                  style={{
                    fontSize: "clamp(1.375rem, 2.5vw, 1.75rem)",
                    fontWeight: 700,
                    color: "hsl(var(--foreground))",
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                    marginBottom: "1rem",
                  }}
                >
                  Dari sesi pertama hingga laporan — terhubung.
                </h2>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "hsl(var(--secondary))",
                    lineHeight: 1.7,
                  }}
                >
                  Setiap bagian dari proses coaching Anda saling terhubung. Tidak ada yang
                  terlewat, tidak ada yang perlu diinput dua kali.
                </p>
              </div>

              {/* Right: Steps */}
              <div>
                <WorkflowStep
                  number="01"
                  title="Buat profil & program latihan atlet"
                  body="Catat data atlet (usia, antropometri, kondisi kesehatan, kontak orang tua) dan susun program latihan mingguan sesuai target fisik."
                />
                <WorkflowStep
                  number="02"
                  title="Catat setiap sesi secara konsisten"
                  body="Setelah latihan selesai, catat aktivitas hari itu, umpan balik coaching Anda, dan lampirkan video rekaman gerakan jika ada."
                />
                <WorkflowStep
                  number="03"
                  title="Lakukan tes fisik berkala"
                  body="Gunakan protokol uji 7 komponen kebugaran (fleksibilitas, power, kecepatan, kelincahan, dll.) dan sistem rubrik teknik kualitatif."
                />
                <WorkflowStep
                  number="04"
                  title="Kirim laporan ke orang tua"
                  body="Satu klik untuk mengunduh laporan PDF siap cetak atau mengirim ringkasan perkembangan anak langsung ke WhatsApp orang tua."
                  isLast
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── REPORT PREVIEW: LARGE CENTERPIECE ───────────────────────────── */}
        <section
          style={{
            padding: "5rem 1.5rem",
            borderTop: "1px solid hsl(var(--border-color))",
          }}
        >
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ maxWidth: 640, marginBottom: "3rem" }}>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "hsl(var(--muted))",
                  marginBottom: "0.75rem",
                }}
              >
                Laporan ke Orang Tua
              </p>
              <h2
                className="font-display"
                style={{
                  fontSize: "clamp(1.375rem, 2.5vw, 1.875rem)",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  marginBottom: "0.875rem",
                }}
              >
                Tampil profesional di mata orang tua klien.
              </h2>
              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "hsl(var(--secondary))",
                  lineHeight: 1.7,
                }}
              >
                Orang tua ingin tahu perkembangan anak mereka secara konkret. Hasilkan
                laporan hasil tes fisik resmi — bukan catatan tangan atau pesan WA informal.
              </p>
            </div>

            {/* Report mock */}
            <div
              style={{
                border: "1px solid hsl(var(--border-color))",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                background: "hsl(var(--surface-1))",
              }}
            >
              {/* Report header */}
              <div
                style={{
                  padding: "1.25rem 1.5rem",
                  borderBottom: "1px solid hsl(var(--border-color))",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  background: "hsl(var(--surface-2))",
                }}
              >
                <div>
                  <div
                    className="font-display"
                    style={{
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      color: "hsl(var(--foreground))",
                      letterSpacing: "0.01em",
                    }}
                  >
                    POWER UP PRIVATE TRAINING
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "hsl(var(--muted))", marginTop: 2 }}>
                    Laporan Hasil Tes Fisik · Agustus 2026
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.6875rem", color: "hsl(var(--muted))" }}>Skor Akhir</div>
                  <div
                    className="font-display"
                    style={{
                      fontWeight: 800,
                      fontSize: "1.75rem",
                      color: "hsl(var(--foreground))",
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    84%
                  </div>
                  <div
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      color: "hsl(var(--success))",
                    }}
                  >
                    Grade A
                  </div>
                </div>
              </div>

              {/* Report body */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 0,
                }}
                className="responsive-report-grid"
              >
                {/* Left: Athlete info + component scores */}
                <div
                  style={{
                    padding: "1.25rem 1.5rem",
                    borderRight: "1px solid hsl(var(--border-color))",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "hsl(var(--muted))",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Profil Atlet
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.75rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    {[
                      { l: "Nama", v: "Rafif Arjuna P." },
                      { l: "Usia", v: "9 tahun" },
                      { l: "Tinggi", v: "135 cm" },
                      { l: "Berat", v: "31 kg · BMI 17.0" },
                    ].map((f) => (
                      <div key={f.l}>
                        <div style={{ fontSize: "0.625rem", color: "hsl(var(--muted))" }}>{f.l}</div>
                        <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "hsl(var(--foreground))", marginTop: 1 }}>
                          {f.v}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "hsl(var(--muted))",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Hasil per Komponen
                  </div>
                  {[
                    { label: "Fleksibilitas", score: 82, grade: "A−" },
                    { label: "Power", score: 74, grade: "B" },
                    { label: "Kecepatan Sprint", score: 91, grade: "A+" },
                    { label: "Kelincahan", score: 78, grade: "B+" },
                    { label: "Daya Tahan Otot", score: 69, grade: "B−" },
                  ].map((c) => (
                    <div
                      key={c.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.3125rem 0",
                        borderBottom: "1px solid hsl(var(--border-color))",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.75rem", color: "hsl(var(--secondary))" }}>
                          {c.label}
                        </div>
                        <div
                          style={{
                            height: 2,
                            borderRadius: 99,
                            background: "hsl(var(--surface-3))",
                            marginTop: 3,
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${c.score}%`,
                              borderRadius: 99,
                              background: "hsl(var(--accent))",
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ fontSize: "0.6875rem", color: "hsl(var(--foreground))", fontWeight: 700, width: 20, textAlign: "right" }}>
                        {c.grade}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right: Insights + actions */}
                <div style={{ padding: "1.25rem 1.5rem" }}>
                  <div
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "hsl(var(--muted))",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Ringkasan Pelatih
                  </div>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "hsl(var(--secondary))",
                      lineHeight: 1.65,
                      marginBottom: "1rem",
                    }}
                  >
                    Rafif menunjukkan peningkatan signifikan di komponen kecepatan sprint
                    (+7 poin dari bulan lalu). Teknik koordinasi perlu diperhatikan lebih
                    lanjut di sesi-sesi berikutnya.
                  </p>

                  <div
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "hsl(var(--muted))",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Fokus Program Berikutnya
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", marginBottom: "1.5rem" }}>
                    {["Tingkatkan volume latihan agility", "Fokus footwork dan koordinasi gerakan", "Pertahankan intensitas sprint yang sudah baik"].map((r) => (
                      <div key={r} style={{ display: "flex", gap: "0.375rem", alignItems: "flex-start" }}>
                        <span style={{ color: "hsl(var(--accent))", fontSize: "0.75rem", flexShrink: 0 }}>→</span>
                        <span style={{ fontSize: "0.75rem", color: "hsl(var(--secondary))", lineHeight: 1.5 }}>{r}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      paddingTop: "1rem",
                      borderTop: "1px solid hsl(var(--border-color))",
                      display: "flex",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        background: "hsl(var(--accent))",
                        color: "#fff",
                        borderRadius: "var(--radius-sm)",
                        padding: "0.4375rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textAlign: "center",
                      }}
                    >
                      📄 Download PDF
                    </div>
                    <div
                      style={{
                        flex: 1,
                        background: "hsl(142 56% 34% / 0.15)",
                        color: "hsl(142 56% 50%)",
                        border: "1px solid hsl(142 56% 34% / 0.25)",
                        borderRadius: "var(--radius-sm)",
                        padding: "0.4375rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textAlign: "center",
                      }}
                    >
                      💬 Kirim WA
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
        <section
          style={{
            borderTop: "1px solid hsl(var(--border-color))",
            background: "hsl(var(--surface-1))",
            padding: "5rem 1.5rem",
          }}
        >
          <div
            style={{
              maxWidth: 480,
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 800,
                color: "hsl(var(--foreground))",
                lineHeight: 1.15,
                letterSpacing: "-0.025em",
                marginBottom: "1rem",
              }}
            >
              Siap fokus ke coaching, bukan administrasi?
            </h2>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "hsl(var(--secondary))",
                lineHeight: 1.65,
                marginBottom: "2rem",
              }}
            >
              Daftar gratis. Tidak perlu kartu kredit.
            </p>
            <Link
              href="/register"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "hsl(var(--accent))",
                color: "#fff",
                borderRadius: "var(--radius-md)",
                padding: "0.9375rem 2rem",
                fontSize: "1rem",
                fontWeight: 700,
                minHeight: 56,
                textDecoration: "none",
              }}
            >
              Mulai Gratis Sekarang
            </Link>
            <div style={{ marginTop: "1rem" }}>
              <Link
                href="/login"
                style={{
                  fontSize: "0.875rem",
                  color: "hsl(var(--muted))",
                  textDecoration: "none",
                }}
              >
                Sudah punya akun?{" "}
                <span style={{ color: "hsl(var(--accent))" }}>Masuk di sini →</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid hsl(var(--border-color))",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <LogoMark size={16} />
            <span
              style={{
                fontSize: "0.8125rem",
                color: "hsl(var(--muted))",
                fontWeight: 500,
              }}
            >
              Power Up Private Training · Powered by Kinetiq
            </span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "hsl(var(--muted))" }}>
            © {new Date().getFullYear()} Power Up Private Training
          </span>
        </div>
      </footer>

      {/* ── RESPONSIVE STYLES ────────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 720px) {
          .responsive-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
          .responsive-two-col {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
          .responsive-workflow-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .responsive-report-grid {
            grid-template-columns: 1fr !important;
          }
          .responsive-report-grid > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid hsl(var(--border-color)) !important;
          }
        }
      `}</style>
    </div>
  );
}
