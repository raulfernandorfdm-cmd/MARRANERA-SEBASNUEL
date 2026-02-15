import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

const PRODUCTOS_BASE = [
  { nombre: "Costilla", stock: 0 },
  { nombre: "Pernil", stock: 0 },
  { nombre: "Maza", stock: 0 },
  { nombre: "Chuleta", stock: 0 },
  { nombre: "Panceta", stock: 0 },
];

export default function Inventario({ usuarioActual }) {
  const [inventario, setInventario] = useState([]);
  const [producto, setProducto] = useState("Costilla");
  const [kilos, setKilos] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "inventario"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setInventario(data);
    });
    return () => unsub();
  }, []);

  const inicializarInventario = async () => {
    for (const p of PRODUCTOS_BASE) {
      await addDoc(collection(db, "inventario"), {
        nombre: p.nombre,
        stock: p.stock,
        actualizadoPor: usuarioActual,
        updatedAt: serverTimestamp(),
      });
    }
    alert("Inventario inicial creado 👍");
  };

  const agregarEntrada = async (item) => {
    if (!kilos) return alert("Escribe los kilos");

    const ref = doc(db, "inventario", item.id);
    const nuevoStock = Number(item.stock) + Number(kilos);

    await updateDoc(ref, {
      stock: nuevoStock,
      actualizadoPor: usuarioActual,
      updatedAt: serverTimestamp(),
    });

    setKilos("");
  };

  return (
    <div className="card">
      <h2>📦 Inventario</h2>

      {inventario.length === 0 && (
        <button onClick={inicializarInventario}>
          Crear inventario inicial
        </button>
      )}

      <div className="form-row">
        <select value={producto} onChange={(e) => setProducto(e.target.value)}>
          {inventario.map((p) => (
            <option key={p.id} value={p.nombre}>
              {p.nombre}
            </option>
          ))}
        </select>

        <input
          type="number"
          step="0.1"
          placeholder="Kilos que entran"
          value={kilos}
          onChange={(e) => setKilos(e.target.value)}
        />
      </div>

      <ul>
        {inventario.map((p) => (
          <li key={p.id} style={{ marginBottom: 8 }}>
            <b>{p.nombre}</b>: {p.stock} kg{" "}
            {p.stock <= 3 && <span style={{ color: "red" }}>⚠ Poco stock</span>}
            <button onClick={() => agregarEntrada(p)}>➕ Entrada</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
