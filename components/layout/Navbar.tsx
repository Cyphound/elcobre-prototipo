"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X, LogIn, Package, Search, CheckCircle2, Lock, Mail, User, IdCard, Phone, MapPin, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { QueryFetchPolicy } from "firebase/data-connect";
import { auth, dataConnect } from "@/lib/firebase/client";
import { getRoles, registrarseComoCliente, getMiPerfil, type GetRolesData } from "@/src/dataconnect-generated";
import { cleanRut, formatRut, isValidRut, validatePassword } from "@/lib/validators";
import { mapAuthError } from "@/lib/firebase/errors";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Modal States
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Tracking Form States
  const [trackingCode, setTrackingCode] = useState("");
  const [trackingStatus, setTrackingStatus] = useState<"idle" | "searching" | "result" | "error">("idle");
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [trackingError, setTrackingError] = useState("");

  // Auth Form States
  const [authView, setAuthView] = useState<"login" | "register" | "forgot">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authConfirmPass, setAuthConfirmPass] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authError, setAuthError] = useState("");

  // Register-only fields (Usuario / Cliente). El registro público siempre
  // crea cuentas de tipo "cliente" — el resto de roles se crean desde la intranet.
  const [authApellido, setAuthApellido] = useState("");
  const [authRut, setAuthRut] = useState("");
  const [authTelefono, setAuthTelefono] = useState("");
  const [authDireccion, setAuthDireccion] = useState("");
  const [roles, setRoles] = useState<GetRolesData["rols"]>([]);
  const clienteRolId = roles.find((r) => r.nombre === "cliente")?.id;

  const rutDigits = cleanRut(authRut);
  const rutTouched = rutDigits.length > 0;
  const rutValid = rutTouched && isValidRut(authRut);
  const passwordCheck = validatePassword(authPassword);

  const resetRegisterFields = () => {
    setAuthName("");
    setAuthApellido("");
    setAuthRut("");
    setAuthTelefono("");
    setAuthDireccion("");
    setAuthConfirmPass("");
    setAuthPassword("");
  };

  // Load role catalog once, solo para obtener el id del rol "cliente"
  useEffect(() => {
    getRoles(dataConnect)
      .then(({ data }) => setRoles(data.rols))
      .catch(() => setRoles([]));
  }, []);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (isTrackingOpen || isLoginOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isTrackingOpen, isLoginOpen]);

  // Handle scroll header background change
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Simulated Order Tracking
  const handleTrackingSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingError("");
    
    if (!trackingCode.trim()) {
      setTrackingError("Por favor ingresa un código de seguimiento.");
      return;
    }

    setTrackingStatus("searching");

    setTimeout(() => {
      const code = trackingCode.trim().toUpperCase();
      setTrackingResult({
        code: code.startsWith("COBRE-") ? code : `COBRE-${code}`,
        client: "Juan Pérez",
        service: "Lavandería Doméstica y Particular",
        date: new Date().toLocaleDateString("es-CL"),
        currentStep: 3, // 1: Recibido, 2: Lavado, 3: Planchado, 4: Listo
        steps: [
          { name: "Recibido", date: "24/05/2026 09:00", done: true },
          { name: "Lavado & Sanitizado", date: "24/05/2026 11:30", done: true },
          { name: "Sistema de Planchado", date: "En curso...", done: true, active: true },
          { name: "Listo para Retiro / Entrega", date: "Pendiente", done: false },
        ],
      });
      setTrackingStatus("result");
    }, 1200);
  };

  // Auth Submission (Firebase Auth + Data Connect)
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (authView === "login") {
      if (!authEmail.trim() || !authPassword.trim()) {
        setAuthError("Por favor ingresa tu correo y contraseña.");
        return;
      }
      setAuthLoading(true);
      try {
        await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword);
        // SERVER_ONLY: el perfil depende de auth.uid (no hay variables), así que
        // el caché por defecto del SDK devolvería el perfil de la sesión anterior.
        const { data } = await getMiPerfil(dataConnect, { fetchPolicy: QueryFetchPolicy.SERVER_ONLY });
        const rolNombre = data.usuario?.rol?.nombre;

        setAuthLoading(false);
        setAuthSuccess(true);
        setTimeout(() => {
          setIsLoginOpen(false);
          setAuthSuccess(false);
          setAuthEmail("");
          setAuthPassword("");
          router.push(rolNombre === "admin" ? "/intranet" : "/cuenta");
        }, 1200);
      } catch (err) {
        setAuthLoading(false);
        setAuthError(mapAuthError(err));
      }
    } else if (authView === "register") {
      if (
        !authName.trim() ||
        !authApellido.trim() ||
        !authRut.trim() ||
        !authEmail.trim() ||
        !authPassword.trim() ||
        !authConfirmPass.trim()
      ) {
        setAuthError("Todos los campos son obligatorios.");
        return;
      }
      if (!clienteRolId) {
        setAuthError("No se pudo cargar el catálogo de roles. Intenta nuevamente.");
        return;
      }
      if (!isValidRut(authRut)) {
        setAuthError("El RUT ingresado no es válido.");
        return;
      }
      if (!passwordCheck.valid) {
        setAuthError(passwordCheck.message);
        return;
      }
      if (authPassword !== authConfirmPass) {
        setAuthError("Las contraseñas no coinciden.");
        return;
      }

      setAuthLoading(true);
      let createdUserId: string | null = null;
      try {
        const credential = await createUserWithEmailAndPassword(auth, authEmail.trim(), authPassword);
        createdUserId = credential.user.uid;

        await registrarseComoCliente(dataConnect, {
          rolId: clienteRolId,
          rut: formatRut(authRut),
          nombre: authName.trim(),
          apellido: authApellido.trim(),
          telefono: authTelefono.trim() || null,
          email: authEmail.trim(),
          direccion: authDireccion.trim() || null,
        });

        setAuthLoading(false);
        setAuthSuccess(true);
        setTimeout(() => {
          setAuthView("login");
          setAuthSuccess(false);
          resetRegisterFields();
        }, 1550);
      } catch (err) {
        setAuthLoading(false);
        if (createdUserId && auth.currentUser) {
          await auth.currentUser.delete().catch(() => {});
        }
        setAuthError(mapAuthError(err));
      }
    } else if (authView === "forgot") {
      if (!authEmail.trim()) {
        setAuthError("Por favor ingresa tu correo electrónico.");
        return;
      }
      setAuthLoading(true);
      try {
        await sendPasswordResetEmail(auth, authEmail.trim());
        setAuthLoading(false);
        setAuthSuccess(true);
        setTimeout(() => {
          setAuthView("login");
          setAuthSuccess(false);
        }, 3000);
      } catch (err) {
        setAuthLoading(false);
        setAuthError(mapAuthError(err));
      }
    }
  };

  const navLinks = [
    { name: "Inicio", href: "#inicio" },
    { name: "Servicios", href: "#servicios" },
    { name: "Maquinaria", href: "#maquinaria" },
    { name: "Recepción", href: "#recepcion" },
    { name: "Contacto", href: "#contacto" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
          scrolled 
            ? "glass-nav border-brand-500/12 bg-white/60 backdrop-blur-2xl backdrop-saturate-150 py-3" 
            : "border-transparent bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Text */}
            <div className="flex-shrink-0 flex items-center">
              <a
                href="#inicio"
                className="flex items-center gap-3"
              >
                <Image
                  src="/logo.webp"
                  alt="Logo Lavandería El Cobre"
                  width={48}
                  height={48}
                  className="h-11 w-auto object-contain"
                  priority
                />
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-stone-900 font-display flex flex-col sm:flex-row sm:gap-1.5 leading-none">
                  <span>Lavandería</span>
                  <span className="text-brand-500">El Cobre</span>
                </span>
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-baseline gap-6">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-stone-700 hover:text-brand-650 font-medium transition-colors duration-200 text-sm relative group"
                  >
                    {link.name}
                    <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full" />
                  </a>
                ))}
              </div>

              {/* CTAs Group */}
              <div className="flex items-center gap-3">
                {/* Seguimiento CTA */}
                <button
                  onClick={() => {
                    setIsTrackingOpen(true);
                    setTrackingStatus("idle");
                    setTrackingCode("");
                    setTrackingError("");
                  }}
                  className="flex items-center justify-center gap-2 bg-white border border-stone-250 text-stone-700 hover:border-stone-400 hover:text-stone-900 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                >
                  <Package className="w-4 h-4 text-stone-500" />
                  <span>Seguimiento</span>
                </button>

                {/* Iniciar Sesión CTA */}
                <button
                  onClick={() => {
                    setIsLoginOpen(true);
                    setAuthView("login");
                    setAuthError("");
                    setAuthSuccess(false);
                  }}
                  className="flex items-center justify-center gap-2 bg-gradient-brand text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-premium hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-stone-750 hover:text-brand-600 focus:outline-none transition-colors"
              >
                <span className="sr-only">Abrir menú</span>
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white/75 backdrop-blur-xl border-b border-brand-500/10 shadow-lg"
            >
              <div className="px-4 pt-2 pb-6 space-y-3 sm:px-3 shadow-lg">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-semibold text-stone-850 hover:bg-brand-50 hover:text-brand-600 transition-all"
                  >
                    {link.name}
                  </a>
                ))}
                <div className="pt-4 border-t border-stone-100 grid grid-cols-2 gap-3 px-3">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsTrackingOpen(true);
                      setTrackingStatus("idle");
                      setTrackingCode("");
                      setTrackingError("");
                    }}
                    className="flex items-center justify-center gap-2 bg-white border border-stone-250 text-stone-700 py-3 rounded-xl font-bold text-sm shadow-sm"
                  >
                    <Package className="w-4 h-4 text-stone-500" />
                    <span>Seguimiento</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsLoginOpen(true);
                      setAuthView("login");
                      setAuthError("");
                      setAuthSuccess(false);
                    }}
                    className="flex items-center justify-center gap-2 bg-gradient-brand text-white py-3 rounded-xl font-bold text-sm shadow-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Iniciar Sesión</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* MODALS SECTION */}
      <AnimatePresence>
        {/* Tracking Modal */}
        {isTrackingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTrackingOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="glass-modal bg-white/70 backdrop-blur-2xl backdrop-saturate-150 rounded-3xl p-6 sm:p-8 w-full max-w-lg border border-white/60 relative z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsTrackingOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-50 text-brand-650 rounded-2xl">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-stone-900">Seguimiento de Pedido</h3>
                    <p className="text-xs text-stone-500">Ingresa tu código para conocer el estado actual</p>
                  </div>
                </div>

                <form onSubmit={handleTrackingSearch} className="space-y-4">
                  {trackingError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-755 text-xs font-semibold rounded-xl">
                      {trackingError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Ej: COBRE-1234 o 1234"
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value)}
                        className="w-full pl-4 pr-10 py-3.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-850 font-bold placeholder-stone-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-sm uppercase"
                      />
                      <Search className="w-4 h-4 text-stone-450 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <button
                      type="submit"
                      disabled={trackingStatus === "searching"}
                      className="bg-gradient-brand text-white font-bold px-6 rounded-xl text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shrink-0"
                    >
                      {trackingStatus === "searching" ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Buscar"
                      )}
                    </button>
                  </div>
                </form>

                {/* Tracking Results Area */}
                <AnimatePresence mode="wait">
                  {trackingStatus === "searching" && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-12 flex flex-col items-center justify-center gap-3"
                    >
                      <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-semibold text-stone-600">Consultando base de datos...</p>
                    </motion.div>
                  )}

                  {trackingStatus === "result" && trackingResult && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="space-y-6 pt-4 border-t border-stone-150"
                    >
                      {/* Ticket Header */}
                      <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-stone-900">{trackingResult.code}</p>
                          <p className="text-stone-500 mt-0.5">{trackingResult.service}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-stone-500">Fecha Ingreso</p>
                          <p className="font-semibold text-stone-850 mt-0.5">{trackingResult.date}</p>
                        </div>
                      </div>

                      {/* Visual Timeline Progress */}
                      <div className="space-y-5">
                        <h4 className="text-xs uppercase font-extrabold tracking-wider text-brand-700">Estado del Lavado</h4>
                        
                        <div className="space-y-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                          {trackingResult.steps.map((step: any, sIdx: number) => {
                            const isDone = step.done;
                            const isActive = step.active;

                            return (
                              <div key={sIdx} className="relative flex justify-between items-start">
                                {/* Timeline Bullet */}
                                <div
                                  className={`absolute -left-6 top-1 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    isDone
                                      ? isActive
                                        ? "bg-brand-550 border-brand-550 scale-110"
                                        : "bg-green-500 border-green-500"
                                      : "bg-white border-stone-300"
                                  }`}
                                >
                                  {isDone && !isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                                </div>

                                <div className="pl-1">
                                  <h5
                                    className={`text-sm font-bold leading-none ${
                                      isActive
                                        ? "text-brand-650"
                                        : isDone
                                        ? "text-stone-900"
                                        : "text-stone-400"
                                    }`}
                                  >
                                    {step.name}
                                  </h5>
                                  <p className="text-[11px] text-stone-500 mt-1">{step.date}</p>
                                </div>

                                {isActive && (
                                  <span className="bg-brand-50 border border-brand-200 text-brand-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full animate-pulse">
                                    En Proceso
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}

        {/* Login / Register / Forgot Password Modal */}
        {isLoginOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="glass-modal bg-white/70 backdrop-blur-2xl backdrop-saturate-150 rounded-3xl p-6 sm:p-8 w-full max-w-md border border-white/60 relative z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsLoginOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                {/* Header Logo */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <Image
                    src="/logo.webp"
                    alt="Logo Lavandería El Cobre"
                    width={50}
                    height={50}
                    className="h-12 w-auto object-contain"
                  />
                  <h3 className="text-xl font-extrabold text-stone-900 font-display">
                    {authView === "login" && "Iniciar Sesión"}
                    {authView === "register" && "Crear una Cuenta"}
                    {authView === "forgot" && "Recuperar Contraseña"}
                  </h3>
                  <p className="text-xs text-stone-500 max-w-xs leading-normal">
                    {authView === "login" && "Ingresa tus datos para acceder a tu intranet de lavandería."}
                    {authView === "register" && "Regístrate para solicitar retiros express y revisar tu historial."}
                    {authView === "forgot" && "Ingresa tu correo y te enviaremos un enlace de recuperación."}
                  </p>
                </div>

                {/* Form Logic */}
                <AnimatePresence mode="wait">
                  {authSuccess ? (
                    <motion.div
                      key="auth-success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-8 text-center space-y-4 flex flex-col items-center justify-center"
                    >
                      <CheckCircle2 className="w-12 h-12 text-green-500 animate-bounce" />
                      <div>
                        <h4 className="text-lg font-bold text-stone-900">
                          {authView === "login" && "¡Acceso Exitoso!"}
                          {authView === "register" && "¡Registro Completado!"}
                          {authView === "forgot" && "¡Enlace Enviado!"}
                        </h4>
                        <p className="text-xs text-stone-500 mt-1 max-w-[240px] mx-auto">
                          {authView === "login" && "Redireccionando a tu intranet..."}
                          {authView === "register" && "Ya puedes iniciar sesión con tu cuenta."}
                          {authView === "forgot" && "Revisa tu bandeja de entrada o carpeta de spam."}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form
                      key={authView}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onSubmit={handleAuthSubmit}
                      className="space-y-4"
                      noValidate // Disable browser validation balloons
                    >
                      {authError && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-755 text-xs font-semibold rounded-xl">
                          {authError}
                        </div>
                      )}

                      {/* Register-only fields */}
                      {authView === "register" && (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600">Nombre</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Juan"
                                  value={authName}
                                  onChange={(e) => setAuthName(e.target.value)}
                                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-850 placeholder-stone-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-sm font-medium"
                                />
                                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600">Apellido</label>
                              <input
                                type="text"
                                placeholder="Pérez"
                                value={authApellido}
                                onChange={(e) => setAuthApellido(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-850 placeholder-stone-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-sm font-medium"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600">RUT</label>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="12.345.678-9"
                                value={authRut}
                                onChange={(e) => setAuthRut(formatRut(e.target.value))}
                                className={`w-full pl-10 pr-9 py-3 rounded-xl border bg-stone-50/50 text-stone-850 placeholder-stone-400 focus:outline-none focus:bg-white transition-all text-sm font-medium ${
                                  rutTouched ? (rutValid ? "border-green-300 focus:border-green-500" : "border-red-300 focus:border-red-500") : "border-stone-200 focus:border-brand-500"
                                }`}
                              />
                              <IdCard className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                              {rutTouched && (
                                rutValid ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-red-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                                )
                              )}
                            </div>
                            {rutTouched && (
                              <p className={`text-[11px] font-semibold ${rutValid ? "text-green-600" : "text-red-500"}`}>
                                {rutValid ? "RUT válido" : "RUT inválido"}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600">Teléfono</label>
                            <div className="relative">
                              <input
                                type="tel"
                                placeholder="+56 9 1234 5678"
                                value={authTelefono}
                                onChange={(e) => setAuthTelefono(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-850 placeholder-stone-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-sm font-medium"
                              />
                              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600">Dirección</label>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Av. Siempre Viva 123, Calama"
                                value={authDireccion}
                                onChange={(e) => setAuthDireccion(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-850 placeholder-stone-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-sm font-medium"
                              />
                              <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Common Email Input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600">Correo Electrónico</label>
                        <div className="relative">
                          <input
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-850 placeholder-stone-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-sm font-medium"
                          />
                          <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      {/* Password input for Login / Register */}
                      {authView !== "forgot" && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600">Contraseña</label>
                            {authView === "login" && (
                              <button
                                type="button"
                                onClick={() => setAuthView("forgot")}
                                className="text-[10px] font-bold text-brand-650 hover:text-brand-700 transition-colors cursor-pointer"
                              >
                                ¿Olvidaste tu contraseña?
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              type="password"
                              placeholder="••••••••"
                              value={authPassword}
                              onChange={(e) => setAuthPassword(e.target.value)}
                              className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-stone-50/50 text-stone-850 placeholder-stone-400 focus:outline-none focus:bg-white transition-all text-sm font-medium ${
                                authView === "register" && authPassword
                                  ? (passwordCheck.valid ? "border-green-300 focus:border-green-500" : "border-red-300 focus:border-red-500")
                                  : "border-stone-200 focus:border-brand-500"
                              }`}
                            />
                            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          </div>
                          {authView === "register" && authPassword && (
                            <p className={`text-[11px] font-semibold ${passwordCheck.valid ? "text-green-600" : "text-red-500"}`}>
                              {passwordCheck.message}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Confirm Password input for Register */}
                      {authView === "register" && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600">Confirmar Contraseña</label>
                          <div className="relative">
                            <input
                              type="password"
                              placeholder="••••••••"
                              value={authConfirmPass}
                              onChange={(e) => setAuthConfirmPass(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-850 placeholder-stone-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-sm font-medium"
                            />
                            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          </div>
                          {authConfirmPass && authConfirmPass !== authPassword && (
                            <p className="text-[11px] font-semibold text-red-500">Las contraseñas no coinciden</p>
                          )}
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-brand text-white py-3 rounded-xl font-bold text-sm shadow-premium hover:shadow-lg disabled:opacity-50 transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                      >
                        {authLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            {authView === "login" && "Ingresar"}
                            {authView === "register" && "Registrarse"}
                            {authView === "forgot" && "Enviar Instrucciones"}
                          </>
                        )}
                      </button>

                      {/* Footer Actions (Toggles) */}
                      <div className="pt-4 border-t border-stone-100 flex flex-col items-center gap-2 text-xs">
                        {authView === "login" && (
                          <p className="text-stone-500">
                            ¿No tienes cuenta?{" "}
                            <button
                              type="button"
                              onClick={() => {
                                setAuthView("register");
                                setAuthError("");
                              }}
                              className="text-brand-650 hover:underline font-bold cursor-pointer"
                            >
                              Regístrate
                            </button>
                          </p>
                        )}
                        {authView === "register" && (
                          <p className="text-stone-500">
                            ¿Ya tienes cuenta?{" "}
                            <button
                              type="button"
                              onClick={() => {
                                setAuthView("login");
                                setAuthError("");
                              }}
                              className="text-brand-650 hover:underline font-bold cursor-pointer"
                            >
                              Inicia Sesión
                            </button>
                          </p>
                        )}
                        {authView === "forgot" && (
                          <button
                            type="button"
                            onClick={() => {
                              setAuthView("login");
                              setAuthError("");
                            }}
                            className="text-brand-650 hover:underline font-bold cursor-pointer"
                          >
                            Volver al Login
                          </button>
                        )}
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
