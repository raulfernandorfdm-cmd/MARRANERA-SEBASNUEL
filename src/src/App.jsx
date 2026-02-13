import { useEffect, useState } from "react";
import "./style.css";

const PRODUCTOS_BASE = [
  { nombre: "Costilla", precio: 16000 },
  { nombre: "Tocino", precio: 14000 },
  { nombre: "Lomo", precio: 18000 },
];

export default function App() {
  const [cliente, setCliente] = useState("");
  const [producto, setProducto] = useState(PRODUCTOS_BASE[0].nombre);
  const [precio, setPrecio] = useState(PRODUCTOS_BASE[0].precio);
  const [kilos, setKilos] = useState("");
  const [comentario, setComentario] = useState("");
  const [items, setItems] = useState([]);
  const [pedidos, setPedidos] = useState([]);

  // Cargar pedidos guardados
  useEffect(() => {
    const guardados = localStorage.getItem("pedidos");
    if (guardados) setPedidos(JSON.parse(guardados));
  }, []);

  // Guardar pedidos
  useEffect(() => {
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
  }, [pedidos]);

  const agregarProducto = () => {
    if (!kilos || !precio) return alert("Pon kilos y precio");

    setItems([
      ...items,
      {
        producto,
        precio: Number(precio),
        kilos: Number(kilos),
        comentario,
      },
    ]);

    setKilos("");
    setComentario("");
  };

  const totalPedido = items.reduce(
    (acc, i) => acc + i.precio * i.kilos,
    0
  );

  const guardarPedido = () => {
    if (!cliente || items.length === 0) {
      return alert("Pon el nombre del cliente y al menos un producto");
    }

    const nuevo = {
      id: Date.now(),
      cliente,
      fecha: new Date().toLocaleString(),
      estado: "Pendiente",
      items,
      total: totalPedido,
    };

    setPedidos([nuevo, ...pedidos]);
    setCliente("");
    setItems([]);
  };

  const marcarEntregado = (id) => {
    setPedidos(
      pedidos.map((p) =>
        p.id === id ? { ...p, estado: "Entregado" } : p
      )
    );
  };

  const borrarPedido = (id) => {
    if (!confirm("¿Seguro que deseas borrar este pedido?")) return;
    setPedidos(pedidos.filter((p) => p.id !== id));
  };

  const cambiarProducto = (nombre) => {
    const prod = PRODUCTOS_BASE.find((p) => p.nombre === nombre);
    setProducto(nombre);
    setPrecio(prod.precio);
  };

  return (
    <div className="container">
      <h1>Marranera Sebasnuel</h1>

      <input
        placeholder="Nombre del cliente"
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
      />

      <select
        value={producto}
        onChange={(e) => cambiarProducto(e.target.value)}
      >
        {PRODUCTOS_BASE.map((p) => (
          <option key={p.nombre} value={p.nombre}>
            {p.nombre}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Precio por kilo"
        value={precio}
        onChange={(e) => setPrecio(e.target.value)}
      />

      <input
        type="number"
        placeholder="Kilos"
        value={kilos}
        onChange={(e) => setKilos(e.target.value)}
      />

      <input
        placeholder="Comentario (opcional)"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
      />

      <button onClick={agregarProducto}>➕ Agregar producto</button>

      <h3>Total: ${totalPedido.toLocaleString()}</h3>

      <button className="guardar" onClick={guardarPedido}>
        Guardar pedido
      </button>

      <h2>Pedidos</h2>

      {pedidos.map((p) => (
        <div className="pedido" key={p.id}>
          <b>Cliente:</b> {p.cliente} <br />
          <b>Fecha:</b> {p.fecha} <br />
          <b>Estado:</b> {p.estado} <br />

          <ul>
            {p.items.map((i, idx) => (
              <li key={idx}>
                {i.producto}: {i.kilos} kg × ${i.precio.toLocaleString()} = $
                {(i.kilos * i.precio).toLocaleString()}
                {i.comentario ? ` (${i.comentario})` : ""}
              </li>
            ))}
          </ul>

          <b>Total:</b> ${p.total.toLocaleString()} <br />

          {p.estado === "Pendiente" && (
            <button onClick={() => marcarEntregado(p.id)}>
              Marcar como entregado
            </button>
          )}

          <button onClick={() => borrarPedido(p.id)}>🗑️ Borrar</button>
        </div>
      ))}
    </div>
  );
}
