import { useState, useEffect } from "react";

// ══════════════════════════════════════════════════════════════════════════════
//  CONFIGURACIÓN — ÚNICO LUGAR QUE TENÉS QUE EDITAR
//  Pegá acá la URL de tu Google Apps Script después de desplegarlo
// ══════════════════════════════════════════════════════════════════════════════
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyRbFclb7AT8xwqOR3KaNTGdjpLjGduLEsEVTKshih7f-jZvCs1Iixu1apDgtwrloNg/exec";

// ─── DATOS ────────────────────────────────────────────────────────────────────
const CHOFERES = ["Carlos Méndez", "Laura Gómez", "Marcos Díaz", "Roberto Silva", "Ana Torres"];
const PLANTAS  = ["Depósito Central", "Planta Sur"];

const ESTADOS = {
  PENDIENTE:  { label: "Pendiente",  color: "#F59E0B", bg: "#FEF3C7", icon: "⏳" },
  LLEGUE:     { label: "Llegué",     color: "#3B82F6", bg: "#DBEAFE", icon: "📍" },
  EN_VIAJE:   { label: "En Viaje",   color: "#8B5CF6", bg: "#EDE9FE", icon: "🚛" },
  FINALIZADO: { label: "Finalizado", color: "#10B981", bg: "#D1FAE5", icon: "✅" },
};

