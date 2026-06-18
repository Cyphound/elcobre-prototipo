"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, Clock, CheckCircle2, Truck, RefreshCw, MapPin } from "lucide-react";

const activeOrders = [
  {
    id: "COBRE-2848",
    client: "Laura Vega",
    phone: "+56 9 8812 3344",
    service: "Doméstica y Particular",
    date: "01/06/2026",
    prendas: 12,
    currentStep: 1,
    steps: [
      { name: "Recibido en tienda", date: "01/06/2026 08:30", done: true, active: false },
      { name: "Clasificación y pesaje", date: "En curso...", done: true, active: true },
      { name: "Lavado & Sanitizado", date: "Pendiente", done: false, active: false },
      { name: "Sistema de Planchado", date: "Pendiente", done: false, active: false },
      { name: "Control de calidad", date: "Pendiente", done: false, active: false },
      { name: "Listo para retiro / entrega", date: "Pendiente", done: false, active: false },
    ],
  },
  {
    id: "COBRE-2846",
    client: "Empresa TechCorp S.A.",
    phone: "+56 2 2234 5566",
    service: "Industrial / Empresa",
    date: "01/06/2026",
    prendas: 85,
    currentStep: 2,
    steps: [
      { name: "Recibido en tienda", date: "01/06/2026 07:45", done: true, active: false },
      { name: "Clasificación y pesaje", date: "01/06/2026 08:00", done: true, active: false },
      { name: "Lavado & Sanitizado", date: "En curso...", done: true, active: true },
      { name: "Sistema de Planchado", date: "Pendiente", done: false, active: false },
      { name: "Control de calidad", date: "Pendiente", done: false, active: false },
      { name: "Listo para retiro / entrega", date: "Pendiente", done: false, active: false },
    ],
  },
  {
    id: "COBRE-2843",
    client: "Hotel Plaza Santiago",
    phone: "+56 2 2456 7890",
    service: "Industrial / Empresa",
    date: "31/05/2026",
    prendas: 200,
    currentStep: 3,
    steps: [
      { name: "Recibido en tienda", date: "31/05/2026 14:00", done: true, active: false },
      { name: "Clasificación y pesaje", date: "31/05/2026 14:20", done: true, active: false },
      { name: "Lavado & Sanitizado", date: "31/05/2026 15:00", done: true, active: false },
      { name: "Sistema de Planchado", date: "En curso...", done: true, active: true },
      { name: "Control de calidad", date: "Pendiente", done: false, active: false },
      { name: "Listo para retiro / entrega", date: "Pendiente", done: false, active: false },
    ],
  },
  {
    id: "COBRE-2841",
    client: "Clínica Santa María",
    phone: "+56 2 2987 6543",
    service: "Industrial / Empresa",
    date: "31/05/2026",
    prendas: 130,
    currentStep: 4,
    steps: [
      { name: "Recibido en tienda", date: "31/05/2026 10:00", done: true, active: false },
      { name: "Clasificación y pesaje", date: "31/05/2026 10:15", done: true, active: false },
      { name: "Lavado & Sanitizado", date: "31/05/2026 11:00", done: true, active: false },
      { name: "Sistema de Planchado", date: "31/05/2026 13:30", done: true, active: false },
      { name: "Control de calidad", date: "En curso...", done: true, active: true },
      { name: "Listo para retiro / entrega", date: "Pendiente", done: false, active: false },
    ],
  },
  {
    id: "COBRE-2840",
    client: "Carmen López",
    phone: "+56 9 4456 2233",
    service: "Retiro a Domicilio",
    date: "30/05/2026",
    prendas: 5,
    currentStep: 0,
    steps: [
      { name: "Retiro programado", date: "En curso...", done: true, active: true },
      { name: "Recibido en tienda", date: "Pendiente", done: false, active: false },
      { name: "Lavado & Sanitizado", date: "Pendiente", done: false, active: false },
      { name: "Sistema de Planchado", date: "Pendiente", done: false, active: false },
      { name: "Control de calidad", date: "Pendiente", done: false, active: false },
      { name: "Entrega a domicilio", date: "Pendiente", done: false, active: false },
    ],
  },
  {
    id: "COBRE-2837",
    client: "Valentina Ríos",
    phone: "+56 9 3322 7788",
    service: "Doméstica y Particular",
    date: "30/05/2026",
    prendas: 8,
    currentStep: 0,
    steps: [
      { name: "Recibido en tienda", date: "30/05/2026 09:30", done: true, active: true },
      { name: "Clasificación y pesaje", date: "Pendiente", done: false, active: false },
      { name: "Lavado & Sanitizado", date: "Pendiente", done: false, active: false },
      { name: "Sistema de Planchado", date: "Pendiente", done: false, active: false },
      { name: "Control de calidad", date: "Pendiente", done: false, active: false },
      { name: "Listo para retiro / entrega", date: "Pendiente", done: false, active: false },
    ],
  },
];

