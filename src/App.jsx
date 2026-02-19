import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function App() {
  const [cliente, setCliente] = useState("");
  const [metodoPago, setMetodoPago] = useState("Pendiente");
  const [usuarioActual] = useState("Raúl Díaz");

  const [productos, setProductos] = useState([
    { nombre: "Costilla", kilos: 1, precio: 18000 },
  ]);

  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    const querySnapshot = await getDocs(collection(db, "ventas"));
    const data = querySnapshot.docs.map((doc) => doc.data());
    setHistorial(data);
  };

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

  const guardarVenta = async () => {
    if (!cliente) {
      alert("Escribe el nombre del cliente");
      return;
    }

    const venta = {
      cliente,
      usuario: usuarioActual,
      metodoPago,
      productos,
      total,
      fecha: new Date().toLocaleString(),
    };

    await addDoc(collection(db, "ventas"), venta);
    alert("Venta guardada en la nube ☁️");

    setCliente("");
    setProductos([{ nombre: "Costilla", kilos: 1, precio: 18000 }]);
    cargarVentas();
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    const logo = "/logo.png";

    doc.addImage(logo, "PNG", 150, 10, 40, 40);
    doc.setFontSize(16);
    doc.text("Sistema Marranera Sebasnuel", 10, 20);

    doc.setFontSize(12);
    doc.text(Cliente: ${cliente}, 10, 35);
    doc.text(Vendedor: ${usuarioActual}, 10, 42);
    doc.text(Método de pago: ${metodoPago}, 10, 49);

    let y = 65;
    productos.forEach((p, i) => {
      doc.text(
        ${i + 1}. ${p.nombre} - ${p.kilos} kg x ${formatoCOP(p.precio)},
        10,
        y
      );
      y += 8;
    });

    doc.text(TOTAL: ${formatoCOP(total)}, 10, y + 10);
    doc.setFontSize(10);
    doc.text("Software creado por Raúl Díaz © 2026", 10, 280);
    doc.save("factura-marranera.pdf");
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "auto" }}>
      <h1>Marranera Sebasnuel</h1>

      <input
        placeholder="Nombre del cliente"
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
      />

      <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
        <option>Pendiente</option>
        <option>Pagado</option>
      </select>

      {cliente && metodoPago === "Pendiente" && (
        <p style={{ color: "red" }}>⚠ Cliente con pago pendiente</p>
      )}

      <h3>Productos</h3>

      {productos.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
          <input
            placeholder="Producto"
            value={p.nombre}
            onChange={(e) => actualizarProducto(i, "nombre", e.target.value)}
          />
          <input
            type="number"
            step="0.1"
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

      <h2>Total: {formatoCOP(total)}</h2>

      <button onClick={guardarVenta}>💾 Guardar en la nube</button>
      <button onClick={exportarPDF}>📄 Exportar PDF</button>

      <h2>📊 Historial de ventas</h2>

      {historial.map((v, i) => (
        <div key={i} style={{ border: "1px solid #ccc", padding: 10, margin: 5 }}>
          <b>{v.cliente}</b> — {formatoCOP(v.total)} — {v.fecha}
        </div>
      ))}
    </div>
  );
}
