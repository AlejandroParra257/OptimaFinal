import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import RealtimeChart from "./components/RealtimeChart";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import UpgradeToVip from './pages/UpgradeToVip';
import PagoExitoso from './pages/PagoExitoso';
import PagoFallido from './pages/PagoFallido';
import PagoPendiente from './pages/PagoPendiente';
import fondoApp from './assets/5s.jpg';

/* Imports de Chart.js */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

// ============================================
// SERVICIO API
// ============================================
const API_URL = "https://optimafinal.onrender.com";

const api = {
  async getEntries(token) {
    const res = await fetch(`${API_URL}/entries`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
    return res.json();
  },

  async createEntry(entry, token) {
    const res = await fetch(`${API_URL}/entries`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
    return res.json();
  },

  async deleteEntry(id, token) {
    const res = await fetch(`${API_URL}/entries/${id}`, {
      method: "DELETE",
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
    return res.json();
  },

  async createEntryCheck(check, token) {
    const res = await fetch(`${API_URL}/entry_checks`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(check),
    });
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
    return res.json();
  },

  async getSummary(token) {
    const res = await fetch(`${API_URL}/report/summary`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
    return res.json();
  },
};

// ============================================
// CONSTANTES
// ============================================

const S_ITEMS = [
  { key: "seiri", label: "Seiri (Clasificar)", checks: ["Eliminar lo innecesario", "Separar lo esencial"], color: "#ff9800" },
  { key: "seiton", label: "Seiton (Ordenar)", checks: ["Etiquetado claro", "Ubicación definida"], color: "#2196F3" },
  { key: "seiso", label: "Seiso (Limpieza)", checks: ["Rutinas de limpieza", "Registro fotográfico"], color: "#4CAF50" },
  { key: "seiketsu", label: "Seiketsu (Estandarizar)", checks: ["Procedimientos escritos", "Checklist estándar"], color: "#9C27B0" },
  { key: "shitsuke", label: "Shitsuke (Disciplina)", checks: ["Capacitación", "Revisión periódica"], color: "#F44336" },
];

const VIDEOS_APOYO = [
  { title: "5S - ¿Qué son las 5S?", url: "https://www.youtube.com/watch?v=TIluVXT0c1s" },
  { title: "Cómo aplicar 5S en áreas administrativas", url: "https://www.youtube.com/watch?v=IvXRjf1AR4s" },
  { title: "5s también en oficinas", url: "https://www.youtube.com/watch?v=KM9rFeK5zFw" },
  { title: "¿Cómo implantar las 5S? Retos y Etapas", url: "https://www.youtube.com/watch?v=mPE7PrVR3t8" },
  { title: "5S en puesto de trabajo de oficinas", url: "https://www.youtube.com/watch?v=c6xSJd22wNk" },
  { title: "Cómo aplicar la metodología 5s en el escritorio de PC", url: "https://www.youtube.com/watch?v=qcei-pW0mIw" },
  { title: "5S en oficinas - Caso de éxito", url: "https://www.youtube.com/watch?v=cYPf_SItZNQ" },
  { title: "Metodología 5S paso a paso", url: "https://www.youtube.com/watch?v=GnrwQ3vdopA" },
  { title: "Implementación de 5S en empresas", url: "https://www.youtube.com/watch?v=CK1-AFZxc9c" },
  { title: "5S - Mejora continua", url: "https://www.youtube.com/watch?v=GW_LTbKUBsg" },
];

const PLANTILLAS_APOYO = [
  { title: "Drive - Plantillas 5S", url: "https://drive.google.com/drive/folders/1ohX_FDypjap78VO0WUUFfzrMzEgJ5W3g?usp=sharing", type: "Google Drive" },
  { title: "Auditoría 5S en Excel", url: "https://es.justexw.com/plantillas/auditoria-5s-en-excel", type: "Excel" },
  { title: "Plantillas Excel - Juegos y simuladores", url: "https://www.excelaplicado.com/plantillas-excel-juegos-y-simuladores", type: "Excel" },
  { title: "Presentación - Guía 5S", url: "https://docs.google.com/presentation/d/1RVn-DKKWIf19kJ0ousPX33xzbJ7UmhdF/edit?usp=drive_link", type: "Google Slides" },
  { title: "Documento - Checklist 5S", url: "https://docs.google.com/document/d/1Q2lr-90ju9M7Sum2yaeul9BbhDv24lkH/edit?usp=drive_link", type: "Google Docs" },
  { title: "Presentación - Auditoría 5S", url: "https://docs.google.com/presentation/d/11zy3NAHkjPSPZymDNMI2m1xHEk5oX0q2/edit?usp=drive_link", type: "Google Slides" },
];

function uid() {
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2, 9);
}

function formatDate(ts = Date.now()) {
  return new Date(ts).toLocaleString();
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function downscaleImage(file, maxSide = 1280, quality = 0.8) {
  const dataUrl = await fileToDataURL(file);
  const img = new Image();
  return await new Promise((resolve, reject) => {
    img.onload = () => {
      const { width, height } = img;
      const scale = Math.min(1, maxSide / Math.max(width, height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const out = canvas.toDataURL("image/jpeg", quality);
      resolve(out);
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// ============================================
// CHATBOT
// ============================================

const ChatbotFaq = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hola Soy tu asistente de la app 5S OPTIMA. Selecciona una pregunta para conocer más:', isTyping: false }
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const qaList = [
    { question: "¿Cómo usar esta aplicación?", answer: "¿CÓMO USAR LA APLICACIÓN 5S OPTIMA?\n\nPaso a paso:\n\n1. Selecciona una S (panel izquierdo)\n2. Marca los checks que aplican\n3. Agrega evidencia (notas y foto)\n4. Guarda la entrada\n5. Revisa tu progreso en el gráfico" },
    { question: "¿Qué es Seiri (Clasificar)?", answer: "SEIRI (CLASIFICAR)\n\nSeparar lo necesario de lo innecesario.\n\nChecks: Eliminar lo innecesario, Separar lo esencial." },
    { question: "¿Qué es Seiton (Ordenar)?", answer: "SEITON (ORDENAR)\n\nUn lugar para cada cosa y cada cosa en su lugar.\n\nChecks: Etiquetado claro, Ubicación definida." },
    { question: "¿Qué es Seiso (Limpieza)?", answer: "SEISO (LIMPIEZA)\n\nMantener limpio el entorno de trabajo.\n\nChecks: Rutinas de limpieza, Registro fotográfico." },
    { question: "¿Qué es Seiketsu (Estandarizar)?", answer: "SEIKETSU (ESTANDARIZAR)\n\nCrear procedimientos para mantener las primeras 3S.\n\nChecks: Procedimientos escritos, Checklist estándar." },
    { question: "¿Qué es Shitsuke (Disciplina)?", answer: "SHITSUKE (DISCIPLINA)\n\nConvertir en hábito el cumplimiento de los estándares.\n\nChecks: Capacitación, Revisión periódica." },
    { question: "¿Cómo agregar fotos?", answer: "¿CÓMO AGREGAR FOTOS?\n\n1. Haz clic en 'Elegir archivo'\n2. Selecciona una imagen (máx 10MB)\n3. Se redimensionará automáticamente\n4. Verás una vista previa" },
    { question: "¿Cómo exportar a PDF?", answer: "¿CÓMO EXPORTAR A PDF?\n\nHaz clic en el botón 'Exportar PDF' en la esquina superior derecha. Se descargará automáticamente." },
    { question: "¿Cómo eliminar entradas?", answer: "¿CÓMO ELIMINAR ENTRADAS?\n\nVe a 'Entradas recientes', busca la entrada y haz clic en el botón rojo 'Eliminar'." },
    { question: "¿Qué roles existen?", answer: "ROLES EN LA APLICACIÓN\n\nAdministrador: Acceso completo\nSupervisor: Puede crear y eliminar entradas\nEmpleado: Solo puede crear entradas" },
    { question: "¿Qué significa el gráfico?", answer: "GRÁFICO DE ESTADO GENERAL\n\nMuestra el porcentaje de cumplimiento de cada S. Se actualiza automáticamente al guardar nuevas entradas." }
  ];

  const typeWriter = (text, messageId, speed = 15) => {
    let i = 0;
    const result = [];
    const interval = setInterval(() => {
      if (i < text.length) {
        result.push(text[i]);
        setMessages(prev => prev.map((msg, idx) => idx === messageId ? { ...msg, text: result.join('') } : msg));
        i++;
        scrollToBottom();
      } else {
        clearInterval(interval);
        setIsBotTyping(false);
        setMessages(prev => prev.map((msg, idx) => idx === messageId ? { ...msg, isTyping: false } : msg));
      }
    }, speed);
  };

  const handleQuestionClick = (qa) => {
    setMessages(prev => [...prev, { type: 'user', text: qa.question, isTyping: false }]);
    setIsBotTyping(true);
    const botMessageIndex = messages.length + 1;
    setMessages(prev => [...prev, { type: 'bot', text: '', isTyping: true }]);
    setTimeout(() => typeWriter(qa.answer, botMessageIndex, 15), 400);
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      <div className="chatbot-header">
        <h4>Asistente 5S</h4>
        <button onClick={onClose} className="chatbot-close">×</button>
      </div>
      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.type}`}>
            <div className="message-text">{msg.text}</div>
          </div>
        ))}
        {isBotTyping && (
          <div className="message bot">
            <div className="typing-indicator"><span></span><span></span><span></span></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbot-questions-area">
        <p className="questions-title">Preguntas disponibles:</p>
        <div className="questions-grid">
          {qaList.map((qa, index) => (
            <button key={index} className="question-button" onClick={() => handleQuestionClick(qa)} disabled={isBotTyping}>
              {qa.question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const App5S = () => {
  const [role, setRole] = useState("Empleado");
  const [entries, setEntries] = useState([]);
  const [activeS, setActiveS] = useState(S_ITEMS[0].key);
  const [selectedSForSeiri, setSelectedSForSeiri] = useState("");
  const [seiriChecks, setSeiriChecks] = useState([]);
  const [seiriChecksState, setSeiriChecksState] = useState({});
  const [note, setNote] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoInputRef = useRef(null);
  const [isChangingSection, setIsChangingSection] = useState(false);
  const [loading, setLoading] = useState({ entries: false, save: false, delete: false, summary: false, pdf: false });
  const [summaryByS, setSummaryByS] = useState(() => {
    const base = {};
    S_ITEMS.forEach((s) => (base[s.key] = { label: s.label, ok: 0, total: 0 }));
    return base;
  });
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");
  const [trash, setTrash] = useState([]);
  const [showTrash, setShowTrash] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const loadEntries = async () => {
    try {
      setLoading(prev => ({ ...prev, entries: true }));
      const token = localStorage.getItem('token');
      const data = await api.getEntries(token);
      setEntries(data);
    } catch (err) {
      console.error("Error:", err);
      setError("No se pudieron cargar las entradas.");
    } finally {
      setLoading(prev => ({ ...prev, entries: false }));
    }
  };

  const loadSummary = async () => {
    try {
      setLoading(prev => ({ ...prev, summary: true }));
      const token = localStorage.getItem('token');
      const data = await api.getSummary(token);
      const next = {};
      S_ITEMS.forEach((s) => {
        const row = data.find((r) => r.sKey === s.key);
        next[s.key] = { label: s.label, ok: row ? Number(row.ok || 0) : 0, total: row ? Number(row.total || 0) : 0 };
      });
      setSummaryByS(next);
    } catch (err) {
      console.error("Error:", err);
      setError("No se pudo cargar el resumen.");
    } finally {
      setLoading(prev => ({ ...prev, summary: false }));
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta entrada?")) return;
    try {
      setLoading(prev => ({ ...prev, delete: true }));
      const token = localStorage.getItem('token');
      await api.deleteEntry(id, token);
      setEntries(prev => prev.filter(entry => entry.id !== id));
      await loadSummary();
    } catch (err) {
      console.error("Error:", err);
      setError("No se pudo eliminar la entrada.");
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const moveToTrash = (entry) => {
    setTrash(prev => [...prev, { ...entry, deletedAt: Date.now() }]);
    setEntries(prev => prev.filter(e => e.id !== entry.id));
    alert("Entrada movida a la papelera. Se eliminará después de 30 días.");
  };

  const restoreFromTrash = (entry) => {
    const { deletedAt, ...restoredEntry } = entry;
    setEntries(prev => [...prev, restoredEntry]);
    setTrash(prev => prev.filter(e => e.id !== entry.id));
    alert("Entrada restaurada.");
  };

  const permanentDeleteFromTrash = async (entry) => {
    if (window.confirm("¿Eliminar definitivamente?")) {
      try {
        const token = localStorage.getItem('token');
        await api.deleteEntry(entry.id, token);
        setTrash(prev => prev.filter(e => e.id !== entry.id));
        alert("Entrada eliminada.");
      } catch (err) {
        console.error("Error:", err);
        alert("Error al eliminar.");
      }
    }
  };

  useEffect(() => {
    const cleanTrash = () => {
      const now = Date.now();
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      const expired = trash.filter(entry => now - entry.deletedAt >= THIRTY_DAYS);
      if (expired.length) {
        expired.forEach(async (entry) => {
          try {
            const token = localStorage.getItem('token');
            await api.deleteEntry(entry.id, token);
          } catch (err) { console.error(err); }
        });
        setTrash(prev => prev.filter(entry => now - entry.deletedAt < THIRTY_DAYS));
      }
    };
    cleanTrash();
  }, [trash]);

  const validateSeiriForm = () => {
    if (Object.values(seiriChecksState).every(v => v === false)) {
      alert("Debes marcar al menos un check");
      return false;
    }
    return true;
  };

  const clearSeiriForm = () => {
    setNote("");
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
    const resetState = {};
    seiriChecks.forEach((_, idx) => { resetState[idx] = false; });
    setSeiriChecksState(resetState);
  };

  const handleSeiriSChange = (sKey) => {
    setSelectedSForSeiri(sKey);
    const selectedS = S_ITEMS.find(s => s.key === sKey);
    if (selectedS) {
      setSeiriChecks(selectedS.checks);
      const resetState = {};
      selectedS.checks.forEach((_, idx) => { resetState[idx] = false; });
      setSeiriChecksState(resetState);
    } else {
      setSeiriChecks([]);
      setSeiriChecksState({});
    }
  };

  const handleSeiriToggleCheck = (idx) => {
    setSeiriChecksState(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSaveSeiriEntry = async () => {
    if (!selectedSForSeiri) {
      alert("Selecciona una S");
      return;
    }
    if (!validateSeiriForm()) return;
    const selectedSItem = S_ITEMS.find(s => s.key === selectedSForSeiri);
    try {
      setLoading(prev => ({ ...prev, save: true }));
      const entryId = uid();
      const now = new Date().toISOString();
      const newEntry = {
        id: entryId,
        sKey: selectedSForSeiri,
        sLabel: selectedSItem.label,
        note: note.trim(),
        photo: photoPreview,
        authorRole: role,
        createdAt: now,
      };
      const token = localStorage.getItem('token');
      await api.createEntry(newEntry, token);
      const checks = Object.entries(seiriChecksState).map(([idx, val]) => val ? api.createEntryCheck({
        entry_id: entryId,
        check_label: selectedSItem.checks[idx],
        ok: val,
      }, token) : null).filter(p => p);
      await Promise.all(checks);
      clearSeiriForm();
      setSelectedSForSeiri("");
      setSeiriChecks([]);
      await Promise.all([loadEntries(), loadSummary()]);
      alert("Entrada guardada");
    } catch (err) {
      console.error(err);
      setError("Error al guardar");
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const compressImageForPDF = async (dataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width, height = img.height;
        const maxDim = 800;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = (maxDim / width) * height; width = maxDim; }
          else { width = (maxDim / height) * width; height = maxDim; }
        }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = dataUrl;
    });
  };

  const exportPDF = async () => {
    try {
      setLoading(prev => ({ ...prev, pdf: true }));
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("Reporte 5S OPTIMA", 14, 22);
      doc.setFontSize(12);
      doc.text(`Generado: ${formatDate()}`, 14, 32);
      doc.text(`Rol: ${role}`, 14, 40);
      const summaryData = Object.values(summaryByS).map(s => [s.label, `${s.ok}/${s.total}`, s.total > 0 ? `${Math.round((s.ok / s.total) * 100)}%` : "0%"]);
      autoTable(doc, { head: [["Sección", "Cumplimiento", "Porcentaje"]], body: summaryData, startY: 50, theme: "grid", headStyles: { fillColor: [26, 59, 92] } });
      if (entries.length) {
        doc.addPage();
        doc.text("Entradas Recientes", 14, 22);
        let y = 32;
        for (let i = 0; i < Math.min(entries.length, 5); i++) {
          const e = entries[i];
          if (y > 250) { doc.addPage(); y = 20; }
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text(`${i + 1}. ${e.sLabel || "Sin etiqueta"}`, 14, y);
          y += 6;
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text(`Fecha: ${formatDate(e.createdAt)}`, 20, y); y += 5;
          doc.text(`Autor: ${e.authorRole || "Desconocido"}`, 20, y); y += 5;
          if (e.note?.trim()) {
            const notas = doc.splitTextToSize(`Notas: ${e.note}`, 170);
            doc.text(notas, 20, y);
            y += notas.length * 5 + 2;
          }
          if (e.photo) {
            try {
              const compressed = await compressImageForPDF(e.photo);
              const img = new Image();
              await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = compressed; });
              let w = img.width, h = img.height;
              if (w > 80) { h = (80 / w) * h; w = 80; }
              if (h > 60) { w = (60 / h) * w; h = 60; }
              doc.addImage(compressed, 'JPEG', 20, y, w, h);
              y += h + 10;
            } catch (err) { doc.text("(Imagen no disponible)", 20, y); y += 5; }
          } else { doc.text("(Sin imagen)", 20, y); y += 5; }
          y += 5;
          if (i < Math.min(entries.length, 5) - 1) doc.line(14, y - 2, 196, y - 2);
        }
        if (entries.length > 5) doc.text(`... y ${entries.length - 5} entradas más`, 14, y + 5);
      }
      doc.save(`reporte-5s-${Date.now()}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error al generar PDF");
    } finally {
      setLoading(prev => ({ ...prev, pdf: false }));
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("Imagen muy grande (máx 10MB)"); return; }
    try {
      const resized = await downscaleImage(file);
      setPhotoPreview(resized);
    } catch (err) { alert("Error al procesar imagen"); }
  };

  const toggleSortOrder = () => setSortOrder(prev => prev === "desc" ? "asc" : "desc");
  const getSortedEntries = () => [...entries].sort((a, b) => sortOrder === "desc" ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt));

  useEffect(() => {
    loadEntries();
    loadSummary();
  }, []);

  useEffect(() => {
    setIsChangingSection(true);
    const timer = setTimeout(() => setIsChangingSection(false), 400);
    return () => clearTimeout(timer);
  }, [activeS]);

  useEffect(() => {
    const data = Object.values(summaryByS).map(s => ({ name: s.label, value: s.total > 0 ? Math.round((s.ok / s.total) * 100) : 0 }));
    setChartData(data);
  }, [summaryByS]);

  const currentItem = S_ITEMS.find(s => s.key === activeS);
  const sortedEntries = getSortedEntries();
  const isOnlyEntriesView = activeS === "seiton" || activeS === "seiso";
  const isSeiso = activeS === "seiso";
  const isSeiri = activeS === "seiri";
  const isSeiketsu = activeS === "seiketsu";
  const isShitsuke = activeS === "shitsuke";

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      backgroundImage: `url(${fondoApp})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      position: 'relative',
      margin: 0,
      padding: 0,
      overflowX: 'hidden'
    }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(5px)',
        zIndex: 0
      }} />
      
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        width: '100%',
        padding: '32px 48px',
        boxSizing: 'border-box'
      }}>
        <div style={{ width: '100%', margin: 0, padding: 0 }}>
          
          {/* HEADER */}
          <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            padding: '20px 32px',
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(12px)',
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0, color: '#1a3b5c', letterSpacing: '-0.3px' }}>
                5S OPTIMA
              </h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#5a6e8a', fontWeight: '500' }}>
                {user?.nombre || 'Usuario'} · Sistema de Gestión 5S
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                background: '#f0f2f5',
                borderRadius: '40px'
              }}>
                <span style={{ fontWeight: '500' }}>{user?.nombre}</span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 10px',
                  borderRadius: '20px',
                  background: user?.rol === 'admin' ? '#dc2626' : user?.rol === 'vip' ? '#10b981' : '#f59e0b',
                  color: 'white',
                  fontWeight: '600'
                }}>
                  {user?.rol === 'admin' ? 'Admin' : user?.rol === 'vip' ? 'VIP' : 'No VIP'}
                </span>
              </div>
              {user?.rol === 'admin' && (
                <button onClick={() => navigate('/admin')} style={{
                  padding: '8px 20px',
                  background: '#1e3a5f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '30px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.85rem'
                }}>
                  Panel Admin
                </button>
              )}
              <select value={role} onChange={(e) => setRole(e.target.value)} style={{
                padding: '8px 20px',
                borderRadius: '30px',
                border: '1px solid #e2e8f0',
                background: 'white',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: '600',
                color: '#1e293b'
              }}>
                <option value="Administrador">Administrador</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Empleado">Empleado</option>
              </select>
              <button onClick={exportPDF} disabled={loading.pdf} style={{
                padding: '8px 24px',
                background: '#1e3a5f',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                fontWeight: '600',
                cursor: loading.pdf ? 'not-allowed' : 'pointer',
                opacity: loading.pdf ? 0.6 : 1,
                fontSize: '0.85rem'
              }}>
                {loading.pdf ? "Generando..." : "Exportar PDF"}
              </button>
              <button onClick={logout} style={{
                padding: '8px 20px',
                background: 'transparent',
                color: '#dc2626',
                border: '1px solid #dc2626',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.85rem'
              }}>
                Cerrar sesión
              </button>
            </div>
          </header>

          {/* BANNER VIP */}
          {user?.rol === 'no_vip' && (
            <div style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              borderRadius: '20px',
              padding: '14px 28px',
              margin: '0 0 28px 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: 'white'
            }}>
              <span style={{ fontWeight: '500' }}>Eres usuario No VIP - Límite: 5 entradas por día</span>
              <button onClick={() => navigate('/upgrade')} style={{
                padding: '8px 24px',
                background: 'white',
                color: '#ea580c',
                border: 'none',
                borderRadius: '30px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}>
                Mejorar a VIP
              </button>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div style={{
              background: '#fef2f2',
              borderLeft: '4px solid #dc2626',
              borderRadius: '12px',
              padding: '14px 20px',
              margin: '0 0 20px 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#991b1b'
            }}>
              <span>{error}</span>
              <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#991b1b' }}>×</button>
            </div>
          )}

          {/* GRID PRINCIPAL */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '360px 1fr',
            gap: '28px',
            width: '100%'
          }}>
            
            {/* PANEL IZQUIERDO */}
            <aside style={{
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(12px)',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
              height: 'fit-content'
            }}>
              <h2 style={{ color: '#0f2b3d', marginBottom: '20px', fontSize: '1.25rem', fontWeight: '700' }}>
                Secciones 5S
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0' }}>
                {S_ITEMS.map(s => (
                  <li key={s.key} style={{ marginBottom: '10px' }}>
                    <button onClick={() => { setActiveS(s.key); setShowTrash(false); }} style={{
                      width: '100%',
                      padding: '14px 18px',
                      background: activeS === s.key ? `#f8fafc` : 'white',
                      border: activeS === s.key ? `2px solid ${s.color}` : '1px solid #e2e8f0',
                      borderRadius: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      color: '#0f172a',
                      transition: 'all 0.2s ease',
                      fontWeight: activeS === s.key ? '600' : '500'
                    }}>
                      <span>{s.label}</span>
                      <span style={{
                        background: activeS === s.key ? s.color : '#e2e8f0',
                        padding: '4px 12px',
                        borderRadius: '30px',
                        fontSize: '0.75rem',
                        color: activeS === s.key ? 'white' : '#334155',
                        fontWeight: '600'
                      }}>
                        {summaryByS[s.key]?.ok}/{summaryByS[s.key]?.total}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              
              <div style={{
                background: '#f8fafc',
                borderRadius: '20px',
                padding: '20px',
                border: '1px solid #eef2f6'
              }}>
                <h3 style={{ color: '#0f2b3d', marginBottom: '16px', fontSize: '1rem', fontWeight: '700' }}>
                  Reporte rápido
                </h3>
                {loading.summary ? (
                  <p style={{ color: '#64748b', textAlign: 'center' }}>Cargando...</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {Object.values(summaryByS).map(b => (
                      <li key={b.label} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '10px 0',
                        borderBottom: '1px solid #e2e8f0'
                      }}>
                        <span style={{ color: '#334155' }}>{b.label}</span>
                        <span style={{ fontWeight: '700', color: '#0f2b3d' }}>{b.ok}/{b.total || "-"}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>

            {/* PANEL DERECHO */}
            <section style={{
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(12px)',
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
              width: '100%'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '16px',
                paddingBottom: '16px',
                borderBottom: '2px solid #eef2f6'
              }}>
                <div>
                  <h2 style={{ color: '#0f2b3d', margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                    {currentItem?.label}
                  </h2>
                  <p style={{ margin: '6px 0 0 0', color: '#5a6e8a', fontSize: '0.85rem', fontWeight: '500' }}>
                    {activeS === "seiri" && "Registra tus actividades diarias"}
                    {activeS === "seiton" && "Visualiza y ordena tus registros"}
                    {activeS === "seiso" && "Gestiona tus entradas con papelera"}
                    {activeS === "seiketsu" && "Recursos y materiales de apoyo"}
                    {activeS === "shitsuke" && "Gráfico general de cumplimiento"}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {isSeiso && (
                    <button onClick={() => setShowTrash(!showTrash)} style={{
                      padding: '8px 20px',
                      background: showTrash ? '#dc2626' : '#f97316',
                      color: 'white',
                      border: 'none',
                      borderRadius: '30px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '0.85rem'
                    }}>
                      {showTrash ? 'Ver entradas activas' : `Papelera (${trash.length})`}
                    </button>
                  )}
                  {isOnlyEntriesView && (
                    <button onClick={toggleSortOrder} style={{
                      padding: '8px 20px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '30px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '0.85rem'
                    }}>
                      Ordenar {sortOrder === "desc" ? "↓ Reciente" : "↑ Antiguo"}
                    </button>
                  )}
                  <div style={{
                    background: '#fff7ed',
                    padding: '6px 18px',
                    borderRadius: '30px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: '#f97316'
                  }}>
                    Rol: {role}
                  </div>
                </div>
              </div>

              <div style={{ opacity: isChangingSection ? 0.4 : 1, transition: 'opacity 0.2s', width: '100%' }}>
                
                {/* SEIRI */}
                {isSeiri && (
                  <div style={{ width: '100%' }}>
                    <div style={{
                      marginBottom: '24px',
                      padding: '20px',
                      background: '#fefaf5',
                      borderRadius: '20px',
                      border: '1px solid #fed7aa'
                    }}>
                      <label style={{ fontWeight: '700', color: '#0f2b3d', marginBottom: '12px', display: 'block', fontSize: '0.9rem' }}>
                        Selecciona la S que deseas registrar:
                      </label>
                      <select value={selectedSForSeiri} onChange={(e) => handleSeiriSChange(e.target.value)} style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '14px',
                        border: '2px solid #fed7aa',
                        background: 'white',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        color: '#1e293b',
                        cursor: 'pointer'
                      }}>
                        <option value="">-- Selecciona una S --</option>
                        {S_ITEMS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                      </select>
                    </div>
                    
                    {selectedSForSeiri && seiriChecks.length > 0 && (
                      <div style={{
                        marginBottom: '24px',
                        padding: '20px',
                        background: 'white',
                        borderRadius: '20px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <h3 style={{ color: '#0f2b3d', marginBottom: '16px', fontSize: '1rem', fontWeight: '700' }}>
                          Checklist de {S_ITEMS.find(s => s.key === selectedSForSeiri)?.label}
                        </h3>
                        {seiriChecks.map((c, i) => (
                          <label key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            marginBottom: '10px',
                            background: '#fafcff',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            cursor: 'pointer'
                          }}>
                            <input type="checkbox" checked={!!seiriChecksState[i]} onChange={() => handleSeiriToggleCheck(i)} style={{ width: '18px', height: '18px' }} />
                            <span style={{ fontWeight: '500', color: '#334155' }}>{c}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    <div style={{
                      marginBottom: '24px',
                      padding: '20px',
                      background: 'white',
                      borderRadius: '20px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <h3 style={{ color: '#0f2b3d', marginBottom: '16px', fontSize: '1rem', fontWeight: '700' }}>
                        Evidencia y notas
                      </h3>
                      <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Observaciones, comentarios, acciones realizadas..." style={{
                        width: '100%',
                        minHeight: '100px',
                        padding: '14px',
                        borderRadius: '14px',
                        border: '1px solid #e2e8f0',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        fontSize: '0.9rem'
                      }} />
                      <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{
                        width: '100%',
                        padding: '12px',
                        marginTop: '12px',
                        border: '2px dashed #fed7aa',
                        borderRadius: '14px',
                        background: '#fefaf5',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }} />
                      {photoPreview && (
                        <div style={{ marginTop: '16px', borderRadius: '12px', overflow: 'hidden' }}>
                          <img src={photoPreview} alt="preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <button onClick={handleSaveSeiriEntry} disabled={loading.save || !selectedSForSeiri} style={{
                        padding: '12px 28px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '40px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: (loading.save || !selectedSForSeiri) ? 'not-allowed' : 'pointer',
                        opacity: (loading.save || !selectedSForSeiri) ? 0.6 : 1
                      }}>
                        {loading.save ? 'Guardando...' : 'Guardar entrada'}
                      </button>
                      <button onClick={clearSeiriForm} disabled={loading.save} style={{
                        padding: '12px 28px',
                        background: 'white',
                        color: '#5a6e8a',
                        border: '1px solid #cbd5e1',
                        borderRadius: '40px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}>
                        Limpiar
                      </button>
                    </div>
                  </div>
                )}

                {/* SEIKETSU - RECURSOS */}
                {isSeiketsu && (
                  <div style={{ width: '100%' }}>
                    <div style={{
                      marginBottom: '28px',
                      padding: '24px',
                      background: 'white',
                      borderRadius: '20px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <h3 style={{ color: '#0f2b3d', marginBottom: '20px', fontSize: '1.2rem', fontWeight: '700' }}>
                        Videos de apoyo
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px' }}>
                        {VIDEOS_APOYO.map((v, i) => (
                          <a key={i} href={v.url} target="_blank" rel="noopener noreferrer" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 18px',
                            background: '#f8fafc',
                            borderRadius: '14px',
                            textDecoration: 'none',
                            color: '#0f2b3d',
                            border: '1px solid #e2e8f0',
                            fontWeight: '500'
                          }}>
                            <span style={{ flex: 1 }}>{v.title}</span>
                            <span style={{ color: '#f97316' }}>▶</span>
                          </a>
                        ))}
                      </div>
                    </div>
                    
                    <div style={{
                      padding: '24px',
                      background: 'white',
                      borderRadius: '20px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <h3 style={{ color: '#0f2b3d', marginBottom: '20px', fontSize: '1.2rem', fontWeight: '700' }}>
                        Plantillas de apoyo
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px' }}>
                        {PLANTILLAS_APOYO.map((p, i) => (
                          <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 18px',
                            background: '#f8fafc',
                            borderRadius: '14px',
                            textDecoration: 'none',
                            color: '#0f2b3d',
                            border: '1px solid #e2e8f0',
                            fontWeight: '500'
                          }}>
                            <span style={{ flex: 1 }}>{p.title}</span>
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{p.type}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SHITSUKE - SOLO GRÁFICA */}
                {isShitsuke && (
                  <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '28px',
                    textAlign: 'center',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{ color: '#0f2b3d', marginBottom: '24px', fontSize: '1.2rem', fontWeight: '700' }}>
                      Estado general 5S - Disciplina
                    </h3>
                    <RealtimeChart summaryByS={summaryByS} chartData={chartData} />
                    <p style={{ marginTop: '24px', color: '#5a6e8a', fontSize: '0.85rem' }}>
                      Gráfico de cumplimiento de las 5S
                    </p>
                  </div>
                )}

                {/* SEITON y SEISO - SOLO ENTRADAS */}
                {isOnlyEntriesView && (
                  <div style={{ width: '100%' }}>
                    
                    {isSeiso && showTrash && (
                      <div style={{
                        marginBottom: '28px',
                        background: '#fef7e0',
                        borderRadius: '20px',
                        padding: '20px',
                        border: '1px solid #fde047'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                          <h3 style={{ color: '#f97316', margin: 0, fontSize: '1rem', fontWeight: '700' }}>
                            Papelera (eliminación en 30 días)
                          </h3>
                          <button onClick={() => setShowTrash(false)} style={{
                            padding: '4px 12px',
                            background: '#f97316',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}>Cerrar</button>
                        </div>
                        {trash.length === 0 ? (
                          <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No hay entradas en la papelera.</p>
                        ) : (
                          trash.map(e => {
                            const daysLeft = Math.ceil((30*24*60*60*1000 - (Date.now() - e.deletedAt)) / (24*60*60*1000));
                            return (
                              <div key={e.id} style={{
                                padding: '16px',
                                marginBottom: '12px',
                                background: 'white',
                                borderRadius: '16px',
                                display: 'flex',
                                gap: '16px',
                                border: '1px solid #fde047'
                              }}>
                                <div style={{
                                  width: '70px',
                                  height: '70px',
                                  background: '#f1f5f9',
                                  borderRadius: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  overflow: 'hidden'
                                }}>
                                  {e.photo ? <img src={e.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '0.7rem' }}>Sin foto</span>}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div><strong style={{ color: '#0f2b3d' }}>{e.sLabel}</strong>
                                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{formatDate(e.createdAt)} · {e.authorRole}</div></div>
                                  <div style={{ fontSize: '0.7rem', color: '#f97316', marginTop: '4px' }}>Se eliminará en {daysLeft} días</div>
                                  {e.note && <p style={{ fontSize: '0.8rem', marginTop: '8px', padding: '8px', background: '#f8fafc', borderRadius: '8px' }}>{e.note}</p>}
                                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                                    <button onClick={() => restoreFromTrash(e)} style={{ padding: '6px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '20px', fontSize: '0.7rem', cursor: 'pointer' }}>Restaurar</button>
                                    <button onClick={() => permanentDeleteFromTrash(e)} style={{ padding: '6px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '20px', fontSize: '0.7rem', cursor: 'pointer' }}>Eliminar</button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                    
                    <div style={{
                      padding: '20px',
                      background: 'white',
                      borderRadius: '20px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <h3 style={{ color: '#0f2b3d', marginBottom: '16px', fontSize: '1rem', fontWeight: '700' }}>
                        Entradas registradas {loading.entries && <span style={{ fontSize: '0.8rem' }}>⟳</span>}
                      </h3>
                      {sortedEntries.length === 0 ? (
                        <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                          {loading.entries ? 'Cargando...' : 'No hay entradas registradas aún.'}
                        </p>
                      ) : (
                        sortedEntries.map(e => (
                          <div key={e.id} style={{
                            padding: '16px',
                            marginBottom: '14px',
                            background: '#fafcff',
                            borderRadius: '16px',
                            display: 'flex',
                            gap: '16px',
                            border: '1px solid #e2e8f0'
                          }}>
                            <div style={{
                              width: '70px',
                              height: '70px',
                              background: '#f1f5f9',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden'
                            }}>
                              {e.photo ? <img src={e.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '0.7rem' }}>Sin foto</span>}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                <div>
                                  <strong style={{ color: '#0f2b3d', fontSize: '0.95rem' }}>{e.sLabel}</strong>
                                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                                    {formatDate(e.createdAt)} · {e.authorRole}
                                  </div>
                                </div>
                                {isSeiso && (
                                  <button onClick={() => moveToTrash(e)} style={{
                                    padding: '6px 14px',
                                    background: '#fef2f2',
                                    color: '#dc2626',
                                    border: '1px solid #fecaca',
                                    borderRadius: '20px',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                  }}>
                                    Mover a papelera
                                  </button>
                                )}
                              </div>
                              {e.note && (
                                <p style={{
                                  fontSize: '0.85rem',
                                  color: '#475569',
                                  background: '#f8fafc',
                                  padding: '10px 12px',
                                  borderRadius: '12px',
                                  marginTop: '12px'
                                }}>
                                  {e.note}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* FOOTER */}
          <footer style={{
            marginTop: '48px',
            padding: '20px',
            textAlign: 'center',
            color: '#5a6e8a',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '500'
          }}>
            Prototipo 5S OPTIMA • Conectado a MySQL • Gestión de Calidad
          </footer>
        </div>

        {/* CHATBOT */}
        <div className="chatbot-wrapper">
          {!chatbotOpen && (
            <button className="chatbot-toggle" onClick={() => setChatbotOpen(true)} style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              background: '#1e3a5f',
              color: 'white',
              border: 'none',
              borderRadius: '40px',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              fontSize: '0.9rem'
            }}>
              Asistente 5S
            </button>
          )}
          <ChatbotFaq isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><App5S /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute requiredRole="admin"><AdminPanel /></PrivateRoute>} />
          <Route path="/upgrade" element={<PrivateRoute><UpgradeToVip /></PrivateRoute>} />
          <Route path="/pago-exitoso" element={<PagoExitoso />} />
          <Route path="/pago-fallido" element={<PagoFallido />} />
          <Route path="/pago-pendiente" element={<PagoPendiente />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="loading">Cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (requiredRole && user?.rol !== requiredRole) return <Navigate to="/" />;
  return children;
};

export default App;