import { useState } from "react";
import "./style.css";
import jsPDF from "jspdf";

export default function App() {
  const [cliente, setCliente] = useState("");
  const [vendedor, setVendedor] = useState("Raúl");
  const [metodoPago, setMetodoPago] = useState("Pendiente");
  const [productos, setProductos] = useState([
    { nombre: "", kilos: 1, precio: 0 }
  ]);
  const [ventasHoy, setVentasHoy] = useState([]);

  const agregarProducto = () => {
    setProductos([...productos, { nombre: "", kilos: 1, precio: 0 }]);
  };

  const actualizarProducto = (i, campo, valor) => {
    const copia = [...productos];
    copia[i][campo] = valor;
    setProductos(copia);
  };

  const total = productos.reduce(
    (acc, p) => acc + Number(p.kilos || 0) * Number(p.precio || 0),
    0
  );

  const guardarVenta = () => {
    const venta = {
      cliente,
      vendedor,
      metodoPago,
      productos,
      total,
      fecha: new Date().toLocaleString()
    };
    setVentasHoy([...ventasHoy, venta]);
    alert("Venta guardada ✔️");
  };

  const generarPDF = () => {
    const doc = new jsPDF();
    doc.addImage("/icon-192.png", "PNG", 80, 10, 50, 50);

    doc.text("Marranera Sebasnuel", 105, 70, { align: "center" });
    doc.text(`Cliente: ${cliente}`, 10, 90);
    doc.text(`Vendedor: ${vendedor}`, 10, 100);
    doc.text(`Método de pago: ${metodoPago}`, 10, 110);

    let y = 130;
    productos.forEach((p) => {
      doc.text(`${p.nombre} - ${p.kilos} kg x $${p.precio}`, 10, y);
      y += 10;
    });

    doc.text(`TOTAL: $${total}`, 10, y + 10);
    doc.text(
      "Sistema Marranera Sebasnuel - Software creado por Raúl Díaz © 2026",
      105,
      280,
      { align: "center" }
    );

    doc.save("factura.pdf");
  };

  const enviarWhatsApp = () => {
    const texto = `
Pedido Marranera Sebasnuel
Cliente: ${cliente}
Vendedor: ${vendedor}
Pago: ${metodoPago}

Productos:
${productos
  .map((p) => `${p.nombre} - ${p.kilos}kg x $${p.precio}`)
  .join("\n")}

Total: $${total}
`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(texto)}`,
      "_blank"
    );
  };

  return (
    <div className="container">
      <h1>Marranera Sebasnuel 🐷</h1>

      <input
        placeholder="Nombre del cliente"
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
      />

      <select value={vendedor} onChange={(e) => setVendedor(e.target.value)}>
        <option>Raúl</option>
        <option>Pareja</option>
      </select>

      <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
        <option>Pendiente</option>
        <option>Pagado</option>
      </select>

      {metodoPago === "Pendiente" && (
        <p className="alerta">⚠️ Cliente con pago pendiente</p>
      )}

      <h3>Productos</h3>
      {productos.map((p, i) => (
        <div key={i} className="fila">
          <input
            placeholder="Producto"
            value={p.nombre}
            onChange={(e) => actualizarProducto(i, "nombre", e.target.value)}
          />
          <input
            type="number"
            step="0.1"
            min="0.1"
            value={p.kilos}
            onChange={(e) => actualizarProducto(i, "kilos", e.target.value)}
          />
          <input
            type="number"
            value={p.precio}
            onChange={(e) => actualizarProducto(i, "precio", e.target.value)}
          />
        </div>
      ))}

      <button onClick={agregarProducto}>➕ Agregar producto</button>

      <h2>Total: ${total}</h2>

      <button onClick={guardarVenta}>💾 Guardar venta</button>
      <button onClick={generarPDF}>📄 Descargar PDF</button>
      <button onClick={enviarWhatsApp}>📲 Enviar por WhatsApp</button>

      <h3>📊 Ventas de hoy: {ventasHoy.length}</h3>
    </div>
  );
}
