"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock,
  Package,
  XCircle,
  TrendingUp,
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

type Status = "Todos" | "Pendiente" | "En proceso" | "Listo" | "Cancelado";

const statusCfg: Record<string, { bg: string; text: string; dot: string; icon: React.ElementType }> = {
  Pendiente: { bg: "bg-amber-500/15", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-400", icon: Clock },
  "En proceso": { bg: "bg-brand-500/15", text: "text-brand-600 dark:text-brand-400", dot: "bg-brand-400", icon: Package },
  Listo: { bg: "bg-green-500/15", text: "text-green-600 dark:text-green-400", dot: "bg-green-400", icon: CheckCircle2 },
  Cancelado: { bg: "bg-red-500/15", text: "text-red-600 dark:text-red-400", dot: "bg-red-400", icon: XCircle },
};

const orders = [
  { id: "COBRE-2848", client: "Laura Vega", phone: "+56 9 8812 3344", service: "Doméstica y Particular", prendas: 12, date: "01/06/2026 08:30", status: "Pendiente", amount: 14400 },
  { id: "COBRE-2847", client: "María González", phone: "+56 9 7723 4455", service: "Doméstica y Particular", prendas: 9, date: "01/06/2026 08:00", status: "Listo", amount: 15200 },
  { id: "COBRE-2846", client: "Empresa TechCorp S.A.", phone: "+56 2 2234 5566", service: "Industrial / Empresa", prendas: 85, date: "01/06/2026 07:45", status: "En proceso", amount: 245000 },
  { id: "COBRE-2845", client: "Pedro Rodríguez", phone: "+56 9 6634 7788", service: "Retiro a Domicilio", prendas: 6, date: "31/05/2026 17:20", status: "Listo", amount: 8500 },
  { id: "COBRE-2844", client: "Ana Martínez", phone: "+56 9 5512 8899", service: "Doméstica y Particular", prendas: 11, date: "31/05/2026 16:30", status: "Listo", amount: 12800 },
  { id: "COBRE-2843", client: "Hotel Plaza Santiago", phone: "+56 2 2456 7890", service: "Industrial / Empresa", prendas: 200, date: "31/05/2026 14:00", status: "En proceso", amount: 380000 },
  { id: "COBRE-2842", client: "Roberto Fuentes", phone: "+56 9 9988 1122", service: "Doméstica y Particular", prendas: 7, date: "31/05/2026 12:15", status: "Listo", amount: 9800 },
  { id: "COBRE-2841", client: "Clínica Santa María", phone: "+56 2 2987 6543", service: "Industrial / Empresa", prendas: 130, date: "31/05/2026 10:00", status: "En proceso", amount: 520000 },
  { id: "COBRE-2840", client: "Carmen López", phone: "+56 9 4456 2233", service: "Retiro a Domicilio", prendas: 5, date: "30/05/2026 18:00", status: "Pendiente", amount: 7500 },
  { id: "COBRE-2839", client: "Constructora Norte", phone: "+56 2 2111 3344", service: "Industrial / Empresa", prendas: 45, date: "30/05/2026 15:30", status: "Cancelado", amount: 185000 },
  { id: "COBRE-2838", client: "José Arenas", phone: "+56 9 7700 5566", service: "Doméstica y Particular", prendas: 14, date: "30/05/2026 11:00", status: "Listo", amount: 18200 },
  { id: "COBRE-2837", client: "Valentina Ríos", phone: "+56 9 3322 7788", service: "Doméstica y Particular", prendas: 8, date: "30/05/2026 09:30", status: "Pendiente", amount: 11600 },
];

const tabs: Status[] = ["Todos", "Pendiente", "En proceso", "Listo", "Cancelado"];

const tabCount = (status: Status) => {
  if (status === "Todos") return orders.length;
  return orders.filter((o) => o.status === status).length;
};

export default function ComandasPage() {
  const [activeTab, setActiveTab] = useState<Status>("Todos");
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    const matchTab = activeTab === "Todos" || o.status === activeTab;
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.client.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalFiltered = filtered.reduce((s, o) => s + o.amount, 0);

  return (
    <div className="min-h-screen text-stone-900 dark:text-stone-100 p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-extrabold text-stone-900 dark:text-white">Comandas</h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
            {orders.length} órdenes en total · $
            {orders.reduce((s, o) => s + o.amount, 0).toLocaleString("es-CL")} CLP
          </p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-brand text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-premium hover:shadow-lg hover:scale-[1.02] transition-all self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Nueva Comanda
        </button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {[
          { label: "Pendientes", count: 3, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/10" },
          { label: "En Proceso", count: 3, color: "text-brand-600 dark:text-brand-400", bg: "bg-brand-100 dark:bg-brand-500/10" },
          { label: "Listos", count: 5, color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-500/10" },
          { label: "Cancelados", count: 1, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-500/10" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className={`border border-stone-200 dark:border-white/5 rounded-2xl p-4 shadow-sm dark:shadow-none ${s.bg}`}
          >
            <p className={`text-2xl font-display font-extrabold ${s.color}`}>{s.count}</p>
            <p className="text-stone-500 dark:text-stone-500 text-xs mt-1">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters + Search */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/5 rounded-2xl p-4 space-y-3 shadow-sm dark:shadow-none"
      >
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab
                  ? "bg-brand-500 text-white shadow-md"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-700 dark:hover:text-stone-200"
              }`}
            >
              {tab}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === tab ? "bg-white/20" : "bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-500"
                }`}
              >
                {tabCount(tab)}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <input
            type="text"
            placeholder="Buscar por ID o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-white/5 rounded-xl text-sm text-stone-700 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none focus:border-brand-500/50 transition-colors"
          />
          <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm dark:shadow-none"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-white/5 bg-stone-50 dark:bg-stone-800/50">
                {["Comanda", "Cliente", "Servicio", "Prendas", "Fecha", "Estado", "Monto", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-500 px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.map((order, i) => {
                  const sc = statusCfg[order.status];
                  const Icon = sc.icon;
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-stone-100 dark:border-white/5 last:border-0 hover:bg-stone-50 dark:hover:bg-white/2 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <span className="font-bold text-stone-700 dark:text-stone-200">{order.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-stone-700 dark:text-stone-200 font-semibold">{order.client}</p>
                        <p className="text-stone-400 dark:text-stone-600 text-[10px]">{order.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-stone-500 dark:text-stone-400">{order.service}</td>
                      <td className="px-4 py-3 text-stone-500 dark:text-stone-400 text-center">{order.prendas}</td>
                      <td className="px-4 py-3 text-stone-400 dark:text-stone-500 whitespace-nowrap">{order.date}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full ${sc.bg} ${sc.text}`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-stone-700 dark:text-stone-200 font-bold">
                          ${order.amount.toLocaleString("es-CL")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 rounded-lg text-stone-400 dark:text-stone-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-500/10 transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-lg text-stone-400 dark:text-stone-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-500/10 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-lg text-stone-400 dark:text-stone-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-stone-400 dark:text-stone-600 text-sm">
                    No se encontraron comandas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-stone-100 dark:border-white/5 flex items-center justify-between">
          <p className="text-stone-400 dark:text-stone-600 text-xs">
            {filtered.length} resultados
          </p>
          <p className="text-stone-500 dark:text-stone-400 text-xs font-bold">
            Total: <span className="text-brand-600 dark:text-brand-400">${totalFiltered.toLocaleString("es-CL")} CLP</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
