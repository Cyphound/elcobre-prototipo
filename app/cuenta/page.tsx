"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { LogOut, Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase/client";
import { useUsuarioActual } from "@/lib/firebase/useUsuarioActual";

export default function CuentaPage() {
  const router = useRouter();
  const { usuario, loading } = useUsuarioActual();

  useEffect(() => {
    if (loading) return;
    if (!usuario) {
      router.push("/");
      return;
    }
    if (usuario.rol.nombre === "admin") {
      router.push("/intranet");
    }
  }, [loading, usuario, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading || !usuario || usuario.rol.nombre === "admin") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#fdfcfb]">
        <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
      </main>
    );
  }

  const cliente = usuario.clientes_on_usuario[0];

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fdfcfb] px-4 py-16">
      <div className="glass-card bg-white/80 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md space-y-6">
        <div className="space-y-1">
          <span className="inline-block bg-brand-50 text-brand-650 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
            {usuario.rol.nombre}
          </span>
          <h1 className="text-2xl font-extrabold text-stone-900 font-display">
            Hola, {usuario.nombre}
          </h1>
          <p className="text-sm text-stone-500">{usuario.rol.descripcion}</p>
        </div>

        <dl className="space-y-3 text-sm">
          <Row label="Nombre completo" value={`${usuario.nombre} ${usuario.apellido ?? ""}`.trim()} />
          <Row label="RUT" value={usuario.rut ?? "—"} />
          <Row label="Correo" value={usuario.email} />
          <Row label="Teléfono" value={usuario.telefono ?? "—"} />
          {cliente && <Row label="Tipo de cliente" value={cliente.tipoCliente} />}
          {cliente && <Row label="Dirección" value={cliente.direccion ?? "—"} />}
        </dl>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline border-b border-stone-100 pb-2">
      <dt className="text-stone-500">{label}</dt>
      <dd className="font-semibold text-stone-850 text-right">{value}</dd>
    </div>
  );
}
