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
  const [productos, setProductos] = useState(
    productosIniciales.map(p => ({ ...p, kilos: "" }))
  );

  const calcularTotal = () => {
    return productos.reduce((total, p) => {
      const kilos = parseFloat(p.kilos) || 0;
      const precio = parseFloat(p.precio) || 0;
      return total + kilos * precio;
    }, 0);
  };

  const actualizarProducto = (i, campo, valor) => {
    const nuevos = [...productos];
    nuevos[i][campo] = valor;
    setProductos(nuevos);
  };

  const generarTexto = () => {
    const items = productos
      .filter(p => (parseFloat(p.kilos) || 0) > 0)
      .map(p => `${p.nombre}: ${p.kilos}kg x $${p.precio} = $${(p.kilos * p.precio).toLocaleString()}`)
      .join("\n");

    return `Marranera Sebasnuel
Cliente: ${cliente || "-"}
Comentario: ${comentario || "-"}

Productos:
${items || "Sin productos"}

Total: $${calcularTotal().toLocaleString()}
Fecha: ${new Date().toLocaleString()}
`;
  };

  const enviarWhatsApp = () => {
    const texto = encodeURIComponent(generarTexto());
    window.open(`https://wa.me/?text=${texto}`, "_blank");
  };

  const imprimir = () => {
    const contenido = `
      <h1>Marranera Sebasnuel</h1>
      <p><b>Cliente:</b> ${cliente || "-"}</p>
      <p><b>Comentario:</b> ${comentario || "-"}</p>
      <pre>${generarTexto()}</pre>
      <h2>Total: $${calcularTotal().toLocaleString()}</h2>
    `;
    const w = window.open("", "_blank");
    w.document.write(`<html><body>${contenido}<script>window.print();</script></body></html>`);
    w.document.close();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#111", color: "#fff", padding: 20, fontFamily: "Arial" }}>
      <h1 style={{ textAlign: "center" }}>Marranera Sebasnuel</h1>

      <input
        placeholder="Nombre del cliente"
        value={cliente}
        onChange={e => setCliente(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 10 }}
      />

      {productos.map((p, i) => (
        <div key={i} style={{ border: "1px solid #333", padding: 10, marginBottom: 10 }}>
          <strong>{p.nombre}</strong><br />
          Kilos:
          <input
            type="number"
            value={p.kilos}
            onChange={e => actualizarProducto(i, "kilos", e.target.value)}
            style={{ marginLeft: 10, width: 80 }}
          />
          Precio:
          <input
            type="number"
            value={p.precio}
            onChange={e => actualizarProducto(i, "precio", e.target.value)}
            style={{ marginLeft: 10, width: 100 }}
          />
        </div>
      ))}

      <textarea
        placeholder="Comentario (ej: no tan gordo, bien picado...)"
        value={comentario}
        onChange={e => setComentario(e.target.value)}
        style={{ width: "100%", padding: 8, minHeight: 60 }}
      />

      <h2>Total: ${calcularTotal().toLocaleString()}</h2>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={imprimir}>🖨️ Imprimir / PDF</button>
        <button onClick={enviarWhatsApp}>📲 Enviar por WhatsApp</button>
      </div>
    </div>
  );
}
