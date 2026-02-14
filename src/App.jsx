import { useState } from "react";
import jsPDF from "jspdf";

export default function App() {
  const [cliente, setCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [metodoPago, setMetodoPago] = useState("Pendiente");
  const [vendedor, setVendedor] = useState("");
  const [productos, setProductos] = useState([
    { nombre: "", kilos: 1, precio: 0 }
  ]);

  const total = productos.reduce(
    (acc, p) => acc + Number(p.kilos || 0) * Number(p.precio || 0),
    0
  );

  const actualizarProducto = (i, campo, valor) => {
    const copia = [...productos];
    copia[i][campo] = valor;
    setProductos(copia);
  };

  const agregarProducto = () => {
    setProductos([...productos, { nombre: "", kilos: 1, precio: 0 }]);
  };

  const enviarWhatsApp = () => {
    const mensaje = `
Pedido - Marranera Sebasnuel
Cliente: ${cliente}
Total: $${total}
Método de pago: ${metodoPago}
`;
    window.open(
      `https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Sistema Marranera Sebasnuel", 10, 10);
    doc.text(`Cliente: ${cliente}`, 10, 20);
    doc.text(`Vendedor: ${vendedor}`, 10, 30);
    doc.text(`Método de pago: ${metodoPago}`, 10, 40);

    let y = 50;
    productos.forEach((p, i) => {
      doc.text(
        `${i + 1}. ${p.nombre} - ${p.kilos} kg x $${p.precio}`,
        10,
        y
      );
      y += 10;
    });

    doc.text(`TOTAL: $${total}`, 10, y + 10);
    doc.text("Software creado por Raúl Díaz © 2026", 10, y + 25);

    doc.save("factura-marranera.pdf");
  };

  return (
    <div className="container">
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

      <input
        placeholder="Quién hizo la venta"
        value={vendedor}
        onChange={(e) => setVendedor(e.target.value)}
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
            placeholder="Precio por kilo"
            value={p.precio}
            onChange={(e) => actualizarProducto(i, "precio", e.target.value)}
          />
        </div>
      ))}

      <button onClick={agregarProducto}>➕ Agregar producto</button>

      <h3>Total: ${total}</h3>

      <div className="acciones">
        <button onClick={enviarWhatsApp}>📲 Enviar por WhatsApp</button>
        <button onClick={exportarPDF}>📄 Exportar PDF</button>
      </div>
    </div>
  );
}

