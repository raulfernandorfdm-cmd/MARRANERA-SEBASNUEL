import { useState } from "react";

const PRODUCTOS = [
  { nombre: "Costilla", precio: 16000 },
  { nombre: "Pernil", precio: 15000 },
  { nombre: "Maza", precio: 14000 },
  { nombre: "Chuleta", precio: 17000 },
  { nombre: "Panceta", precio: 13000 },
];

export default function App() {
  const [cliente, setCliente] = useState("");
  const [producto, setProducto] = useState(PRODUCTOS[0].nombre);
  const [precio, setPrecio] = useState(PRODUCTOS[0].precio);
  const [kilos, setKilos] = useState("");
  const [comentario, setComentario] = useState("");
  const [items, setItems] = useState([]);
  const [pedidos, setPedidos] = useState([]);

  function agregarProducto() {
    if (!kilos) return alert("Ingresa los kilos");

    const total = Number(kilos) * Number(precio);

    setItems([
      ...items,
      { producto, precio, kilos, comentario, total }
    ]);

    setKilos("");
    setComentario("");
  }

  function guardarPedido() {
    if (!cliente || items.length === 0) {
      alert("Falta nombre del cliente o productos");
      return;
    }

    const totalPedido = items.reduce((s, i) => s + i.total, 0);

    setPedidos([
      {
        id: Date.now(),
        cliente,
        fecha: new Date().toLocaleString(),
        items,
        total: totalPedido,
        estado: "Pendiente",
      },
      ...pedidos,
    ]);

    setCliente("");
    setItems([]);
  }

  function marcarEntregado(id) {
    setPedidos(
      pedidos.map(p =>
        p.id === id ? { ...p, estado: "Entregado" } : p
      )
    );
  }

  return (
    <div className="container">
      <h1>Marranera Sebasnuel</h1>

      <div className="card">
        <input
          placeholder="Nombre del cliente"
          value={cliente}
          onChange={e => setCliente(e.target.value)}
        />

        <select
          value={producto}
          onChange={e => {
            const p = PRODUCTOS.find(x => x.nombre === e.target.value);
            setProducto(p.nombre);
            setPrecio(p.precio);
          }}
        >
          {PRODUCTOS.map(p => (
            <option key={p.nombre} value={p.nombre}>
              {p.nombre}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={precio}
          onChange={e => setPrecio(e.target.value)}
          placeholder="Precio por kilo"
        />

        <input
          placeholder="Kilos"
          value={kilos}
          onChange={e => setKilos(e.target.value)}
        />

        <input
          placeholder="Comentario (ej: no muy gordo)"
          value={comentario}
          onChange={e => setComentario(e.target.value)}
        />

        <button onClick={agregarProducto}>+ Agregar producto</button>

        <h3>Total: $
          {items.reduce((s, i) => s + i.total, 0).toLocaleString()}
        </h3>

        <button className="guardar" onClick={guardarPedido}>
          Guardar pedido
        </button>
      </div>

      <h2>Pedidos</h2>

      {pedidos.map(p => (
        <div key={p.id} className="pedido">
          <b>Cliente:</b> {p.cliente} <br />
          <b>Fecha:</b> {p.fecha} <br />
          <b>Estado:</b> {p.estado}
          <ul>
            {p.items.map((i, idx) => (
              <li key={idx}>
                {i.producto}: {i.kilos}kg x ${i.precio} = ${i.total.toLocaleString()}
                {i.comentario && ` (${i.comentario})`}
              </li>
            ))}
          </ul>
          <b>Total: ${p.total.toLocaleString()}</b>

          {p.estado === "Pendiente" && (
            <button onClick={() => marcarEntregado(p.id)}>
              Marcar como entregado
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
