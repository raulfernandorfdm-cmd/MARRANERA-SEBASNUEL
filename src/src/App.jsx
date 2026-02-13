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
  const [items, setItems] = useState([
    { producto: "Costilla", kilos: "", precio: 16000, comentario: "" }
  ]);
  const [pedidos, setPedidos] = useState([]);

  const agregarProducto = () => {
    setItems([...items, { producto: "Costilla", kilos: "", precio: 16000, comentario: "" }]);
  };

  const actualizarItem = (i, campo, valor) => {
    const copia = [...items];
    copia[i][campo] = valor;
    setItems(copia);
  };

  const total = items.reduce((acc, p) => {
    const k = parseFloat(p.kilos) || 0;
    const pr = parseFloat(p.precio) || 0;
    return acc + k * pr;
  }, 0);

  const guardarPedido = () => {
    if (!cliente) return alert("Escribe el nombre del cliente");

    const nuevo = {
      id: Date.now(),
      cliente,
      fecha: new Date().toLocaleString(),
      items,
      total,
      estado: "Pendiente",
    };

    setPedidos([nuevo, ...pedidos]);
    setCliente("");
    setItems([{ producto: "Costilla", kilos: "", precio: 16000, comentario: "" }]);
  };

  const marcarEntregado = (id) => {
    setPedidos(pedidos.map(p => p.id === id ? { ...p, estado: "Entregado" } : p));
  };

  const imprimirPedido = (pedido) => {
    const texto = `
MARRANERA SEBASNUEL

Cliente: ${pedido.cliente}
Fecha: ${pedido.fecha}
Estado: ${pedido.estado}

${pedido.items.map(i =>
  `${i.producto}: ${i.kilos} kg x $${i.precio} = $${i.kilos * i.precio}
Comentario: ${i.comentario || "N/A"}`
).join("\n")}

TOTAL: $${pedido.total}
`;
    const win = window.open("", "_blank");
    win.document.write(`<pre>${texto}</pre>`);
    win.print();
  };

  const exportarExcel = () => {
    let csv = "Cliente,Producto,Kilos,Precio,Comentario,Total\n";
    pedidos.forEach(p => {
      p.items.forEach(i => {
        csv += `${p.cliente},${i.producto},${i.kilos},${i.precio},${i.comentario},${i.kilos * i.precio}\n`;
      });
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pedidos_marranera.csv";
    a.click();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>Marranera Sebasnuel</h1>

      <div style={{ maxWidth: 400, margin: "auto", background: "#1a1a1a", padding: 20, borderRadius: 10 }}>
        <input
          placeholder="Nombre del cliente"
          value={cliente}
          onChange={e => setCliente(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        {items.map((i, idx) => (
          <div key={idx} style={{ marginBottom: 10, borderBottom: "1px solid #333", paddingBottom: 10 }}>
            <select
              value={i.producto}
              onChange={e => actualizarItem(idx, "producto", e.target.value)}
              style={{ width: "100%", padding: 8 }}
            >
              {productosBase.map(p => (
                <option key={p.nombre}>{p.nombre}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Precio por kilo"
              value={i.precio}
              onChange={e => actualizarItem(idx, "precio", e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 5 }}
            />

            <input
              type="number"
              placeholder="Kilos"
              value={i.kilos}
              onChange={e => actualizarItem(idx, "kilos", e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 5 }}
            />

            <input
              placeholder="Comentario (ej: no muy gordo)"
              value={i.comentario}
              onChange={e => actualizarItem(idx, "comentario", e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 5 }}
            />
          </div>
        ))}

        <button onClick={agregarProducto} style={{ width: "100%", padding: 10, marginBottom: 10 }}>
          ➕ Agregar producto
        </button>

        <h3>Total: ${total.toLocaleString()}</h3>

        <button onClick={guardarPedido} style={{ width: "100%", padding: 12, background: "red", color: "#fff" }}>
          Guardar pedido
        </button>
      </div>

      <h2>Pedidos</h2>

      {pedidos.map(p => (
        <div key={p.id} style={{ background: "#222", padding: 15, borderRadius: 8, marginBottom: 10 }}>
          <strong>Cliente:</strong> {p.cliente}<br />
          <strong>Fecha:</strong> {p.fecha}<br />
          <strong>Estado:</strong> {p.estado}<br />

          {p.items.map((i, idx) => (
            <div key={idx}>
              • {i.producto}: {i.kilos}kg x ${i.precio} = ${(i.kilos * i.precio).toLocaleString()}  
              <br />Comentario: {i.comentario || "N/A"}
            </div>
          ))}

          <strong>Total: ${p.total.toLocaleString()}</strong><br /><br />

          {p.estado === "Pendiente" && (
            <button onClick={() => marcarEntregado(p.id)}>Marcar como entregado</button>
          )}
          <button onClick={() => imprimirPedido(p)} style={{ marginLeft: 10 }}>🖨 Imprimir</button>
        </div>
      ))}

      {pedidos.length > 0 && (
        <button onClick={exportarExcel} style={{ marginTop: 20, padding: 10 }}>
          📥 Exportar a Excel
        </button>
      )}
    </div>
  );
}
