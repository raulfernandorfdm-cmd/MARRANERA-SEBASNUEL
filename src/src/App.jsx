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
  const [comentario, setComentario] = useState("");
  const [productos, setProductos] = useState(
    productosBase.map(p => ({ ...p, kilos: "" }))
  );
  const [pedidos, setPedidos] = useState([]);

  const calcularTotalActual = () => {
    return productos.reduce((total, p) => {
      const kilos = parseFloat(p.kilos) || 0;
      const precio = parseFloat(p.precio) || 0;
      return total + kilos * precio;
    }, 0);
  };

  const actualizarProducto = (index, campo, valor) => {
    const nuevos = [...productos];
    nuevos[index][campo] = valor;
    setProductos(nuevos);
  };

  const guardarPedido = () => {
    const items = productos
      .filter(p => parseFloat(p.kilos) > 0)
      .map(p => ({
        nombre: p.nombre,
        kilos: parseFloat(p.kilos),
        precio: parseFloat(p.precio),
        subtotal: parseFloat(p.kilos) * parseFloat(p.precio)
      }));

    if (!cliente || items.length === 0) {
      alert("Ingresa el nombre del cliente y al menos un producto.");
      return;
    }

    const total = items.reduce((s, i) => s + i.subtotal, 0);

    const nuevoPedido = {
      id: Date.now(),
      cliente,
      comentario,
      fecha: new Date().toLocaleString(),
      estado: "Pendiente",
      items,
      total
    };

    setPedidos([nuevoPedido, ...pedidos]);
    setCliente("");
    setComentario("");
    setProductos(productosBase.map(p => ({ ...p, kilos: "" })));
  };

  const marcarEntregado = (id) => {
    setPedidos(pedidos.map(p =>
      p.id === id ? { ...p, estado: "Entregado" } : p
    ));
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at top, #222, #000)",
      color: "#fff",
      padding: 20,
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ textAlign: "center", letterSpacing: 2 }}>Marranera Sebasnuel</h1>

      {/* LOGO */}
      <img
        src="/logo.png"
        alt="Marranera Sebasnuel"
        style={{
          width: 120,
          display: "block",
          margin: "0 auto 20px",
          borderRadius: "50%",
          boxShadow: "0 0 20px rgba(255,255,255,0.2)"
        }}
      />

      <div style={{
        maxWidth: 420,
        margin: "0 auto",
        background: "rgba(255,255,255,0.06)",
        padding: 20,
        borderRadius: 12,
        backdropFilter: "blur(8px)"
      }}>
        <input
          placeholder="Nombre del cliente"
          value={cliente}
          onChange={e => setCliente(e.target.value)}
          style={inputStyle}
        />

        {productos.map((p, i) => (
          <div key={i} style={{ borderBottom: "1px solid #333", paddingBottom: 10, marginBottom: 10 }}>
            <strong>{p.nombre}</strong>

            <input
              type="number"
              placeholder="Precio por kilo"
              value={p.precio}
              onChange={e => actualizarProducto(i, "precio", e.target.value)}
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="Kilos"
              value={p.kilos}
              onChange={e => actualizarProducto(i, "kilos", e.target.value)}
              style={inputStyle}
            />
          </div>
        ))}

        <input
          placeholder="Comentario (ej: no muy gordo)"
          value={comentario}
          onChange={e => setComentario(e.target.value)}
          style={inputStyle}
        />

        <h3>Total: ${calcularTotalActual().toLocaleString()}</h3>

        <button onClick={guardarPedido} style={btnGuardar}>
          Guardar pedido
        </button>
      </div>

      <h2 style={{ textAlign: "center", marginTop: 40 }}>Pedidos</h2>

      {pedidos.map(p => (
        <div key={p.id} style={pedidoCard}>
          <p><b>Cliente:</b> {p.cliente}</p>
          <p><b>Fecha:</b> {p.fecha}</p>
          <p><b>Estado:</b> {p.estado}</p>
          {p.items.map((i, idx) => (
            <p key={idx}>
              • {i.nombre}: {i.kilos} kg x ${i.precio.toLocaleString()} = ${i.subtotal.toLocaleString()}
            </p>
          ))}
          <p><b>Total:</b> ${p.total.toLocaleString()}</p>

          {p.estado === "Pendiente" && (
            <button onClick={() => marcarEntregado(p.id)} style={btnEntregado}>
              Marcar como entregado
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "none",
  marginBottom: 8
};

const btnGuardar = {
  width: "100%",
  padding: 12,
  background: "#b30000",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: "bold",
  cursor: "pointer"
};

const btnEntregado = {
  marginTop: 10,
  padding: 8,
  background: "#2e7d32",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
};

const pedidoCard = {
  maxWidth: 420,
  margin: "20px auto",
  padding: 15,
  background: "rgba(255,255,255,0.06)",
  borderRadius: 10
};
