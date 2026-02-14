import { useState } from "react";
import jsPDF from "jspdf";
import "./style.css";

export default function App() {
  const [cliente, setCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [vendedor, setVendedor] = useState("");
  const [metodoPago, setMetodoPago] = useState("Pendiente");

  const [productos, setProductos] = useState([
    { nombre: "", kilos: 1, precio: 0 }
  ]);

  const agregarProducto = () => {
    setProductos([...productos, { nombre: "", kilos: 1, precio: 0 }]);
  };

  const actualizarProducto = (i, campo, valor) => {
    const copia = [...productos];
    copia[i][campo] = valor;
    setProductos(copia);
  };

  const total = productos.reduce((acc, p) => {
    return acc + Number(p.kilos || 0) * Number(p.precio || 0);
  }, 0);

  const totalCOP = total.toLocaleString("es-CO");

  const enviarWhatsApp = () => {
    let mensaje = `Pedido Marranera Sebasnuel\nCliente: ${cliente}\nPago: ${metodoPago}\n\n`;
    productos.forEach((p, i) => {
      if (p.nombre) {
        mensaje += `${i + 1}. ${p.nombre} - ${p.kilos} kg x $${p.precio}\n`;
      }
    });
    mensaje += `\nTOTAL: $ ${totalCOP}`;
    const url = `https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  const exportarPDF = () => {
    const doc = new jsPDF();

    const logo = new Image();
    logo.src = "/logo.png";

    logo.onload = () => {
      doc.addImage(logo, "PNG", 150, 10, 40, 40);

      doc.text("Sistema Marranera Sebasnuel", 10, 15);
      doc.text(`Cliente: ${cliente}`, 10, 25);
      doc.text(`Vendedor: ${vendedor}`, 10, 35);
      doc.text(`Método de pago: ${metodoPago}`, 10, 45);

      let y = 60;
      productos.forEach((p, i) => {
        if (p.nombre) {
          doc.text(
            `${i + 1}. ${p.nombre} - ${p.kilos} kg x $${p.precio}`,
            10,
            y
          );
          y += 8;
        }
      });

      doc.text(`TOTAL: $ ${totalCOP}`, 10, y + 10);
      doc.text("Software creado por Raúl Díaz © 2026", 10, y + 25);

      doc.save("factura-marranera.pdf");
    };
  };

  return (
    <div className="card">
      <h2>Marranera Sebasnuel</h2>
      <h3>Sistema de Gestión de Pedidos</h3>

      <input placeholder="Nombre del cliente" value={cliente} onChange={e => setCliente(e.target.value)} />
      <input placeholder="Teléfono WhatsApp" value={telefono} onChange={e => setTelefono(e.target.value)} />
      <input placeholder="Quién hizo la venta" value={vendedor} onChange={e => setVendedor(e.target.value)} />

      <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
        <option>Pendiente</option>
        <option>Pagado</option>
      </select>

      {metodoPago === "Pendiente" && (
        <p className="alerta">⚠ Cliente con pago pendiente</p>
      )}

      <h3>Productos</h3>

      {productos.map((p, i) => (
        <div className="fila" key={i}>
          <input placeholder="Producto" value={p.nombre} onChange={e => actualizarProducto(i, "nombre", e.target.value)} />
          <input type="number" step="0.1" min="0.1" value={p.kilos} onChange={e => actualizarProducto(i, "kilos", e.target.value)} />
          <input type="number" value={p.precio} onChange={e => actualizarProducto(i, "precio", e.target.value)} />
        </div>
      ))}

      <button onClick={agregarProducto}>➕ Agregar producto</button>

      <h3>Total: $ {totalCOP}</h3>

      <button onClick={enviarWhatsApp}>📲 Enviar por WhatsApp</button>
      <button onClick={exportarPDF}>📄 Exportar PDF</button>
    </div>
  );
}
