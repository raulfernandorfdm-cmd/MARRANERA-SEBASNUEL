[9:44 p. m., 12/2/2026] Raul Diaz: import { useState } from "react";

export default function App() {
  const [cliente, setCliente] = useState("");
  const [producto, setProducto] = useState("");
  const [kilos, setKilos] = useState(1);
  const [precio, setPrecio] = useState(12000);
  const total = kilos * precio;

  return (
    <div className="container">
      <h1>Hoja de pedidos – Marranera Sebasnuel</h1>

      <label>Cliente</label>
      <input value={cliente} onChange={(e) => setCliente(e.target.value)} />

      <label>Producto</label>
      <input value={producto} onChange={(e) => setProducto(e.target.value)} />

      <label>Kilos</label>
      <input type="number" value={kilos} onChange={(e) => setKilos(Number(e.target.value))} />

      <label>Precio por kilo</label>
      <input…
[9:44 p. m., 12/2/2026] Raul Diaz: import { useState } from "react";

export default function App() {
  const [cliente, setCliente] = useState("");
  const [producto, setProducto] = useState("");
  const [kilos, setKilos] = useState(1);
  const [precio, setPrecio] = useState(12000);
  const total = kilos * precio;

  return (
    <div className="container">
      <h1>Hoja de pedidos – Marranera Sebasnuel</h1>

      <label>Cliente</label>
      <input value={cliente} onChange={(e) => setCliente(e.target.value)} />

      <label>Producto</label>
      <input value={producto} onChange={(e) => setProducto(e.target.value)} />

      <label>Kilos</label>
      <input type="number" value={kilos} onChange={(e) => setKilos(Number(e.target.value))} />

      <label>Precio por kilo</label>
      <input type="number" value={precio} onChange={(e) => setPrecio(Number(e.target.value))} />

      <h2>Total: ${total.toLocaleString("es-CO")}</h2>
    </div>
  );
}
