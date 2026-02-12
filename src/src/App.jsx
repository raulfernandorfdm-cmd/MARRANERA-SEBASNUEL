import { useState } from "react";

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
  const [filtro, setFiltro] = useState("todos"); // hoy | semana | todos

  const agregarProducto = () => {
    if (!kilosActual) return;
    setItems([
      ...items,
      { nombre: productoActual, kilos: kilosActual, precio: precioActual },
    ]);
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

  return (
    <div style={{
      minHeight: "100vh",
      background: "#111",
      color: "#fff",
      padding: 20,
      fontFamily: "Arial"
    }}>
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

      <button onClick={agregarProducto} style={{ padding: 10, width: "100%", marginBottom: 10 }}>
        + Agregar producto
      </button>

      <h3>Total: ${totalPedido.toLocaleString()}</h3>

      <button onClick={guardarPedido} style={{
        padding: 12,
        width: "100%",
        background: "#e53935",
        color: "#fff",
        border: "none",
        fontWeight: "bold",
        marginBottom: 30
      }}>
        Guardar pedido
      </button>

      <h2>Pedidos</h2>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setFiltro("todos")} style={{ marginRight: 5 }}>Todos</button>
        <button onClick={() => setFiltro("hoy")} style={{ marginRight: 5 }}>Hoy</button>
        <button onClick={() => setFiltro("semana")}>Últimos 7 días</button>
      </div>

      {pedidosFiltrados.map(p => (
        <div key={p.id} style={{ background: "#222", padding: 10, marginBottom: 10 }}>
          <p><b>Cliente:</b> {p.cliente}</p>
          <p><b>Fecha:</b> {new Date(p.fecha).toLocaleString()}</p>
          <p><b>Estado:</b> {p.estado}</p>
          {p.items.map((i, idx) => (
            <p key={idx}>• {i.nombre}: {i.kilos} kg x ${i.precio} = ${(i.kilos * i.precio).toLocaleString()}</p>
          ))}
          <b>Total: ${p.total.toLocaleString()}</b>
        </div>
      ))}
    </div>
  );
}
