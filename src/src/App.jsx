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
  const [pedidos, setPedidos] = useState([]);

  const calcularTotalActual = () => {
    return productos.reduce((total, p) => {
      const kilos = parseFloat(p.kilos) || 0;
      const precio = parseFloat(p.precio) || 0;
      return total + kilos * precio;
    }, 0);
  };

  const guardarPedido = () => {
    const nuevoPedido = {
      id: Date.now(),
      cliente,
      comentario,
      productos: productos.map(p => ({
        nombre: p.nombre,
        kilos: parseFloat(p.kilos) || 0,
        precio: parseFloat(p.precio) || 0,
      })),
    };

    setPedidos([...pedidos, nuevoPedido]);

    // limpiar formulario
    setCliente("");
    setComentario("");
    setProductos(productosIniciales.map(p => ({ ...p, kilos: "" })));
  };

  const actualizarProductoActual = (index, campo, valor) => {
    const nuevos = [...productos];
    nuevos[index][campo] = valor;
    setProductos(nuevos);
  };

  const actualizarPedido = (pedidoIndex, productoIndex, campo, valor) => {
    const nuevosPedidos = [...pedidos];
    nuevosPedidos[pedidoIndex].productos[productoIndex][campo] = valor;
    setPedidos(nuevosPedidos);
  };

  const totalPedido = (pedido) => {
    return pedido.productos.reduce((t, p) => {
      const kilos = parseFloat(p.kilos) || 0;
      const precio = parseFloat(p.precio) || 0;
      return t + kilos * precio;
    }, 0);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#111",
      color: "#fff",
      padding: 20,
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
              onChange={e => actualizarProductoActual(i, "kilos", e.target.value)}
              style={{ marginLeft: 10, width: 80 }}
            />
          </div>

          <div>
            Precio por kilo:
            <input
              type="number"
              value={p.precio}
              onChange={e => actualizarProductoActual(i, "precio", e.target.value)}
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

      <h2>Total actual: ${calcularTotalActual().toLocaleString()}</h2>

      <button
        onClick={guardarPedido}
        style={{
          padding: 10,
          width: "100%",
          background: "#2ecc71",
          border: "none",
          color: "#000",
          fontWeight: "bold",
          cursor: "pointer",
          marginTop: 10
        }}
      >
        Guardar Pedido
      </button>

      <hr style={{ margin: "30px 0", borderColor: "#333" }} />

      <h2>Pedidos Guardados</h2>

      {pedidos.map((pedido, pi) => (
        <div key={pedido.id} style={{ border: "1px solid #444", padding: 10, marginBottom: 15 }}>
          <strong>Cliente:</strong>
          <input
            value={pedido.cliente}
            onChange={e => {
              const nuevos = [...pedidos];
              nuevos[pi].cliente = e.target.value;
              setPedidos(nuevos);
            }}
            style={{ marginLeft: 10, padding: 4 }}
          />

          <p><strong>Productos:</strong></p>

          {pedido.productos.map((p, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              {p.nombre} —
              Kilos:
              <input
                type="number"
                value={p.kilos}
                onChange={e => actualizarPedido(pi, i, "kilos", e.target.value)}
                style={{ width: 60, marginLeft: 5 }}
              />
              Precio:
              <input
                type="number"
                value={p.precio}
                onChange={e => actualizarPedido(pi, i, "precio", e.target.value)}
                style={{ width: 80, marginLeft: 5 }}
              />
            </div>
          ))}

          <strong>Total: ${totalPedido(pedido).toLocaleString()}</strong>
        </div>
      ))}
    </div>
  );
}
