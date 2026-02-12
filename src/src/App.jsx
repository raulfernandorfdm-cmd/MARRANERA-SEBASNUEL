import { useState } from "react";
import * as XLSX from "xlsx";

export default function App() {
  const productosIniciales = [
    { nombre: "Costilla", precio: 16000 },
    { nombre: "Pernil", precio: 16000 },
    { nombre: "Maza", precio: 16000 },
    { nombre: "Chuleta", precio: 16000 },
    { nombre: "Panceta", precio: 16000 },
  ];

  const [cliente, setCliente] = useState("");
  const [comentario, setComentario] = useState("");
  const [productoActual, setProductoActual] = useState(productosIniciales[0].nombre);
  const [precioActual, setPrecioActual] = useState(productosIniciales[0].precio);
  const [kilosActual, setKilosActual] = useState("");
  const [items, setItems] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState("todos");

  const agregarProducto = () => {
    if (!kilosActual) return;
    setItems([...items, { nombre: productoActual, kilos: kilosActual, precio: precioActual }]);
    setKilosActual("");
  };

  const totalPedido = items.reduce(
    (t, i) => t + (parseFloat(i.kilos) || 0) * (parseFloat(i.precio) || 0),
    0
  );

  const guardarPedido = () => {
    if (!cliente || items.length === 0) return;

    setPedidos([
      ...pedidos,
      {
        id: Date.now(),
        cliente,
        comentario,
        fecha: new Date(),
        estado: "Pendiente",
        items,
        total: totalPedido,
      },
    ]);

    setCliente("");
    setComentario("");
    setItems([]);
  };

  const pedidosFiltrados = pedidos.filter(p => {
    const hoy = new Date();
    const fechaPedido = new Date(p.fecha);

    if (filtro === "hoy") {
      return fechaPedido.toDateString() === hoy.toDateString();
    }

    if (filtro === "semana") {
      const diff = (hoy - fechaPedido) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }

    return true;
  });

  const exportarExcel = () => {
    const data = pedidos.map(p => ({
      Cliente: p.cliente,
      Fecha: new Date(p.fecha).toLocaleString(),
      Estado: p.estado,
      Productos: p.items.map(i => `${i.nombre} (${i.kilos}kg x $${i.precio})`).join(" | "),
      Total: p.total
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pedidos");
    XLSX.writeFile(wb, "pedidos_marranera.xlsx");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#111", color: "#fff", padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>Marranera Sebasnuel</h1>

      <input
        placeholder="Nombre del cliente"
        value={cliente}
        onChange={e => setCliente(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 10 }}
      />

      <select
        value={productoActual}
        onChange={e => {
          setProductoActual(e.target.value);
          const p = productosIniciales.find(x => x.nombre === e.target.value);
          setPrecioActual(p.precio);
        }}
        style={{ width: "100%", padding: 8, marginBottom: 10 }}
      >
        {productosIniciales.map(p => (
          <option key={p.nombre} value={p.nombre}>{p.nombre}</option>
        ))}
      </select>

      <input
        type="number"
        value={precioActual}
        onChange={e => setPrecioActual(e.target.value)}
        placeholder="Precio por kilo"
        style={{ width: "100%", padding: 8, marginBottom: 10 }}
      />

      <input
        type="number"
        value={kilosActual}
        onChange={e => setKilosActual(e.target.value)}
        placeholder="Kilos"
        style={{ width: "100%", padding: 8, marginBottom: 10 }}
      />

      <textarea
        placeholder="Comentario (ej: no muy gordo)"
        value={comentario}
        onChange={e => setComentario(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 10 }}
      />

      <button onClick={agregarProducto} style={{ width: "100%", padding: 10, marginBottom: 10 }}>
        + Agregar producto
      </button>

      <h3>Total: ${totalPedido.toLocaleString()}</h3>

      <button onClick={guardarPedido} style={{ width: "100%", padding: 12, background: "#e53935", color: "#fff", border: "none", marginBottom: 20 }}>
        Guardar pedido
      </button>

      <button onClick={exportarExcel} style={{ width: "100%", padding: 12, background: "#2e7d32", color: "#fff", border: "none", marginBottom: 30 }}>
        📥 Exportar pedidos a Excel
      </button>

      <h2>Pedidos</h2>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setFiltro("todos")}>Todos</button>
        <button onClick={() => setFiltro("hoy")} style={{ marginLeft: 5 }}>Hoy</button>
        <button onClick={() => setFiltro("semana")} style={{ marginLeft: 5 }}>Últimos 7 días</button>
      </div>

      {pedidosFiltrados.map(p => (
        <div key={p.id} style={{ background: "#222", padding: 10, marginBottom: 10 }}>
          <b>{p.cliente}</b> — {new Date(p.fecha).toLocaleString()}  
          {p.items.map((i, idx) => (
            <p key={idx}>• {i.nombre}: {i.kilos}kg x ${i.precio}</p>
          ))}
          <b>Total: ${p.total.toLocaleString()}</b>
        </div>
      ))}
    </div>
  );
}
