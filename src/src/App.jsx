import { useState } from "react";

export default function App() {
  const productosBase = [
    { nombre: "Costilla", precio: 16000 },
    { nombre: "Pernil", precio: 16000 },
    { nombre: "Maza", precio: 16000 },
    { nombre: "Chuleta", precio: 16000 },
    { nombre: "Panceta", precio: 16000 },
  ];

  const [cliente, setCliente] = useState("");
  const [producto, setProducto] = useState(productosBase[0].nombre);
  const [precio, setPrecio] = useState(productosBase[0].precio);
  const [kilos, setKilos] = useState("");
  const [comentario, setComentario] = useState("");
  const [pedidos, setPedidos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  const totalActual = () => {
    const k = parseFloat(kilos) || 0;
    const p = parseFloat(precio) || 0;
    return k * p;
  };

  const guardarPedido = () => {
    if (!cliente || !kilos) return alert("Falta el nombre o los kilos");

    if (editandoId) {
      setPedidos(pedidos.map(p =>
        p.id === editandoId
          ? { ...p, cliente, producto, precio, kilos, comentario }
          : p
      ));
      setEditandoId(null);
    } else {
      setPedidos([
        ...pedidos,
        {
          id: Date.now(),
          cliente,
          producto,
          precio,
          kilos,
          comentario,
          fecha: new Date().toLocaleString(),
          estado: "Pendiente",
        },
      ]);
    }

    setCliente("");
    setKilos("");
    setComentario("");
  };

  const editarPedido = (p) => {
    setCliente(p.cliente);
    setProducto(p.producto);
    setPrecio(p.precio);
    setKilos(p.kilos);
    setComentario(p.comentario);
    setEditandoId(p.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const marcarEntregado = (id) => {
    setPedidos(pedidos.map(p =>
      p.id === id ? { ...p, estado: "Entregado" } : p
    ));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#111", color: "#fff", padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>Marranera Sebasnuel</h1>

      <input
        placeholder="Nombre del cliente"
        value={cliente}
        onChange={e => setCliente(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />

      <select
        value={producto}
        onChange={e => {
          const prod = productosBase.find(p => p.nombre === e.target.value);
          setProducto(prod.nombre);
          setPrecio(prod.precio);
        }}
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      >
        {productosBase.map(p => (
          <option key={p.nombre}>{p.nombre}</option>
        ))}
      </select>

      <input
        type="number"
        value={precio}
        onChange={e => setPrecio(e.target.value)}
        placeholder="Precio por kilo"
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />

      <input
        type="number"
        value={kilos}
        onChange={e => setKilos(e.target.value)}
        placeholder="Kilos"
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />

      <textarea
        placeholder="Comentario (ej: no muy gordo)"
        value={comentario}
        onChange={e => setComentario(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 10 }}
      />

      <h3>Total: ${totalActual().toLocaleString()}</h3>

      <button
        onClick={guardarPedido}
        style={{
          width: "100%",
          padding: 12,
          background: editandoId ? "#ffa500" : "#e53935",
          color: "#fff",
          border: "none",
          borderRadius: 6
        }}
      >
        {editandoId ? "Actualizar pedido" : "Guardar pedido"}
      </button>

      <h2 style={{ marginTop: 30 }}>Pedidos</h2>

      {pedidos.map(p => (
        <div key={p.id} style={{ background: "#222", padding: 10, marginBottom: 10 }}>
          <p><b>Cliente:</b> {p.cliente}</p>
          <p><b>Fecha:</b> {p.fecha}</p>
          <p><b>Estado:</b> {p.estado}</p>
          <p>• {p.producto}: {p.kilos} kg x ${p.precio} = ${(p.kilos * p.precio).toLocaleString()}</p>
          {p.comentario && <p><b>Comentario:</b> {p.comentario}</p>}

          <button onClick={() => editarPedido(p)} style={{ marginRight: 8 }}>✏️ Editar</button>
          {p.estado === "Pendiente" && (
            <button onClick={() => marcarEntregado(p.id)}>✅ Marcar entregado</button>
          )}
        </div>
      ))}
    </div>
  );
}