// ─── GOOGLE SHEETS — enviar registro ─────────────────────────────────────────
async function registrarEnSheets(accion, datos) {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === "PEGAR_URL_AQUI") return;
  try {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion, timestamp: new Date().toLocaleString("es-AR"), ...datos }),
    });
  } catch (e) {
    console.warn("Sheets no disponible:", e.message);
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
let contador = 1;
const nuevoId    = () => `V-${String(contador++).padStart(3, "0")}`;
const horaActual = () => new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

function Badge({ estado }) {
  const s = ESTADOS[estado];
  return (
    <span style={{ background: s.bg, color: s.color, padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
      {s.icon} {s.label}
    </span>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [perfil, setPerfil] = useState("chofer");
  const [chofer, setChofer] = useState(CHOFERES[0]);
  const [pin, setPin]       = useState("");
  const [error, setError]   = useState("");

  const handleLogin = () => {
    if (perfil === "coordinacion") {
      if (pin !== "1234") { setError("PIN incorrecto"); return; }
      onLogin({ perfil: "coordinacion", nombre: "Coordinación" });
    } else {
      onLogin({ perfil: "chofer", nombre: chofer });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Nunito', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>
      <div style={{ background: "#fff", borderRadius: 24, padding: 36, width: "100%", maxWidth: 400, boxShadow: "0 4px 40px rgba(0,0,0,0.08)", border: "1px solid #E2E8F0" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, #1E40AF, #3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 12px", boxShadow: "0 8px 20px rgba(59,130,246,0.3)" }}>🚚</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#0F172A" }}>TranspoApp</div>
          <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 3 }}>Sistema de Viajes</div>
        </div>
        <div style={{ display: "flex", background: "#F1F5F9", borderRadius: 12, padding: 4, marginBottom: 24, gap: 4 }}>
          {[["chofer", "🧑‍✈️ Chofer"], ["coordinacion", "🗂️ Coordinación"]].map(([val, label]) => (
            <button key={val} onClick={() => { setPerfil(val); setError(""); setPin(""); }}
              style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", background: perfil === val ? "#fff" : "transparent", color: perfil === val ? "#1E40AF" : "#94A3B8", boxShadow: perfil === val ? "0 2px 8px rgba(0,0,0,0.08)" : "none" }}>{label}</button>
          ))}
        </div>
        {perfil === "chofer" ? (
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>Seleccioná tu nombre</label>
            <select value={chofer} onChange={e => setChofer(e.target.value)}
              style={{ width: "100%", marginTop: 8, padding: "11px 14px", borderRadius: 11, border: "1.5px solid #E2E8F0", fontSize: 14, fontFamily: "inherit", color: "#0F172A", background: "#F8FAFC", outline: "none", cursor: "pointer" }}>
              {CHOFERES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        ) : (
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>PIN de acceso</label>
            <input type="password" value={pin} onChange={e => { setPin(e.target.value); setError(""); }} placeholder="••••"
              style={{ width: "100%", marginTop: 8, padding: "11px 14px", borderRadius: 11, border: `1.5px solid ${error ? "#EF4444" : "#E2E8F0"}`, fontSize: 18, fontFamily: "inherit", color: "#0F172A", background: "#F8FAFC", outline: "none", letterSpacing: 6, boxSizing: "border-box" }} />
            {error && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 5 }}>{error}</div>}
            <div style={{ fontSize: 11, color: "#CBD5E1", marginTop: 5 }}>PIN de demo: 1234</div>
          </div>
        )}
        <button onClick={handleLogin}
          style={{ width: "100%", marginTop: 22, padding: "13px 0", borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #1E40AF, #3B82F6)", color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: "inherit", boxShadow: "0 4px 16px rgba(59,130,246,0.35)" }}>
          Ingresar →
        </button>
      </div>
    </div>
  );
}

// ─── FORMULARIO NUEVO VIAJE ───────────────────────────────────────────────────
function FormNuevoViaje({ onAgregar, onClose }) {
  const hoy = new Date().toISOString().split("T")[0];
  const [f, setF]     = useState({ fecha: hoy, hora: "08:00", chofer: CHOFERES[0], patente: "", origen: PLANTAS[0] });
  const [err, setErr] = useState({});
  const set = (k, v)  => setF(p => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!f.patente.trim()) { setErr({ patente: "Requerido" }); return; }
    const viaje = { id: nuevoId(), ...f, patente: f.patente.toUpperCase(), estado: "PENDIENTE", updatedAt: null };
    onAgregar(viaje);
    onClose();
  };

  const campo = (key, label, type = "text", placeholder = "", isSelect = false, opciones = [], full = false) => (
    <div style={{ gridColumn: full ? "1/-1" : undefined }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>{label}</label>
      {isSelect ? (
        <select value={f[key]} onChange={e => set(key, e.target.value)}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 13, fontFamily: "inherit", color: "#0F172A", background: "#F8FAFC", outline: "none", boxSizing: "border-box" }}>
          {opciones.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={f[key]} onChange={e => { set(key, e.target.value); setErr({}); }} placeholder={placeholder}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${err[key] ? "#EF4444" : "#E2E8F0"}`, fontSize: 13, fontFamily: "inherit", color: "#0F172A", background: "#F8FAFC", outline: "none", boxSizing: "border-box" }} />
      )}
      {err[key] && <div style={{ fontSize: 11, color: "#EF4444", marginTop: 3 }}>{err[key]}</div>}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 19, fontWeight: 900, color: "#0F172A" }}>Nuevo Viaje</div>
            <div style={{ fontSize: 12, color: "#94A3B8" }}>Completá todos los datos</div>
          </div>
          <button onClick={onClose} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 14, color: "#64748B" }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {campo("fecha",   "Fecha de carga",   "date")}
          {campo("hora",    "Hora de carga",    "time")}
          {campo("chofer",  "Chofer",           "text", "", true, CHOFERES)}
          {campo("patente", "Patente",          "text", "Ej: ABC-123")}
          {campo("origen",  "Planta de origen", "text", "", true, PLANTAS, true)}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 11, background: "#F1F5F9", border: "none", color: "#64748B", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>Cancelar</button>
          <button onClick={handleSubmit} style={{ flex: 2, padding: "11px 0", borderRadius: 11, background: "linear-gradient(135deg, #1E40AF, #3B82F6)", border: "none", color: "#fff", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>🚚 Crear Viaje</button>
        </div>
      </div>
    </div>
  );
}

// ─── VISTA COORDINACIÓN ───────────────────────────────────────────────────────
function VistaCoordinacion({ viajes, onAgregar, onLogout }) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const sheetsActivo = APPS_SCRIPT_URL !== "PEGAR_URL_AQUI";

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Nunito', sans-serif" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "0 20px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🗂️</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: 15, color: "#0F172A" }}>Coordinación</div>
              <div style={{ fontSize: 11, color: sheetsActivo ? "#059669" : "#F59E0B" }}>
                {sheetsActivo ? "🟢 Google Sheets conectado" : "🟡 Modo demo — sin Google Sheets"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setMostrarForm(true)}
              style={{ padding: "7px 16px", borderRadius: 9, background: "linear-gradient(135deg, #1E40AF, #3B82F6)", border: "none", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              + Nuevo Viaje
            </button>
            <button onClick={onLogout}
              style={{ padding: "7px 12px", borderRadius: 9, background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#94A3B8", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              Salir
            </button>
          </div>
        </div>
      </div>

      {!sheetsActivo && (
        <div style={{ background: "#FEF3C7", borderBottom: "1px solid #FCD34D", padding: "10px 20px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", fontSize: 12, color: "#92400E", fontFamily: "'Nunito', sans-serif" }}>
            ⚠️ <strong>Modo demo</strong> — Los datos no se guardan todavía. Seguí la guía paso a paso para conectar Google Sheets.
          </div>
        </div>
      )}

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px" }}>
        {viajes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 16, border: "1.5px dashed #E2E8F0" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🚚</div>
            <div style={{ fontWeight: 700, color: "#64748B" }}>No hay viajes creados</div>
            <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>Creá el primer viaje con el botón de arriba</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {viajes.map(v => (
              <div key={v.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #E2E8F0", padding: "16px 20px", borderLeft: `4px solid ${ESTADOS[v.estado].color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 12, color: "#94A3B8", fontWeight: 700 }}>{v.id}</span>
                      <Badge estado={v.estado} />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A" }}>{v.chofer}</div>
                    <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>🚘 {v.patente} &nbsp;·&nbsp; 📅 {v.fecha} a las {v.hora}</div>
                    <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>📦 Origen: {v.origen}</div>
                  </div>
                  {v.updatedAt && <div style={{ fontSize: 11, color: "#CBD5E1", textAlign: "right" }}>Actualizado<br />{v.updatedAt}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {mostrarForm && <FormNuevoViaje onAgregar={onAgregar} onClose={() => setMostrarForm(false)} />}
    </div>
  );
}

// ─── VISTA CHOFER ─────────────────────────────────────────────────────────────
function VistaChofer({ usuario, viajes, onActualizar, onLogout }) {
  const misViajes   = viajes.filter(v => v.chofer === usuario.nombre && v.estado !== "FINALIZADO");
  const finalizados = viajes.filter(v => v.chofer === usuario.nombre && v.estado === "FINALIZADO");
  const BTNS = [
    { estado: "LLEGUE",     label: "📍  Llegué",     bg: "#1D4ED8", shadow: "rgba(29,78,216,0.4)"  },
    { estado: "EN_VIAJE",   label: "🚛  En Viaje",   bg: "#7C3AED", shadow: "rgba(124,58,237,0.4)" },
    { estado: "FINALIZADO", label: "✅  Finalizado",  bg: "#059669", shadow: "rgba(5,150,105,0.4)"  },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F0F4FF", fontFamily: "'Nunito', sans-serif" }}>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ background: "linear-gradient(135deg, #1E3A8A, #1E40AF)", padding: "20px 20px 28px", color: "#fff" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 2 }}>Bienvenido,</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{usuario.nombre}</div>
            </div>
            <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 9, padding: "7px 13px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Salir</button>
          </div>
          <div style={{ marginTop: 14, fontSize: 13, opacity: 0.75 }}>🚚 {misViajes.length} viaje{misViajes.length !== 1 ? "s" : ""} pendiente{misViajes.length !== 1 ? "s" : ""}</div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px" }}>
        {misViajes.length === 0 && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "40px 20px", textAlign: "center", border: "1.5px solid #E2E8F0", animation: "slideUp 0.4s ease" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#0F172A" }}>Sin viajes asignados</div>
            <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 6 }}>No tenés viajes pendientes por ahora</div>
          </div>
        )}
        {misViajes.map((v, i) => (
          <div key={v.id} style={{ background: "#fff", borderRadius: 18, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflow: "hidden", marginBottom: 16, animation: `slideUp 0.4s ease ${i * 0.08}s both`, border: "1.5px solid #E2E8F0" }}>
            <div style={{ height: 5, background: `linear-gradient(90deg, ${ESTADOS[v.estado].color}, ${ESTADOS[v.estado].color}88)` }} />
            <div style={{ padding: "20px 20px 8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: 0.5 }}>VIAJE </span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748B", fontFamily: "monospace" }}>{v.id}</span>
                </div>
                <Badge estado={v.estado} />
              </div>
              <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px", marginBottom: 14, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Planta de origen</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#0F172A" }}>📦 {v.origen}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 6 }}>
                {[["📅","Fecha",v.fecha],["⏰","Hora",v.hora],["🚘","Patente",v.patente]].map(([icon,label,val]) => (
                  <div key={label} style={{ background: "#F8FAFC", borderRadius: 10, padding: "10px 12px", border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 10, color: "#94A3B8", marginBottom: 2 }}>{icon} {label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: "12px 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Actualizar estado</div>
              {BTNS.map(btn => {
                const esActual = v.estado === btn.estado;
                return (
                  <button key={btn.estado} onClick={() => !esActual && onActualizar(v.id, btn.estado)} disabled={esActual}
                    style={{ width: "100%", padding: "15px 20px", borderRadius: 13, border: "none", fontFamily: "inherit", fontWeight: 800, fontSize: 16, cursor: esActual ? "default" : "pointer", transition: "all 0.2s", background: esActual ? btn.bg : "#F1F5F9", color: esActual ? "#fff" : "#64748B", boxShadow: esActual ? `0 6px 20px ${btn.shadow}` : "none", transform: esActual ? "scale(1.01)" : "scale(1)" }}>
                    {btn.label}{esActual && <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.8 }}>← Estado actual</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {finalizados.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Viajes finalizados hoy</div>
            {finalizados.map(v => (
              <div key={v.id} style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", border: "1.5px solid #D1FAE5", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>📦 {v.origen}</div>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{v.id} · {v.hora}</div>
                </div>
                <Badge estado="FINALIZADO" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [viajes,  setViajes]  = useState([]);

  const agregarViaje = async (viaje) => {
    setViajes(p => [viaje, ...p]);
    await registrarEnSheets("NUEVO_VIAJE", {
      id: viaje.id, chofer: viaje.chofer, patente: viaje.patente,
      origen: viaje.origen, fecha: viaje.fecha, hora: viaje.hora, estado: "Pendiente",
    });
  };

  const actualizarEstado = async (id, estado) => {
    const hora  = horaActual();
    const viaje = viajes.find(v => v.id === id);
    setViajes(p => p.map(v => v.id === id ? { ...v, estado, updatedAt: hora } : v));
    if (viaje) {
      await registrarEnSheets("CAMBIO_ESTADO", {
        id, chofer: viaje.chofer, patente: viaje.patente, origen: viaje.origen,
        fecha: viaje.fecha, estadoAnterior: ESTADOS[viaje.estado].label,
        estadoNuevo: ESTADOS[estado].label, horaActualizacion: hora,
      });
    }
  };

  if (!usuario) return <Login onLogin={setUsuario} />;
  if (usuario.perfil === "coordinacion")
    return <VistaCoordinacion viajes={viajes} onAgregar={agregarViaje} onLogout={() => setUsuario(null)} />;
  return <VistaChofer usuario={usuario} viajes={viajes} onActualizar={actualizarEstado} onLogout={() => setUsuario(null)} />;
}
