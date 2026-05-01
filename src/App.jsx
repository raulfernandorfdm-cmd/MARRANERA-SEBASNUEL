import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import { createDocument, firebaseReady, listCollection, patchDocument } from "./firebase";

const LEGACY_KEYS = ["sebasnuel_enterprise_v1", "sebasnuel_finanzas_v3", "marranera_ventas_v2"];
const USERS_SEED = [
  { username: "admin", password: "admin123", role: "admin", nombre: "Administrador" },
  { username: "empleado", password: "empleado123", role: "empleado", nombre: "Empleado" },
];
const ESTADOS = { PENDIENTE: "Pendiente", PAGADO: "Pagado" };
const PRODUCTOS_BASE = ["Costilla", "Pernil", "Maza", "Chuleta", "Panceta"];
const PENDING_QUEUE_KEY = "sebasnuel_offline_queue_v2";
const THEME_KEY = "sebasnuel_theme";
const LOW_STOCK_KG = 8;
const SYNC_INTERVAL_ACTIVE = 4500;
const SYNC_INTERVAL_BACKGROUND = 12000;

const inicioDia = (f) => new Date(new Date(f).setHours(0, 0, 0, 0));
const sumarDias = (iso, dias) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + dias);
  return d.toISOString();
};
const nowIso = () => new Date().toISOString();

