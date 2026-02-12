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
    productosIniciales.map((p) => ({ ...p, kilos: "" }))
  );

  const calcularTotal = () => {
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

  const generarTextoWhatsApp = () => {
    const items = productos
      .filter((p) => (parseFloat(p.kilos) || 0) > 0)
      .map(
        (p) =>
          `- ${p.nombre}: ${p.kilos} kg x $${Number(p.precio).toLocaleString()} = $${(
            p.kilos * p.precio
          ).toLocaleString()}`
      )
      .join("\n");

    const total = calcularTotal().toLocaleString();

    return `🧾 *Pedido - Marranera Sebasnuel*
👤 Cliente: ${cliente || "-"}
📝 Comentario: ${comentario || "-"}

📦 Productos:
${items || "- Sin productos -"}

💰 *Total: $${total}*`;
  };

  const enviarWhatsApp = () => {
    const texto = generarTextoWhatsApp();
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };

  const imprimirPedido = () => {
    const filas = productos
      .filter((p) => (parseFloat(p.kilos) || 0) > 0)
      .map(
        (p) => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${p.nombre}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${p.kilos}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">$${Number(
            p.precio
          ).toLocaleString()}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">$${(
            p.kilos * p.precio
          ).toLocaleString()}</td>
        </tr>
      `
      )
      .join("");

    const total = calcularTotal().toLocaleString();

    const contenido = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto;">
        <div style="text-align:center; margin-bottom:20px;">
          <h1 style="margin:0;">Marranera Sebasnuel</h1>
          <p style="margin:4px 0;">Factura / Pedido</p>
          <p style="margin:4px 0;">Fecha: ${new Date().toLocaleString()}</p>
        </div>

        <div style="margin-bottom:10px;">
          <strong>Cliente:</strong> ${cliente || "-"} <br/>
          <strong>Comentario:</strong> ${comentario || "-"}
        </div>

        <table style="width:100%; border-collapse:collapse; margin-top:10px;">
          <thead>
            <tr style="background:#f2f2f2;">
              <th style="padding:8px;border:1px solid #ddd;">Producto</th>
              <th style="padding:8px;border:1px solid #ddd;">Kilos</th>
              <th style="padding:8px;border:1px solid #ddd;">Precio/Kg</th>
              <th style="padding:8px;border:1px solid #ddd;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
          </tbody>
        </table>

        <h2 style="text-align:right; margin-top:20px;">
          Total: $${total}
        </h2>

        <p style="text-align:center; margin-top:40px;">
          ¡Gracias por su compra!
        </p>
      </div>
    `;

    const ventana = window.open("", "_blank");
    ventana.document.write(`
      <html>
        <head>
          <title>Factura - Marranera Sebasnuel</title>
        </head>
        <body>
          ${contenido}
          <script>
            window.print();
            window.onafterprint = () => window.close();
          </script>
        </body>
      </html>
    `);
    ventana.document.close();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111",
        color: "#fff",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ textAlign: "center" }}>Marranera Sebasnuel</h1>

      <h3>Cliente</h3>
      <input
        placeholder="Nombre del cliente"
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 10 }}
      />

      <h3>Productos</h3>
      {productos.map((p, i) => (
        <div
          key={i}
          style={{
            border: "1px solid #333",
            padding: 10,
            marginBottom: 10,
            borderRadius: 6,
          }}
        >
          <strong>{p.nombre}</strong>
          <div style={{ marginTop: 6 }}>
            Kilos:
            <input
              type="number"
              value={p.kilos}
              onChange={(e) => actualizarProducto(i, "kilos", e.target.value)}
              style={{ marginLeft: 10, width: 80 }}
            />
          </div>
          <div style={{ marginTop: 6 }}>
            Precio por kilo:
            <input
              type="number"
              value={p.precio}
              onChange={(e) => actualizarProducto(i, "precio", e.target.value)}
              style={{ marginLeft: 10, width: 100 }}
            />
          </div>
        </div>
      ))}

      <h3>Comentario</h3>
      <textarea
        placeholder="Ej: no tan gordo, cortar en trozos..."
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        style={{ width: "100%", padding: 8, minHeight: 60 }}
      />

      <h2>Total: ${calcularTotal().toLocaleString()}</h2>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={imprimirPedido}
          style={{
            marginTop: 20,
            padding: "12px 20px",
            fontSize: 16,
            cursor: "pointer",
            background: "#00c853",
            border: "none",
            borderRadius: 6,
            color: "#000",
            fontWeight: "bold",
          }}
        >
          🖨️ Imprimir Factura
        </button>

        <button
          onClick={enviarWhatsApp}
          style={{
            marginTop: 20,
            padding: "12px 20px",
            fontSize: 16,
            cursor: "pointer",
            background: "#25D366",
            border: "none",
            borderRadius: 6,
            color: "#000",
            fontWeight: "bold",
          }}
        >
          📲 Enviar por WhatsApp
        </button>
      </div>
    </div>
  );
}
