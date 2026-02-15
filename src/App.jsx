import { useState } from "react";
import jsPDF from "jspdf";

export default function App() {
  const [cliente, setCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [metodoPago, setMetodoPago] = useState("Pendiente");

  // Simulamos usuario logueado (luego lo hacemos real)
  const usuarioActual = "Raúl Díaz";

  const [productos, setProductos] = useState([
    { nombre: "", kilos: 1, precio: 0 },
  ]);

  const agregarProducto = () => {
    setProductos([...productos, { nombre: "", kilos: 1, precio: 0 }]);
  };

  const actualizarProducto = (i, campo, valor) => {
    const copia = [...productos];
    copia[i][campo] = valor;
    setProductos(copia);
  };

  const total = productos.reduce(
    (acc, p) => acc + Number(p.kilos) * Number(p.precio),
    0
  );

  const formatoCOP = (valor) =>
    valor.toLocaleString("es-CO", { style: "currency", currency: "COP" });

  const exportarPDF = () => {
    const doc = new jsPDF();

    // Logo
    const logo = "/origen/logo.png";
    doc.addImage(logo, "PNG", 150, 10, 40, 40);

    doc.setFontSize(16);
    doc.text("Sistema Marranera Sebasnuel", 10, 20);

    doc.setFontSize(12);
    doc.text(`Cliente: ${cliente}`, 10, 35);
    doc.text(`Vendedor: ${usuarioActual}`, 10, 42);
    doc.text(`Método de pago: ${metodoPago}`, 10, 49);

    let y = 65;
    productos.forEach((p, i) => {
      doc.text(
        `${i + 1}. ${p.nombre} - ${p.kilos} kg x ${formatoCOP(p.precio)}`,
        10,
        y
      );
      y += 8;
    });

    doc.text(`TOTAL: ${formatoCOP(total)}`, 10, y + 10);

    doc.setFontSize(10);
    doc.text(
      "Software creado por Raúl Díaz © 2026",
      10,
      280
    );

    doc.save("factura-marranera.pdf");
  };

  return (
    <div className="contenedor">
      <h1>Marranera Sebasnuel</h1>
      <h2>Sistema de Gestión de Pedidos</h2>

      <input
        placeholder="Nombre del cliente"
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
      />

      <input
        placeholder="Teléfono WhatsApp"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
      />

      <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
        <option>Pendiente</option>
        <option>Pagado</option>
      </select>

      {metodoPago === "Pendiente" && (
        <p className="alerta">⚠ Cliente con pago pendiente</p>
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

      <h3>Total: {formatoCOP(total)}</h3>

      <button onClick={exportarPDF}>📄 Exportar PDF</button>
    </div>
  );
}
