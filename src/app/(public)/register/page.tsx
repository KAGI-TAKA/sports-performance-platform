import { redirect } from "next/navigation";

export default function RegisterPage() {
  // P9-C: Platform ini adalah Private Managed Platform.
  // Pendaftaran akun dikelola langsung oleh Admin / Head Coach.
  // Rute publik /register dialihkan langsung ke /login.
  redirect("/login");
}