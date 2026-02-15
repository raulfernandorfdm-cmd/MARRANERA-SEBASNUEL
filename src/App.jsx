import { useEffect, useState } from "react";
import jsPDF from "jspdf";

const PRECIOS_BASE = {
  Pernil: 26000,
  Costilla: 26000,
  Lomo: 28000,
  Tocino: 18000,
};

export default function App() {
  const [cliente, setCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [metodoPago, setMetodoPago] = useState("Pendiente");
  const [numeroFactura, setNumeroFactura] = useState(1);

  const usuarioActual = "Raúl Díaz";

  const [productos, setProductos] = useState([
    { nombre: "Pernil", kilos: 1, precio: PRECIOS_BASE.Pernil },
  ]);

  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const n = localStorage.getItem("factura");
    const h = JSON.parse(localStorage.getItem("historial") || "[]");
    if (n) setNumeroFactura(Number(n));
    setHistorial(h);
  }, []);

  const guardarHistorial = (factura) => {
    const nuevo = [factura, ...historial];
    setHistorial(nuevo);
    localStorage.setItem("historial", JSON.stringify(nuevo));
  };

  const agregarProducto = () => {
    setProductos([...productos, { nombre: "Pernil", kilos: 1, precio: PRECIOS_BASE.Pernil }]);
  };

  const actualizarProducto = (i, campo, valor) => {
    const copia = [...productos];
    copia[i][campo] = valor;
    if (campo === "nombre") copia[i].precio = PRECIOS_BASE[valor] || 0;
    setProductos(copia);
  };

  const total = productos.reduce(
    (acc, p) => acc + Number(p.kilos) * Number(p.precio),
    0
  );

  const formatoCOP = (v) =>
    v.toLocaleString("es-CO", { style: "currency", currency: "COP" });

  const exportarPDF = () => {
    const doc = new jsPDF();
    const logo = "/logo.png";
    doc.addImage(logo, "PNG", 150, 10, 40, 40);

    doc.setFontSize(16);
    doc.text("Marranera Sebasnuel", 10, 20);
    doc.setFontSize(12);
    doc.text(`Factura #${numeroFactura}`, 10, 30);
    doc.text(`Cliente: ${cliente}`, 10, 40);
    doc.text(`Teléfono: ${telefono}`, 10, 48);
    doc.text(`Vendedor: ${usuarioActual}`, 10, 56);
    doc.text(`Método de pago: ${metodoPago}`, 10, 64);

    let y = 80;
    productos.forEach((p, i) => {
      doc.text(`${i + 1}. ${p.nombre} - ${p.kilos} kg x ${formatoCOP(p.precio)}`, 10, y);
      y += 8;
    });

    doc.text(`TOTAL: ${formatoCOP(total)}`, 10, y + 10);
    doc.save(`factura-${numeroFactura}.pdf`);

    const factura = { numeroFactura, cliente, telefono, total, fecha: new Date().toLocaleString() };
    guardarHistorial(factura);
    localStorage.setItem("factura", numeroFactura + 1);
    setNumeroFactura(numeroFactura + 1);
  };

  const enviarWhatsApp = () => {
    const mensaje = `Hola ${cliente}, tu factura #${numeroFactura} es por ${formatoCOP(total)}. Gracias por tu compra 🐷🔥`;
    window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`);
  };

  return (
    <div className="contenedor">
      <h1>Marranera Sebasnuel</h1>
      <h2>Sistema de Gestión PRO</h2>

      <input placeholder="Cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />
      <input placeholder="WhatsApp" value={telefono} onChange={(e) => setTelefono(e.target.value)} />

      <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
        <option>Pendiente</option>
        <option>Pagado</option>
      </select>

      {productos.map((p, i) => (
        <div key={i}>
          <select value={p.nombre} onChange={(e) => actualizarProducto(i, "nombre", e.target.value)}>
            {Object.keys(PRECIOS_BASE).map((prod) => (
              <option key={prod}>{prod}</option>
            ))}
          </select>

          <input type="number" value={p.kilos} onChange={(e) => actualizarProducto(i, "kilos", e.target.value)} />
          <input type="number" value={p.precio} onChange={(e) => actualizarProducto(i, "precio", e.target.value)} />
        </div>
      ))}

      <button onClick={agregarProducto}>➕ Agregar producto</button>

      <h3>Total: {formatoCOP(total)}</h3>

      <button onClick={exportarPDF}>📄 Generar factura</button>
      <button onClick={enviarWhatsApp}>📲 Enviar por WhatsApp</button>

      <h3>📚 Historial de ventas</h3>
      {historial.map((f, i) => (
        <p key={i}>
          #{f.numeroFactura} - {f.cliente} - {formatoCOP(f.total)} - {f.fecha}
        </p>
      ))}
    </div>
  );
}
