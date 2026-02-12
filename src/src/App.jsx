import { useState } from "react";

const productosDisponibles = [
  "Costilla",
  "Pernil",
  "Maza",
  "Chuleta",
  "Panceta",
];

export default function App() {
  const [cliente, setCliente] = useState("");
  const [producto, setProducto] = useState(productosDisponibles[0]);
  const [kilos, setKilos] = useState("");
  const [precio, setPrecio] = useState("16000");
  const [pedido, setPedido] = useState([]);

  const total = pedido.reduce((acc, item) => acc + item.kilos * item.precio, 0);

  function agregarProducto() {
    if (!kilos || !precio) return;

    setPedido([
      ...pedido,
      {
        id: Date.now(),
        producto,
        kilos: Number(kilos),
        precio: Number(precio),
      },
    ]);

    setKilos("");
  }

  function eliminarProducto(id) {
    setPedido(pedido.filter((p) => p.id !== id));
  }

  function editarProducto(id, campo, valor) {
    setPedido(
      pedido.map((p) =>
        p.id === id ? { ...p, [campo]: Number(valor) } : p
      )
    );
  }

  return (
    <div style={{ padding: 20, background: "#111", minHeight: "100vh", color: "white" }}>
      <h1>Marranera Sebasnuel 🐷</h1>

      <input
        placeholder="Nombre del cliente"
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
        style={{ padding: 8, width: "100%", marginBottom: 10 }}
      />

      <select value={producto} onChange={(e) => setProducto(e.target.value)}>
        {productosDisponibles.map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>

      <input
        placeholder="Kilos"
        value={kilos}
        onChange={(e) => setKilos(e.target.value)}
        style={{ padding: 8, marginLeft: 10 }}
      />

      <input
        placeholder="Precio por kilo"
        value={precio}
        onChange={(e) => setPrecio(e.target.value)}
        style={{ padding: 8, marginLeft: 10 }}
      />

      <button onClick={agregarProducto} style={{ marginLeft: 10 }}>
        Agregar
      </button>

      <hr />

      <h3>Pedido de: {cliente || "Sin nombre"}</h3>

      {pedido.map((item) => (
        <div key={item.id} style={{ marginBottom: 10, borderBottom: "1px solid #444" }}>
          <strong>{item.producto}</strong> –  
          <input
            type="number"
            value={item.kilos}
            onChange={(e) => editarProducto(item.id, "kilos", e.target.value)}
            style={{ width: 60, marginLeft: 5 }}
          /> kg ×  
          <input
            type="number"
            value={item.precio}
            onChange={(e) => editarProducto(item.id, "precio", e.target.value)}
            style={{ width: 90, marginLeft: 5 }}
          /> $

          <button onClick={() => eliminarProducto(item.id)} style={{ marginLeft: 10 }}>
            ❌
          </button>
        </div>
      ))}

      <h2>Total: ${total.toLocaleString()}</h2>
    </div>
  );
}
      <button
        onClick={() => {
          const resumen = `
Pedido - Marranera Sebasnuel
Cliente: ${cliente}

${pedido
  .map(
    (p) =>
      `• ${p.producto}: ${p.kilos} kg x $${p.precio} = $${p.kilos * p.precio}`
  )
  .join("\n")}

TOTAL: $${total}
          `.trim();

          navigator.clipboard.writeText(resumen);
          alert("Resumen copiado. Pégalo en WhatsApp 📲");
        }}
        style={{ marginTop: 20, padding: 10 }}
      >
        Generar resumen para WhatsApp
      </button>

