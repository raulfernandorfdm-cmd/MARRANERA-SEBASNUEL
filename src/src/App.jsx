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

  const actualizarProducto = (index, campo, valor) => {
    const nuevos = [...productos];
    nuevos[index][campo] = valor;
    setProductos(nuevos);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#111",
      color: "#fff",
      padding: "20px",
      fontFamily: "Arial"
    }}>
      <h1 style={{ textAlign: "center" }}>Marranera Sebasnuel</h1>

      <h3>Cliente</h3>
      <input
        placeholder="Nombre del cliente"
        value={cliente}
        onChange={e => setCliente(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 10 }}
      />

      <h3>Productos</h3>
      {productos.map((p, i) => (
        <div key={i} style={{ border: "1px solid #333", padding: 10, marginBottom: 10 }}>
          <strong>{p.nombre}</strong>
          <div>
            Kilos:
            <input
              type="number"
              value={p.kilos}
              onChange={e => actualizarProducto(i, "kilos", e.target.value)}
              style={{ marginLeft: 10, width: 80 }}
            />
          </div>
          <div>
            Precio por kilo:
            <input
              type="number"
              value={p.precio}
              onChange={e => actualizarProducto(i, "precio", e.target.value)}
              style={{ marginLeft: 10, width: 100 }}
            />
          </div>
        </div>
      ))}

      <h3>Comentario</h3>
      <textarea
        placeholder="Ej: no tan gordo, cortar en trozos..."
        value={comentario}
        onChange={e => setComentario(e.target.value)}
        style={{ width: "100%", padding: 8, minHeight: 60 }}
      />

      <h2>Total: ${calcularTotal().toLocaleString()}</h2>

      <div style={{ marginTop: 20, padding: 10, background: "#222" }}>
        <strong>Resumen:</strong>
        <p>Cliente: {cliente}</p>
        <p>Comentario: {comentario}</p>
      </div>
    </div>
  );
}
