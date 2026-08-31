import type { Metadata } from "next";
import { PublicNavbar } from "@/features/public-brand/components/public-navbar";
import { HeroSection } from "@/features/public-brand/components/hero-section";
import { TrustCredentialsSection } from "@/features/public-brand/components/trust-credentials-section";
import { AboutCoachSection } from "@/features/public-brand/components/about-coach-section";
import { WhoItsForSection } from "@/features/public-brand/components/who-its-for-section";
import { ServiceProgramsSection } from "@/features/public-brand/components/service-programs-section";
import { CoachingMethodologySection } from "@/features/public-brand/components/coaching-methodology-section";
import { PhysicalComponentsSection } from "@/features/public-brand/components/physical-components-section";
import { TrainingShowcaseSection } from "@/features/public-brand/components/training-showcase-section";
import { ParentValueSection } from "@/features/public-brand/components/parent-value-section";
import { TestimonialsSection } from "@/features/public-brand/components/testimonials-section";
import { ClientPortalShowcaseSection } from "@/features/public-brand/components/client-portal-showcase-section";
import { FaqSection } from "@/features/public-brand/components/faq-section";
import { WhatsappCtaSection } from "@/features/public-brand/components/whatsapp-cta-section";
import { PublicFooter } from "@/features/public-brand/components/public-footer";
import { APP_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${APP_CONFIG.shortName} | Pelatihan Fisik & Performa Atletik Atlet Muda`,
  description:
    "Pelatihan fisik privat & pembinaan performa atletik berbasis data sport-science bersama Coach Zulfi. Pengujian terukur, program terarah, dan pemantauan transparan untuk orang tua.",
  openGraph: {
    title: `${APP_CONFIG.shortName} | Athletic Performance & Physical Conditioning`,
    description:
      "Pengujian fisik ilmiah 7 pilar, program terarah, dan laporan berkala transparan bersama Coach Zulfi (@zulficoach).",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans">
      {/* 1. Header & Navigation */}
      <PublicNavbar />

      {/* 2. Hero Section */}
      <HeroSection />

      {/* 3. Trust & Credentials Bar */}
      <TrustCredentialsSection />

      {/* 4. About Coach Zulfi */}
      <AboutCoachSection />

      {/* 5. Who It's For */}
      <WhoItsForSection />

      {/* 6. Service Programs */}
      <ServiceProgramsSection />

      {/* 7. 5-Step Methodology */}
      <CoachingMethodologySection />

      {/* 8. 7 Physical Performance Components */}
      <PhysicalComponentsSection />

      {/* 9. Training Showcase */}
      <TrainingShowcaseSection />

      {/* 10. Parent Value Proposition */}
      <ParentValueSection />

      {/* 11. Results & Testimonials */}
      <TestimonialsSection />

      {/* 12. Client Portal Value-Add */}
      <ClientPortalShowcaseSection />

      {/* 13. FAQ */}
      <FaqSection />

      {/* 14. WhatsApp CTA & Footer */}
      <WhatsappCtaSection />
      <PublicFooter />
    </div>
  );
}
