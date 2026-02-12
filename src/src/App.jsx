import { useState } from "react";

const productosBase = [
  { nombre: "Costilla", precio: 16000 },
  { nombre: "Pernil", precio: 16000 },
  { nombre: "Maza", precio: 16000 },
  { nombre: "Chuleta", precio: 16000 },
  { nombre: "Panceta", precio: 16000 },
];

export default function App() {
  const [cliente, setCliente] = useState("");
  const [comentario, setComentario] = useState("");
  const [items, setItems] = useState([
    { producto: "Costilla", kilos: "", precio: 16000 }
  ]);
  const [pedidos, setPedidos] = useState([]);

  const agregarProducto = () => {
    setItems([...items, { producto: "Costilla", kilos: "", precio: 16000 }]);
  };

  const actualizarItem = (index, campo, valor) => {
    const copia = [...items];
    copia[index][campo] = valor;
    setItems(copia);
  };

  const calcularTotal = () => {
    return items.reduce((acc, item) => {
      const k = parseFloat(item.kilos) || 0;
      const p = parseFloat(item.precio) || 0;
      return acc + k * p;
    }, 0);
  };

  const guardarPedido = () => {
    if (!cliente) return alert("Pon el nombre del cliente");

    const nuevoPedido = {
      id: Date.now(),
      cliente,
      comentario,
      fecha: new Date().toLocaleString(),
      items,
      total: calcularTotal(),
      entregado: false
    };

    setPedidos([nuevoPedido, ...pedidos]);
    setCliente("");
    setComentario("");
    setItems([{ producto: "Costilla", kilos: "", precio: 16000 }]);
  };

  const marcarEntregado = (id) => {
    setPedidos(pedidos.map(p =>
      p.id === id ? { ...p, entregado: true } : p
    ));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#111", color: "#fff", padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>Marranera Sebasnuel</h1>

      <input
        placeholder="Nombre del cliente"
        value={cliente}
        onChange={e => setCliente(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      {items.map((item, i) => (
        <div key={i} style={{ background: "#222", padding: 10, marginBottom: 10, borderRadius: 8 }}>
          <select
            value={item.producto}
            onChange={e => actualizarItem(i, "producto", e.target.value)}
            style={{ width: "100%", padding: 8 }}
          >
            {productosBase.map(p => (
              <option key={p.nombre} value={p.nombre}>{p.nombre}</option>
            ))}
          </select>

          <input
            placeholder="Precio por kilo"
            type="number"
            value={item.precio}
            onChange={e => actualizarItem(i, "precio", e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />

          <input
            placeholder="Kilos"
            type="number"
            value={item.kilos}
            onChange={e => actualizarItem(i, "kilos", e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </div>
      ))}

      <button onClick={agregarProducto} style={{ width: "100%", padding: 10 }}>
        ➕ Agregar otro producto
      </button>

      <textarea
        placeholder="Comentario (ej: no muy gordo)"
        value={comentario}
        onChange={e => setComentario(e.target.value)}
        style={{ width: "100%", padding: 10, marginTop: 10 }}
      />

      <h2>Total: ${calcularTotal().toLocaleString()}</h2>

      <button
        onClick={guardarPedido}
        style={{ width: "100%", padding: 12, background: "red", color: "#fff", marginTop: 10 }}
      >
        Guardar pedido
      </button>

      <h2 style={{ marginTop: 30 }}>Pedidos</h2>

      {pedidos.map(p => (
        <div key={p.id} style={{ background: "#222", padding: 10, marginBottom: 10 }}>
          <p><b>Cliente:</b> {p.cliente}</p>
          <p><b>Fecha:</b> {p.fecha}</p>
          <p><b>Estado:</b> {p.entregado ? "Entregado" : "Pendiente"}</p>

          {p.items.map((it, i) => (
            <p key={i}>
              - {it.producto}: {it.kilos} kg x ${it.precio} = ${(it.kilos * it.precio).toLocaleString()}
            </p>
          ))}

          <p><b>Total:</b> ${p.total.toLocaleString()}</p>

          {!p.entregado && (
            <button onClick={() => marcarEntregado(p.id)}>
              Marcar como entregado
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