function getProgress(steps: typeof activeOrders[0]["steps"]) {
  const done = steps.filter((s) => s.done && !s.active).length;
  return Math.round((done / steps.length) * 100);
}

export default function SeguimientoPage() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>("COBRE-2848");

  const filtered = activeOrders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.client.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen text-stone-900 dark:text-stone-100 p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-extrabold text-stone-900 dark:text-white">
            Seguimiento de Pedidos
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
            {activeOrders.length} pedidos activos en este momento
          </p>
        </div>
        <button className="flex items-center gap-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-white/10 text-stone-600 dark:text-stone-300 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-stone-100 dark:hover:bg-stone-700 transition-all self-start sm:self-auto shadow-sm dark:shadow-none">
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: "En proceso", value: 4, color: "text-brand-600 dark:text-brand-400", bg: "bg-brand-100 dark:bg-brand-500/10" },
          { label: "Retiro pendiente", value: 1, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/10" },
          { label: "En clasificación", value: 1, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-100 dark:bg-sky-500/10" },
        ].map((s, i) => (
          <div key={i} className={`border border-stone-200 dark:border-white/5 rounded-2xl p-4 shadow-sm dark:shadow-none ${s.bg}`}>
            <p className={`text-2xl font-display font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-stone-500 dark:text-stone-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative max-w-sm"
      >
        <input
          type="text"
          placeholder="Buscar pedido o cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/5 rounded-xl text-sm text-stone-700 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none focus:border-brand-500/50 transition-colors shadow-sm dark:shadow-none"
        />
        <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
      </motion.div>

      {/* Orders List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((order, i) => {
            const progress = getProgress(order.steps);
            const isOpen = expanded === order.id;
            const activeStep = order.steps.find((s) => s.active);

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/5 rounded-2xl overflow-hidden hover:border-brand-300 dark:hover:border-brand-500/15 transition-colors shadow-sm dark:shadow-none"
              >
                {/* Card Header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  className="w-full flex items-center gap-4 p-5 text-left"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-500/10 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-stone-900 dark:text-white font-bold text-sm">{order.id}</span>
                      <span className="text-stone-400 dark:text-stone-600 text-xs">·</span>
                      <span className="text-stone-500 dark:text-stone-400 text-xs">{order.service}</span>
                      <span className="text-[10px] bg-brand-100 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-300 dark:border-brand-500/20 px-2 py-0.5 rounded-full font-bold animate-pulse">
                        {activeStep?.name ?? "En espera"}
                      </span>
                    </div>
                    <p className="text-stone-400 dark:text-stone-500 text-xs mt-0.5">{order.client} · {order.prendas} prendas</p>
                  </div>

                  {/* Progress */}
                  <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-brand-600 dark:text-brand-400 font-bold text-sm">{progress}%</span>
                    <div className="w-24 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-brand rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.06 }}
                      />
                    </div>
                  </div>
                </button>

                {/* Expanded Timeline */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-0 border-t border-stone-100 dark:border-white/5">
                        {/* Client details */}
                        <div className="flex flex-wrap gap-4 py-3 mb-4 text-xs">
                          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                            {order.service}
                          </div>
                          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                            <Clock className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                            Ingreso: {order.date}
                          </div>
                          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                            <Package className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                            {order.prendas} prendas
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-4 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-stone-200 dark:before:bg-stone-700">
                          {order.steps.map((step, si) => (
                            <motion.div
                              key={si}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: si * 0.07 }}
                              className="relative flex justify-between items-start"
                            >
                              {/* Dot */}
                              <div
                                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                                  step.active
                                    ? "bg-brand-500 border-brand-500 scale-110"
                                    : step.done
                                    ? "bg-green-500 border-green-500"
                                    : "bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-600"
                                }`}
                              >
                                {step.done && !step.active && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                                {step.active && (
                                  <div className="w-2 h-2 rounded-full bg-white animate-ping absolute" />
                                )}
                              </div>

                              <div>
                                <p
                                  className={`text-sm font-semibold ${
                                    step.active
                                      ? "text-brand-600 dark:text-brand-400"
                                      : step.done
                                      ? "text-stone-700 dark:text-stone-200"
                                      : "text-stone-400 dark:text-stone-600"
                                  }`}
                                >
                                  {step.name}
                                </p>
                                <p className="text-[11px] text-stone-400 dark:text-stone-600 mt-0.5">{step.date}</p>
                              </div>

                              {step.active && (
                                <span className="text-[10px] font-bold bg-brand-100 dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 border border-brand-300 dark:border-brand-500/25 px-2 py-0.5 rounded-full animate-pulse">
                                  En curso
                                </span>
                              )}
                              {step.done && !step.active && (
                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-stone-400 dark:text-stone-600 text-sm">
            No se encontraron pedidos activos.
          </div>
        )}
      </div>
    </div>
  );
}