const readQueue = () => {
  try {
    return JSON.parse(localStorage.getItem(PENDING_QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
};

const groupByNombre = (productos = []) => productos.reduce((acc, p) => {
  const key = String(p.nombre || "").toLowerCase().trim();
  if (!key) return acc;
  acc[key] = (acc[key] || 0) + Number(p.kilos || 0);
  return acc;
}, {});
const safeListCollection = async (name) => {
  try {
    return await listCollection(name);
  } catch {
    return [];
  }
};

export default function App() {
  const [ventas, setVentas] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cartera, setCartera] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [sesion, setSesion] = useState(null);
  const [cred, setCred] = useState({ username: "", password: "" });
  const [tab, setTab] = useState("ventas");
  const [estadoSync, setEstadoSync] = useState("Inicializando...");
  const [isBooting, setIsBooting] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "light");
  const [ventaEditandoId, setVentaEditandoId] = useState(null);
  const [inventarioForm, setInventarioForm] = useState({ nombre: "", stock: 0 });
  const [gastoForm, setGastoForm] = useState({ concepto: "", monto: 0, categoria: "Operativo" });
  const [pendingQueueCount, setPendingQueueCount] = useState(() => readQueue().length);
  const [form, setForm] = useState({
    cliente: "",
    telefono: "",
    metodoPago: ESTADOS.PENDIENTE,
    productos: [{ nombre: PRODUCTOS_BASE[0], kilos: 1, precio: 18000 }],
  });

  const queueOp = (op) => {
    const queue = [...readQueue(), op];
    localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
    setPendingQueueCount(queue.length);
  };

  const pollingCloud = async () => {
    if (!firebaseReady) return;
    if (!navigator.onLine) {
      setEstadoSync("Modo offline local. Cambios en cola hasta recuperar internet.");
      return;
    }
    const [v, i, u, c, g] = await Promise.all([
      safeListCollection("ventas"),
      safeListCollection("inventario"),
      safeListCollection("usuarios"),
      safeListCollection("cartera"),
      safeListCollection("gastos"),
    ]);
    setVentas(v.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)));
    setInventario(i.sort((a, b) => a.nombre.localeCompare(b.nombre)));
    setUsuarios(u);
    setCartera(c.sort((a, b) => new Date(b.fechaCreacion || b.updatedAt) - new Date(a.fechaCreacion || a.updatedAt)));
    setGastos(g.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
    setEstadoSync(navigator.onLine ? "Sincronización instantánea activa" : "Modo offline local. Se sincroniza al recuperar internet.");
  };

  const flushQueue = async () => {
    if (!navigator.onLine || !firebaseReady) return;
    const queue = readQueue();
    if (!queue.length) return;

    for (const op of queue) {
      try {
        if (op.type === "createVenta") await createDocument("ventas", op.payload);
        if (op.type === "patchVenta") await patchDocument("ventas", op.id, op.payload);
        if (op.type === "patchInv") await patchDocument("inventario", op.id, op.payload);
        if (op.type === "createInv") await createDocument("inventario", op.payload);
        if (op.type === "createCartera") await createDocument("cartera", op.payload);
        if (op.type === "patchCartera") await patchDocument("cartera", op.id, op.payload);
        if (op.type === "createGasto") await createDocument("gastos", op.payload);
        if (op.type === "patchGasto") await patchDocument("gastos", op.id, op.payload);
      } catch {
        return;
      }
    }

    localStorage.removeItem(PENDING_QUEUE_KEY);
    setPendingQueueCount(0);
    await pollingCloud();
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const onStorage = () => setPendingQueueCount(readQueue().length);
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!firebaseReady) {
      setEstadoSync("No se pudo iniciar Firebase.");
      setIsBooting(false);
      return;
    }

    const boot = async () => {
      const [usersCloud, invCloud, carteraCloud, ventasCloud] = await Promise.all([
        safeListCollection("usuarios"),
        safeListCollection("inventario"),
        safeListCollection("cartera"),
        safeListCollection("ventas"),
      ]);

      if (!usersCloud.length) {
        for (const user of USERS_SEED) await createDocument("usuarios", user);
      }

      if (!invCloud.length) {
        for (const nombre of PRODUCTOS_BASE) {
          await createDocument("inventario", { nombre, stock: 40, updatedAt: nowIso(), updatedBy: "system" });
        }
      }

      if (!carteraCloud.length) {
        await createDocument("cartera", {
          cliente: "",
          telefono: "",
          total: 0,
          estado: ESTADOS.PAGADO,
          fechaCreacion: nowIso(),
          updatedAt: nowIso(),
          actualizadoPor: "system",
          semilla: true,
        });
      }

      if (!ventasCloud.length) {
        let legacy = [];
        LEGACY_KEYS.forEach((key) => {
          try {
            const data = JSON.parse(localStorage.getItem(key) || "null");
            if (Array.isArray(data)) legacy = legacy.concat(data);
            if (data?.sales && Array.isArray(data.sales)) legacy = legacy.concat(data.sales);
          } catch {
            // ignore
          }
        });

        for (const item of legacy.slice(0, 1000)) {
          const createdVenta = await createDocument("ventas", {
            cliente: item.cliente || "",
            telefono: item.telefono || "",
            productos: Array.isArray(item.productos) ? item.productos : [],
            total: Number(item.total || 0),
            metodoPago: item.metodoPago || ESTADOS.PENDIENTE,
            fechaCreacion: item.fechaCreacion || nowIso(),
            fechaVencimiento: item.fechaVencimiento || sumarDias(item.fechaCreacion || nowIso(), 30),
            creadoPor: "migracion",
            actualizadoPor: "migracion",
            createdAt: nowIso(),
            updatedAt: nowIso(),
          });

          if ((item.metodoPago || ESTADOS.PENDIENTE) === ESTADOS.PENDIENTE) {
            await createDocument("cartera", {
              cliente: item.cliente || "",
              telefono: item.telefono || "",
              total: Number(item.total || 0),
              estado: ESTADOS.PENDIENTE,
              fechaCreacion: item.fechaCreacion || nowIso(),
              fechaVencimiento: item.fechaVencimiento || sumarDias(item.fechaCreacion || nowIso(), 30),
              ventaRef: createdVenta.id,
              actualizadoPor: "migracion",
              updatedAt: nowIso(),
            });
          }
        }
      }

      await pollingCloud();
      setIsBooting(false);
    };

    boot();

    let running = false;
    const runSync = async () => {
      if (running) return;
      running = true;
      try {
        await flushQueue();
        await pollingCloud();
      } finally {
        running = false;
      }
    };

    runSync();
    let timer = null;
    const loop = async () => {
      await runSync();
      const nextMs = document.hidden ? SYNC_INTERVAL_BACKGROUND : SYNC_INTERVAL_ACTIVE;
      timer = setTimeout(loop, nextMs);
    };
    timer = setTimeout(loop, SYNC_INTERVAL_ACTIVE);

    return () => clearTimeout(timer);
  }, []);

  const totalForm = useMemo(() => form.productos.reduce((acc, p) => acc + Number(p.kilos || 0) * Number(p.precio || 0), 0), [form.productos]);
  const formatoCOP = (v) => Number(v || 0).toLocaleString("es-CO", { style: "currency", currency: "COP" });

  const ventasActivas = useMemo(() => ventas.filter((v) => !v.eliminado), [ventas]);
  const carteraActiva = useMemo(() => cartera.filter((c) => !c.semilla && c.estado === ESTADOS.PENDIENTE), [cartera]);

  const carteraPendiente = useMemo(
    () => carteraActiva.reduce((a, c) => a + Number(c.total || 0), 0),
    [carteraActiva],
  );
  const inventarioResumen = useMemo(() => {
    const total = inventario.reduce((acc, item) => acc + Number(item.stock || 0), 0);
    const bajos = inventario.filter((item) => Number(item.stock || 0) > 0 && Number(item.stock || 0) <= LOW_STOCK_KG).length;
    const agotados = inventario.filter((item) => Number(item.stock || 0) <= 0).length;
    return { total, bajos, agotados };
  }, [inventario]);

  const carteraResumen = useMemo(() => {
    const hoy = inicioDia(new Date());
    const vencidos = carteraActiva.filter((c) => inicioDia(c.fechaVencimiento || c.fechaCreacion) < hoy);
    const porVencer = carteraActiva.filter((c) => {
      const dueDate = inicioDia(c.fechaVencimiento || c.fechaCreacion);
      const diffDays = Math.ceil((dueDate - hoy) / 86400000);
      return diffDays >= 0 && diffDays <= 3;
    });
    return { vencidos, porVencer };
  }, [carteraActiva]);

  const reporteDiario = useMemo(() => {
    const hoy = inicioDia(new Date());
    const data = ventasActivas.filter((v) => new Date(v.fechaCreacion) >= hoy);
    return {
      ventas: data.length,
      total: data.reduce((a, i) => a + Number(i.total || 0), 0),
      pendiente: data.filter((i) => i.metodoPago === ESTADOS.PENDIENTE).reduce((a, i) => a + Number(i.total || 0), 0),
      clientes: new Set(data.map((i) => i.cliente?.trim()).filter(Boolean)).size,
    };
  }, [ventasActivas]);

  const clientesFrecuentes = useMemo(() => {
    const map = new Map();
    ventasActivas.forEach((v) => {
      const cliente = String(v.cliente || "").trim();
      if (!cliente) return;
      const prev = map.get(cliente) || { cliente, telefono: v.telefono || "", visitas: 0 };
      prev.visitas += 1;
      if (!prev.telefono && v.telefono) prev.telefono = v.telefono;
      map.set(cliente, prev);
    });
    return Array.from(map.values()).sort((a, b) => b.visitas - a.visitas).slice(0, 5);
  }, [ventasActivas]);

  const gastosActivos = useMemo(() => gastos.filter((g) => !g.eliminado), [gastos]);

  const resumenFinanciero = useMemo(() => {
    const hoy = inicioDia(new Date());
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const ventasDia = ventasActivas.filter((v) => inicioDia(v.fechaCreacion).getTime() === hoy.getTime());
    const gastosDia = gastosActivos.filter((g) => inicioDia(g.fecha).getTime() === hoy.getTime());
    const ventasSemana = ventasActivas.filter((v) => new Date(v.fechaCreacion) >= inicioSemana);
    const gastosSemana = gastosActivos.filter((g) => new Date(g.fecha) >= inicioSemana);
    const ventasMes = ventasActivas.filter((v) => new Date(v.fechaCreacion) >= inicioMes);
    const gastosMes = gastosActivos.filter((g) => new Date(g.fecha) >= inicioMes);

    const totalVentas = (arr) => arr.reduce((acc, item) => acc + Number(item.total || 0), 0);
    const totalGastos = (arr) => arr.reduce((acc, item) => acc + Number(item.monto || 0), 0);

    const diarioVentas = totalVentas(ventasDia);
    const diarioGastos = totalGastos(gastosDia);
    const semanalVentas = totalVentas(ventasSemana);
    const semanalGastos = totalGastos(gastosSemana);
    const mensualVentas = totalVentas(ventasMes);
    const mensualGastos = totalGastos(gastosMes);

    return {
      diarioVentas,
      diarioGastos,
      diarioUtilidad: diarioVentas - diarioGastos,
      semanalVentas,
      semanalGastos,
      semanalUtilidad: semanalVentas - semanalGastos,
      mensualVentas,
      mensualGastos,
      mensualUtilidad: mensualVentas - mensualGastos,
    };
  }, [ventasActivas, gastosActivos]);

  const chartSemanal = useMemo(() => {
    const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const hoy = new Date();
    const start = new Date(hoy);
    start.setDate(hoy.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const siguiente = new Date(d);
      siguiente.setDate(d.getDate() + 1);
      const ventasDia = ventasActivas
        .filter((v) => new Date(v.fechaCreacion) >= d && new Date(v.fechaCreacion) < siguiente)
        .reduce((acc, v) => acc + Number(v.total || 0), 0);
      const gastosDia = gastosActivos
        .filter((g) => new Date(g.fecha) >= d && new Date(g.fecha) < siguiente)
        .reduce((acc, g) => acc + Number(g.monto || 0), 0);
      return { label: dias[d.getDay()], ventas: ventasDia, utilidad: ventasDia - gastosDia };
    });
  }, [ventasActivas, gastosActivos]);
  const chartMaxVentas = useMemo(() => Math.max(...chartSemanal.map((x) => x.ventas), 1), [chartSemanal]);
  const chartMaxUtilidad = useMemo(() => Math.max(...chartSemanal.map((x) => Math.abs(x.utilidad)), 1), [chartSemanal]);

  const alertasInteligentes = useMemo(() => {
    const alertas = [];
    if (!navigator.onLine || pendingQueueCount > 0) {
      alertas.push({
        tipo: "sync",
        texto: pendingQueueCount > 0
          ? `Hay ${pendingQueueCount} cambios pendientes de sincronizar.`
          : "Modo offline activo. Los cambios se guardan localmente.",
      });
    }
    if (carteraResumen.vencidos.length > 0) {
      alertas.push({
        tipo: "cartera",
        texto: `Tienes ${carteraResumen.vencidos.length} cobros vencidos por gestionar.`,
      });
    }
    if (inventarioResumen.agotados > 0 || inventarioResumen.bajos > 0) {
      alertas.push({
        tipo: "inventario",
        texto: `Inventario en riesgo: ${inventarioResumen.agotados} agotados y ${inventarioResumen.bajos} con stock bajo.`,
      });
    }
    return alertas;
  }, [pendingQueueCount, carteraResumen.vencidos.length, inventarioResumen.agotados, inventarioResumen.bajos]);

  const estadisticasVendedor = useMemo(() => {
    const map = new Map();
    ventasActivas.forEach((v) => {
      const key = v.creadoPor || "sin-usuario";
      const prev = map.get(key) || { vendedor: key, ventas: 0, total: 0 };
      prev.ventas += 1;
      prev.total += Number(v.total || 0);
      map.set(key, prev);
    });
    return Array.from(map.values());
  }, [ventasActivas]);

  const login = () => {
    const user = usuarios.find((u) => u.username === cred.username && u.password === cred.password);
    if (!user) return alert("Credenciales inválidas");
    setSesion(user);
  };

  const actualizarProducto = (idx, key, val) => {
    setForm((prev) => {
      const productos = [...prev.productos];
      productos[idx] = { ...productos[idx], [key]: val };
      return { ...prev, productos };
    });
  };

  const iniciarEdicion = (venta) => {
    setVentaEditandoId(venta.id);
    setForm({
      cliente: venta.cliente || "",
      telefono: venta.telefono || "",
      metodoPago: venta.metodoPago || ESTADOS.PENDIENTE,
      productos: Array.isArray(venta.productos) && venta.productos.length
        ? venta.productos.map((p) => ({ nombre: p.nombre || PRODUCTOS_BASE[0], kilos: Number(p.kilos || 0), precio: Number(p.precio || 0) }))
        : [{ nombre: PRODUCTOS_BASE[0], kilos: 1, precio: 18000 }],
    });
    setTab("ventas");
  };

  const resetForm = () => {
    setVentaEditandoId(null);
    setForm({ cliente: "", telefono: "", metodoPago: ESTADOS.PENDIENTE, productos: [{ nombre: PRODUCTOS_BASE[0], kilos: 1, precio: 18000 }] });
  };

  const guardarInventario = async () => {
    if (!sesion || sesion.role !== "admin") return alert("Solo admin puede modificar inventario");
    if (!inventarioForm.nombre.trim()) return;
    const nombre = inventarioForm.nombre.trim();
    const fechaISO = nowIso();
    const existente = inventario.find((item) => item.nombre.toLowerCase() === nombre.toLowerCase());

    if (existente) {
      const payload = {
        ...existente,
        stock: Number(existente.stock || 0) + Number(inventarioForm.stock || 0),
        updatedAt: fechaISO,
        updatedBy: sesion.username,
      };
      if (navigator.onLine && firebaseReady) {
        try {
          await patchDocument("inventario", existente.id, payload);
        } catch {
          queueOp({ type: "patchInv", id: existente.id, payload });
        }
      } else {
        queueOp({ type: "patchInv", id: existente.id, payload });
      }
    } else {
      const payload = {
        nombre,
        stock: Number(inventarioForm.stock || 0),
        updatedAt: fechaISO,
        updatedBy: sesion.username,
      };
      if (navigator.onLine && firebaseReady) {
        try {
          await createDocument("inventario", payload);
        } catch {
          queueOp({ type: "createInv", payload });
        }
      } else {
        queueOp({ type: "createInv", payload });
      }
    }

    setInventarioForm({ nombre: "", stock: 0 });
    await pollingCloud();
  };

  const guardarGasto = async () => {
    if (!sesion) return;
    if (!gastoForm.concepto.trim() || Number(gastoForm.monto || 0) <= 0) return;
    const payload = {
      concepto: gastoForm.concepto.trim(),
      categoria: gastoForm.categoria || "Operativo",
      monto: Number(gastoForm.monto || 0),
      fecha: nowIso(),
      registradoPor: sesion.username,
      updatedAt: nowIso(),
    };

    if (navigator.onLine && firebaseReady) {
      try {
        await createDocument("gastos", payload);
      } catch {
        queueOp({ type: "createGasto", payload });
      }
    } else {
      queueOp({ type: "createGasto", payload });
    }

    setGastoForm({ concepto: "", monto: 0, categoria: "Operativo" });
    await pollingCloud();
  };

  const eliminarGasto = async (gasto) => {
    if (sesion?.role !== "admin") return alert("Solo admin puede eliminar gastos");
    const payload = { ...gasto, eliminado: true, updatedAt: nowIso(), actualizadoPor: sesion.username };
    if (navigator.onLine && firebaseReady) {
      try {
        await patchDocument("gastos", gasto.id, payload);
      } catch {
        queueOp({ type: "patchGasto", id: gasto.id, payload });
      }
    } else {
      queueOp({ type: "patchGasto", id: gasto.id, payload });
    }
    await pollingCloud();
  };

  const guardarVenta = async () => {
    if (!sesion || !form.cliente.trim()) return;
    const fechaISO = nowIso();

    if (ventaEditandoId) {
      const original = ventasActivas.find((v) => v.id === ventaEditandoId);
      if (!original) return;

      const payload = {
        ...original,
        cliente: form.cliente,
        telefono: form.telefono,
        productos: form.productos,
        total: totalForm,
        metodoPago: form.metodoPago,
        actualizadoPor: sesion.username,
        updatedAt: fechaISO,
      };

      const before = groupByNombre(original.productos);
      const after = groupByNombre(form.productos);
      const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
      const invOps = Array.from(keys)
        .map((nombre) => {
          const deltaKilos = (after[nombre] || 0) - (before[nombre] || 0);
          if (!deltaKilos) return null;
          const prod = inventario.find((p) => p.nombre.toLowerCase() === nombre);
          if (!prod) return null;
          return {
            id: prod.id,
            payload: {
              ...prod,
              stock: Number(prod.stock || 0) - deltaKilos,
              updatedAt: fechaISO,
              updatedBy: sesion.username,
            },
          };
        })
        .filter(Boolean);

      const carteraDoc = cartera.find((c) => c.ventaRef === original.id);
      const carteraPayload = {
        ...(carteraDoc || {}),
        cliente: form.cliente,
        telefono: form.telefono,
        total: totalForm,
        estado: form.metodoPago,
        fechaCreacion: original.fechaCreacion,
        fechaVencimiento: original.fechaVencimiento,
        ventaRef: original.id,
        actualizadoPor: sesion.username,
        updatedAt: fechaISO,
      };

      if (navigator.onLine && firebaseReady) {
        try {
          await patchDocument("ventas", original.id, payload);
          for (const op of invOps) await patchDocument("inventario", op.id, op.payload);
          if (carteraDoc) await patchDocument("cartera", carteraDoc.id, carteraPayload);
          else if (form.metodoPago === ESTADOS.PENDIENTE) await createDocument("cartera", carteraPayload);
        } catch {
          queueOp({ type: "patchVenta", id: original.id, payload });
          invOps.forEach((op) => queueOp({ type: "patchInv", id: op.id, payload: op.payload }));
          if (carteraDoc) queueOp({ type: "patchCartera", id: carteraDoc.id, payload: carteraPayload });
          else if (form.metodoPago === ESTADOS.PENDIENTE) queueOp({ type: "createCartera", payload: carteraPayload });
        }
      } else {
        queueOp({ type: "patchVenta", id: original.id, payload });
        invOps.forEach((op) => queueOp({ type: "patchInv", id: op.id, payload: op.payload }));
        if (carteraDoc) queueOp({ type: "patchCartera", id: carteraDoc.id, payload: carteraPayload });
        else if (form.metodoPago === ESTADOS.PENDIENTE) queueOp({ type: "createCartera", payload: carteraPayload });
      }

      resetForm();
      await pollingCloud();
      return;
    }

    const ventaPayload = {
      cliente: form.cliente,
      telefono: form.telefono,
      productos: form.productos,
      total: totalForm,
      metodoPago: form.metodoPago,
      fechaCreacion: fechaISO,
      fechaVencimiento: sumarDias(fechaISO, 30),
      creadoPor: sesion.username,
      actualizadoPor: sesion.username,
      createdAt: fechaISO,
      updatedAt: fechaISO,
    };

    const updatesInv = form.productos.map((item) => {
      const prod = inventario.find((p) => p.nombre.toLowerCase() === item.nombre.toLowerCase());
      if (!prod) return null;
      return {
        id: prod.id,
        payload: {
          ...prod,
          stock: Number(prod.stock || 0) - Number(item.kilos || 0),
          updatedAt: fechaISO,
          updatedBy: sesion.username,
        },
      };
    }).filter(Boolean);

    if (navigator.onLine && firebaseReady) {
      try {
        const createdVenta = await createDocument("ventas", ventaPayload);
        for (const op of updatesInv) await patchDocument("inventario", op.id, op.payload);
        if (form.metodoPago === ESTADOS.PENDIENTE) {
          await createDocument("cartera", {
            cliente: form.cliente,
            telefono: form.telefono,
            total: totalForm,
            estado: form.metodoPago,
            fechaCreacion: fechaISO,
            fechaVencimiento: sumarDias(fechaISO, 30),
            ventaRef: createdVenta.id,
            actualizadoPor: sesion.username,
            updatedAt: fechaISO,
          });
        }
      } catch {
        const offlineRef = `local-${fechaISO}-${Math.random().toString(16).slice(2)}`;
        queueOp({ type: "createVenta", payload: { ...ventaPayload, localRef: offlineRef } });
        updatesInv.forEach((op) => queueOp({ type: "patchInv", id: op.id, payload: op.payload }));
        if (form.metodoPago === ESTADOS.PENDIENTE) queueOp({ type: "createCartera", payload: { ...ventaPayload, ventaRef: offlineRef } });
      }
    } else {
      const offlineRef = `local-${fechaISO}-${Math.random().toString(16).slice(2)}`;
      queueOp({ type: "createVenta", payload: { ...ventaPayload, localRef: offlineRef } });
      updatesInv.forEach((op) => queueOp({ type: "patchInv", id: op.id, payload: op.payload }));
      if (form.metodoPago === ESTADOS.PENDIENTE) {
        queueOp({
          type: "createCartera",
          payload: {
            cliente: form.cliente,
            telefono: form.telefono,
            total: totalForm,
            estado: form.metodoPago,
            fechaCreacion: fechaISO,
            fechaVencimiento: sumarDias(fechaISO, 30),
            ventaRef: offlineRef,
            actualizadoPor: sesion.username,
            updatedAt: fechaISO,
          },
        });
      }
      setEstadoSync("Venta guardada offline. Pendiente de sincronizar.");
    }

    resetForm();
    await pollingCloud();
  };

  const cambiarEstado = async (venta, estado) => {
    const payload = {
      ...venta,
      metodoPago: estado,
      actualizadoPor: sesion.username,
      updatedAt: nowIso(),
    };

    const carteraDoc = cartera.find((c) => c.ventaRef === venta.id);
    const carteraPayload = {
      ...(carteraDoc || {}),
      cliente: venta.cliente,
      telefono: venta.telefono,
      total: venta.total,
      estado,
      fechaVencimiento: venta.fechaVencimiento,
      ventaRef: venta.id,
      actualizadoPor: sesion.username,
      updatedAt: nowIso(),
    };

    if (navigator.onLine && firebaseReady) {
      try {
        await patchDocument("ventas", venta.id, payload);
        if (carteraDoc) {
          await patchDocument("cartera", carteraDoc.id, carteraPayload);
        } else if (estado === ESTADOS.PENDIENTE) {
          await createDocument("cartera", carteraPayload);
        }
      } catch {
        queueOp({ type: "patchVenta", id: venta.id, payload });
        if (carteraDoc) queueOp({ type: "patchCartera", id: carteraDoc.id, payload: carteraPayload });
      }
    } else {
      queueOp({ type: "patchVenta", id: venta.id, payload });
      if (carteraDoc) queueOp({ type: "patchCartera", id: carteraDoc.id, payload: carteraPayload });
    }

    await pollingCloud();
  };

  const eliminarVenta = async (venta) => {
    if (sesion?.role !== "admin") return alert("Solo admin puede eliminar registros críticos");
    await cambiarEstado({ ...venta, eliminado: true }, venta.metodoPago);
  };

  const compartirVenta = async (venta) => {
    const texto = `Pedido ${venta.cliente}\nTotal: ${formatoCOP(venta.total)}\nEstado: ${venta.metodoPago}`;
    if (navigator.share) {
      await navigator.share({ title: "Pedido Marranera Sebasnuel", text: texto });
      return;
    }
    await navigator.clipboard.writeText(texto);
    alert("Resumen copiado al portapapeles");
  };

  const exportarPDF = () => {
    const pdf = new jsPDF();
    pdf.text("Factura SEBASNUEL", 10, 10);
    pdf.text(`Cliente: ${form.cliente}`, 10, 20);
    pdf.text(`Total: ${formatoCOP(totalForm)}`, 10, 30);
    pdf.save("factura-sebasnuel.pdf");
  };

  const exportarFinanzasPDF = () => {
    const pdf = new jsPDF();
    const fecha = new Date().toLocaleString("es-CO");
    pdf.setFontSize(16);
    pdf.text("Marranera Sebasnuel - Reporte Financiero Premium", 10, 15);
    pdf.setFontSize(10);
    pdf.text(`Generado: ${fecha}`, 10, 22);
    pdf.text(`Usuario: ${sesion?.username || "-"}`, 10, 28);

    pdf.setFontSize(12);
    pdf.text("Resumen diario", 10, 40);
    pdf.setFontSize(10);
    pdf.text(`Ventas: ${formatoCOP(resumenFinanciero.diarioVentas)}`, 10, 47);
    pdf.text(`Gastos: ${formatoCOP(resumenFinanciero.diarioGastos)}`, 10, 53);
    pdf.text(`Utilidad neta: ${formatoCOP(resumenFinanciero.diarioUtilidad)}`, 10, 59);

    pdf.setFontSize(12);
    pdf.text("Resumen semanal", 10, 71);
    pdf.setFontSize(10);
    pdf.text(`Ventas: ${formatoCOP(resumenFinanciero.semanalVentas)}`, 10, 78);
    pdf.text(`Gastos: ${formatoCOP(resumenFinanciero.semanalGastos)}`, 10, 84);
    pdf.text(`Utilidad neta: ${formatoCOP(resumenFinanciero.semanalUtilidad)}`, 10, 90);

    pdf.setFontSize(12);
    pdf.text("Resumen mensual", 10, 102);
    pdf.setFontSize(10);
    pdf.text(`Ventas: ${formatoCOP(resumenFinanciero.mensualVentas)}`, 10, 109);
    pdf.text(`Gastos: ${formatoCOP(resumenFinanciero.mensualGastos)}`, 10, 115);
    pdf.text(`Utilidad neta: ${formatoCOP(resumenFinanciero.mensualUtilidad)}`, 10, 121);

    pdf.setFontSize(12);
    pdf.text("Ultimos gastos", 10, 133);
    let y = 140;
    gastosActivos.slice(0, 8).forEach((g) => {
      pdf.setFontSize(10);
      pdf.text(`- ${g.concepto} (${g.categoria}) ${formatoCOP(g.monto)} · ${new Date(g.fecha).toLocaleDateString()}`, 10, y);
      y += 6;
    });

    pdf.save("reporte-financiero-sebasnuel.pdf");
  };

  const fechaHoy = new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  useEffect(() => {
    if (!sesion) return;

    const syncCarteraFromVentas = async () => {
      const acciones = [];
      ventasActivas.forEach((venta) => {
        const carteraDoc = cartera.find((c) => c.ventaRef === venta.id);
        if (!carteraDoc && venta.metodoPago === ESTADOS.PENDIENTE) {
          acciones.push({
            type: "createCartera",
            payload: {
              cliente: venta.cliente,
              telefono: venta.telefono,
              total: venta.total,
              estado: ESTADOS.PENDIENTE,
              fechaCreacion: venta.fechaCreacion,
              fechaVencimiento: venta.fechaVencimiento || sumarDias(venta.fechaCreacion, 30),
              ventaRef: venta.id,
              actualizadoPor: sesion.username,
              updatedAt: nowIso(),
              generadoAutomatico: true,
            },
          });
        }
        if (carteraDoc && carteraDoc.estado !== venta.metodoPago) {
          acciones.push({
            type: "patchCartera",
            id: carteraDoc.id,
            payload: {
              ...carteraDoc,
              estado: venta.metodoPago,
              actualizadoPor: sesion.username,
              updatedAt: nowIso(),
              total: venta.total,
            },
          });
        }
      });

      if (!acciones.length) return;

      for (const op of acciones) {
        if (navigator.onLine && firebaseReady) {
          try {
            if (op.type === "createCartera") await createDocument("cartera", op.payload);
            if (op.type === "patchCartera") await patchDocument("cartera", op.id, op.payload);
            continue;
          } catch {
            // fallback a cola
          }
        }
        queueOp(op);
      }
      await pollingCloud();
    };

    syncCarteraFromVentas();
  }, [ventasActivas, cartera, sesion]);

  if (isBooting) {
    return (
      <div className="loading-screen">
        <div className="loader-card">
          <div className="loader-ring" />
          <h2>Marranera Sebasnuel</h2>
          <p>Cargando panel empresarial...</p>
        </div>
      </div>
    );
  }

  if (!sesion) {
    return (
      <div className="app-shell center">
        <section className="card login">
          <p className="eyebrow">Acceso seguro</p>
          <h1>Marranera Sebasnuel</h1>
          <p className="muted">Control financiero y comercial en tiempo real.</p>
          <input placeholder="Usuario" value={cred.username} onChange={(e) => setCred((p) => ({ ...p, username: e.target.value }))} />
          <input type="password" placeholder="Contraseña" value={cred.password} onChange={(e) => setCred((p) => ({ ...p, password: e.target.value }))} />
          <button className="primary" onClick={login}>Entrar al panel</button>
          <small>Demo: admin/admin123 · empleado/empleado123</small>
          <p className="muted">{estadoSync}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="hero card">
        <div>
          <p className="eyebrow">Panel comercial premium</p>
          <h1>Marranera Sebasnuel</h1>
          <p className="muted">{fechaHoy} · {sesion.nombre} ({sesion.role})</p>
          <p className="muted">{estadoSync}</p>
          <span className="apk-pill">WebApp lista para empaquetar en APK (Capacitor)</span>
        </div>
        <div className="hero-actions">
          <button className="ghost" onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}>{theme === "dark" ? "☀️ Modo claro" : "🌙 Modo oscuro"}</button>
          <button className="danger" onClick={() => setSesion(null)}>Cerrar sesión</button>
        </div>
      </header>

      <nav className="tabs card">
        <button className={tab === "ventas" ? "active" : ""} onClick={() => setTab("ventas")}>Ventas</button>
        <button className={tab === "inventario" ? "active" : ""} onClick={() => setTab("inventario")}>Inventario</button>
        <button className={tab === "cartera" ? "active" : ""} onClick={() => setTab("cartera")}>Cartera</button>
        <button className={tab === "reportes" ? "active" : ""} onClick={() => setTab("reportes")}>Reportes</button>
        <button className={tab === "finanzas" ? "active" : ""} onClick={() => setTab("finanzas")}>Finanzas</button>
      </nav>

      <section className="kpis">
        <article className="card kpi"><span>Ventas de hoy</span><strong>{reporteDiario.ventas}</strong></article>
        <article className="card kpi"><span>Total vendido hoy</span><strong>{formatoCOP(reporteDiario.total)}</strong></article>
        <article className="card kpi"><span>Pedidos pendientes</span><strong>{carteraActiva.length}</strong></article>
        <article className="card kpi"><span>Clientes atendidos</span><strong>{reporteDiario.clientes}</strong></article>
      </section>

      <section className="grid2 executive-board">
        <article className="card">
          <h3>Dashboard ejecutivo</h3>
          <div className="mini-kpis">
            <div className="mini-kpi"><span>Facturación semanal</span><strong>{formatoCOP(resumenFinanciero.semanalVentas)}</strong></div>
            <div className="mini-kpi"><span>Utilidad semanal</span><strong>{formatoCOP(resumenFinanciero.semanalUtilidad)}</strong></div>
            <div className="mini-kpi"><span>Pendiente de cartera</span><strong>{formatoCOP(carteraPendiente)}</strong></div>
            <div className="mini-kpi"><span>Operaciones en cola</span><strong>{pendingQueueCount}</strong></div>
          </div>
        </article>
        <article className="card alerts-card">
          <h3>Alertas inteligentes</h3>
          {alertasInteligentes.length ? alertasInteligentes.map((a, idx) => (
            <p className="alert-chip" key={`${a.tipo}-${idx}`}>{a.texto}</p>
          )) : <p className="muted">Todo en orden. Sin alertas críticas ahora.</p>}
        </article>
      </section>

      {tab === "ventas" && (
        <section className="grid2">
          <article className="card form-card">
            <h2>{ventaEditandoId ? "Editar pedido" : "Nuevo pedido"}</h2>
            <input placeholder="Nombre del cliente" value={form.cliente} onChange={(e) => setForm((p) => ({ ...p, cliente: e.target.value }))} />
            <input placeholder="WhatsApp" value={form.telefono} onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))} />
            <select value={form.metodoPago} onChange={(e) => setForm((p) => ({ ...p, metodoPago: e.target.value }))}>
              <option>{ESTADOS.PENDIENTE}</option>
              <option>{ESTADOS.PAGADO}</option>
            </select>
            {form.productos.map((p, i) => (
              <div className="row3" key={`${p.nombre}-${i}`}>
                <select value={p.nombre} onChange={(e) => actualizarProducto(i, "nombre", e.target.value)}>
                  {inventario.map((inv) => <option key={inv.id} value={inv.nombre}>{inv.nombre}</option>)}
                </select>
                <input type="number" step="0.1" placeholder="Kilos" value={p.kilos} onChange={(e) => actualizarProducto(i, "kilos", e.target.value)} />
                <input type="number" placeholder="Precio por kilo" value={p.precio} onChange={(e) => actualizarProducto(i, "precio", e.target.value)} />
              </div>
            ))}
            <div className="toolbar">
              <button onClick={() => setForm((p) => ({ ...p, productos: [...p.productos, { nombre: PRODUCTOS_BASE[0], kilos: 1, precio: 0 }] }))}>+ Agregar producto</button>
              {ventaEditandoId && <button className="ghost" onClick={resetForm}>Cancelar edición</button>}
            </div>
            <div className="quick-clients">
              <small className="muted">Clientes frecuentes:</small>
              <div className="quick-client-list">
                {clientesFrecuentes.map((c) => (
                  <button
                    key={c.cliente}
                    className="chip-button"
                    onClick={() => setForm((p) => ({ ...p, cliente: c.cliente, telefono: c.telefono || p.telefono }))}
                  >
                    {c.cliente}
                  </button>
                ))}
              </div>
            </div>
            <button className="primary big" onClick={guardarVenta}>{ventaEditandoId ? "Actualizar pedido" : "Guardar pedido"}</button>
            <div className="toolbar">
              <button onClick={exportarPDF}>Exportar PDF</button>
            </div>
            <p className="total-line"><b>Total automático:</b> {formatoCOP(totalForm)}</p>
          </article>

          <article className="card history">
            <h2>Historial de pedidos</h2>
            {ventasActivas.map((v) => (
              <div className="item order-item" key={v.id}>
                <div className="order-main">
                  <strong>{v.cliente || "Sin nombre"}</strong>
                  <span className={`badge ${v.metodoPago === ESTADOS.PAGADO ? "ok" : "warn"}`}>{v.metodoPago}</span>
                </div>
                <p className="muted">Kilos: {Number(v.productos?.reduce((a, p) => a + Number(p.kilos || 0), 0) || 0).toFixed(2)} · Precio promedio: {formatoCOP((v.total || 0) / Math.max(1, v.productos?.reduce((a, p) => a + Number(p.kilos || 0), 0) || 1))}</p>
                <p><b>Total:</b> {formatoCOP(v.total)} · <span className="muted">{new Date(v.fechaCreacion).toLocaleString()}</span></p>
                <div className="toolbar compact">
                  <button onClick={() => iniciarEdicion(v)}>Editar</button>
                  <button onClick={() => eliminarVenta(v)}>Eliminar</button>
                  <button onClick={() => compartirVenta(v)}>Compartir</button>
                  <button className={v.metodoPago === ESTADOS.PAGADO ? "ghost" : "success"} onClick={() => cambiarEstado(v, v.metodoPago === ESTADOS.PAGADO ? ESTADOS.PENDIENTE : ESTADOS.PAGADO)}>
                    {v.metodoPago === ESTADOS.PAGADO ? "Marcar pendiente" : "Marcar pagado"}
                  </button>
                </div>
              </div>
            ))}
          </article>
        </section>
      )}

      {tab === "inventario" && (
        <section className="grid2">
          <article className="card">
            <h3>Módulo profesional de inventario</h3>
            <div className="mini-kpis">
              <div className="mini-kpi"><span>Stock total</span><strong>{inventarioResumen.total.toFixed(2)} kg</strong></div>
              <div className="mini-kpi"><span>Stock bajo</span><strong>{inventarioResumen.bajos}</strong></div>
              <div className="mini-kpi"><span>Agotados</span><strong>{inventarioResumen.agotados}</strong></div>
            </div>
            <div className="row2">
              <input
                placeholder="Producto (nuevo o existente)"
                value={inventarioForm.nombre}
                onChange={(e) => setInventarioForm((p) => ({ ...p, nombre: e.target.value }))}
              />
              <input
                type="number"
                step="0.1"
                placeholder="Kilos a sumar/restar"
                value={inventarioForm.stock}
                onChange={(e) => setInventarioForm((p) => ({ ...p, stock: e.target.value }))}
              />
            </div>
            <button className="primary" onClick={guardarInventario}>Guardar ajuste de inventario</button>
            <p className="muted">Tip: usa valores negativos para salida manual y positivos para entrada.</p>
          </article>

          <article className="card grid3">
            {inventario.map((i) => (
              <article className="item" key={i.id}>
                <h4>{i.nombre}</h4>
                <p>{Number(i.stock || 0).toFixed(2)} kg</p>
                <p className={`muted ${Number(i.stock || 0) <= LOW_STOCK_KG ? "warning-text" : ""}`}>
                  {Number(i.stock || 0) <= 0 ? "Sin stock" : Number(i.stock || 0) <= LOW_STOCK_KG ? "Stock bajo" : "Stock OK"}
                </p>
                <p className="muted">Actualizó: {i.updatedBy || "-"}</p>
              </article>
            ))}
          </article>
        </section>
      )}

      {tab === "cartera" && (
        <section className="grid2">
          <article className="card">
            <h3>Cartera automática</h3>
            <div className="mini-kpis">
              <div className="mini-kpi"><span>Total pendiente</span><strong>{formatoCOP(carteraPendiente)}</strong></div>
              <div className="mini-kpi"><span>Vencidos</span><strong>{carteraResumen.vencidos.length}</strong></div>
              <div className="mini-kpi"><span>Por vencer (3 días)</span><strong>{carteraResumen.porVencer.length}</strong></div>
            </div>
            <p className="muted">La cartera se crea y actualiza automáticamente según el estado de cada venta.</p>
          </article>
          <article className="card">
            {carteraActiva.map((c) => {
              const due = inicioDia(c.fechaVencimiento || c.fechaCreacion);
              const now = inicioDia(new Date());
              const esVencido = due < now;
              return (
                <div className="item" key={c.id}>
                  <strong>{c.cliente}</strong>
                  <p>{formatoCOP(c.total)}</p>
                  <p>Vence: {new Date(c.fechaVencimiento).toLocaleDateString()}</p>
                  <p className={`muted ${esVencido ? "warning-text" : ""}`}>{esVencido ? "Cuenta vencida" : "Cuenta al día"}</p>
                  <p className="muted">Actualizado por: {c.actualizadoPor}</p>
                </div>
              );
            })}
          </article>
        </section>
      )}

      {tab === "finanzas" && (
        <section className="grid2">
          <article className="card">
            <h3>Módulo financiero premium</h3>
            <div className="mini-kpis">
              <div className="mini-kpi"><span>Gastos diarios</span><strong>{formatoCOP(resumenFinanciero.diarioGastos)}</strong></div>
              <div className="mini-kpi"><span>Utilidad neta diaria</span><strong>{formatoCOP(resumenFinanciero.diarioUtilidad)}</strong></div>
              <div className="mini-kpi"><span>Utilidad semanal</span><strong>{formatoCOP(resumenFinanciero.semanalUtilidad)}</strong></div>
              <div className="mini-kpi"><span>Utilidad mensual</span><strong>{formatoCOP(resumenFinanciero.mensualUtilidad)}</strong></div>
            </div>
            <div className="row3">
              <input
                placeholder="Concepto del gasto"
                value={gastoForm.concepto}
                onChange={(e) => setGastoForm((p) => ({ ...p, concepto: e.target.value }))}
              />
              <input
                type="number"
                placeholder="Monto"
                value={gastoForm.monto}
                onChange={(e) => setGastoForm((p) => ({ ...p, monto: e.target.value }))}
              />
              <select value={gastoForm.categoria} onChange={(e) => setGastoForm((p) => ({ ...p, categoria: e.target.value }))}>
                <option>Operativo</option>
                <option>Nómina</option>
                <option>Transporte</option>
                <option>Servicios</option>
                <option>Otro</option>
              </select>
            </div>
            <div className="toolbar">
              <button className="primary" onClick={guardarGasto}>Registrar gasto</button>
              <button onClick={exportarFinanzasPDF}>Exportar PDF profesional</button>
            </div>
          </article>

          <article className="card">
            <h3>Reporte semanal y mensual</h3>
            <div className="report-block">
              <p><b>Semanal ventas:</b> {formatoCOP(resumenFinanciero.semanalVentas)}</p>
              <p><b>Semanal gastos:</b> {formatoCOP(resumenFinanciero.semanalGastos)}</p>
              <p><b>Semanal utilidad neta:</b> {formatoCOP(resumenFinanciero.semanalUtilidad)}</p>
            </div>
            <div className="report-block">
              <p><b>Mensual ventas:</b> {formatoCOP(resumenFinanciero.mensualVentas)}</p>
              <p><b>Mensual gastos:</b> {formatoCOP(resumenFinanciero.mensualGastos)}</p>
              <p><b>Mensual utilidad neta:</b> {formatoCOP(resumenFinanciero.mensualUtilidad)}</p>
            </div>
            <h4>Últimos gastos</h4>
            {gastosActivos.slice(0, 8).map((g) => (
              <div className="item" key={g.id}>
                <p><b>{g.concepto}</b> · {g.categoria}</p>
                <p>{formatoCOP(g.monto)} · {new Date(g.fecha).toLocaleString()}</p>
                {sesion?.role === "admin" && (
                  <div className="toolbar compact">
                    <button className="danger" onClick={() => eliminarGasto(g)}>Eliminar</button>
                  </div>
                )}
              </div>
            ))}
          </article>

          <article className="card">
            <h3>Gráfico de ventas (7 días)</h3>
            <p className="muted">Total semanal ventas: {formatoCOP(resumenFinanciero.semanalVentas)}</p>
            <div className="chart-wrap">
              {chartSemanal.map((p) => {
                const h = Math.max(8, (p.ventas / chartMaxVentas) * 140);
                return (
                  <div className="chart-col" key={`ventas-${p.label}`}>
                    <div className="bar ventas" style={{ height: `${h}px` }} />
                    <small>{p.label}</small>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="card">
            <h3>Gráfico de ganancias (7 días)</h3>
            <p className="muted">Total semanal utilidad: {formatoCOP(resumenFinanciero.semanalUtilidad)}</p>
            <div className="chart-wrap">
              {chartSemanal.map((p) => {
                const h = Math.max(8, (Math.abs(p.utilidad) / chartMaxUtilidad) * 140);
                return (
                  <div className="chart-col" key={`utilidad-${p.label}`}>
                    <div className={`bar ${p.utilidad >= 0 ? "ganancia" : "perdida"}`} style={{ height: `${h}px` }} />
                    <small>{p.label}</small>
                  </div>
                );
              })}
            </div>
          </article>
        </section>
      )}

      {tab === "reportes" && (
        <section className="grid2">
          <article className="card">
            <h3>Reporte diario</h3>
            <p>Ventas: {reporteDiario.ventas}</p>
            <p>Total: {formatoCOP(reporteDiario.total)}</p>
            <p>Pendiente: {formatoCOP(reporteDiario.pendiente)}</p>
            <p>Clientes: {reporteDiario.clientes}</p>
          </article>
          <article className="card">
            <h3>Estadísticas por vendedor</h3>
            {estadisticasVendedor.map((s) => <p key={s.vendedor}>{s.vendedor}: {s.ventas} ventas · {formatoCOP(s.total)}</p>)}
          </article>
          <article className="card">
            <h3>Resumen financiero</h3>
            <p>Cartera pendiente: {formatoCOP(carteraPendiente)}</p>
            <p>Total facturado histórico: {formatoCOP(ventasActivas.reduce((a, v) => a + Number(v.total || 0), 0))}</p>
          </article>
        </section>
      )}

      <nav className="bottom-nav">
        <button className={tab === "ventas" ? "active" : ""} onClick={() => setTab("ventas")}>🏦 Ventas</button>
        <button className={tab === "inventario" ? "active" : ""} onClick={() => setTab("inventario")}>📦 Inventario</button>
        <button className={tab === "cartera" ? "active" : ""} onClick={() => setTab("cartera")}>💳 Cartera</button>
        <button className={tab === "finanzas" ? "active" : ""} onClick={() => setTab("finanzas")}>📈 Finanzas</button>
      </nav>
    </div>
  );
}
