import { useState } from "react"

const PRODUCTOS_INICIALES = [
  { nombre: "Costilla", precio: 16000 },
  { nombre: "Pernil", precio: 15000 },
  { nombre: "Maza", precio: 14000 },
  { nombre: "Chuleta", precio: 17000 },
  { nombre: "Panceta", precio: 13000 },
]

export default function App() {
  const [cliente, setCliente] = useState("")
  const [comentario, setComentario] = useState("")
  const [productos, setProductos] = useState(
    PRODUCTOS_INICIALES.map(p => ({ ...p, kilos: 0 }))
  )

  const actualizarKilos = (index, kilos) => {
    const copia = [...productos]
    copia[index].kilos = kilos
    setProductos(copia)
  }

  const actualizarPrecio = (index, precio) => {
    const copia = [...productos]
    copia[index].precio = precio
    setProductos(copia)
  }

  const total = productos.reduce(
    (acc, p) => acc + (Number(p.kilos) || 0) * (Number(p.precio) || 0),
    0
  )

  return (
    <div style={{ 
      background: "#111", 
      minHeight: "100vh", 
      color: "white", 
      padding: "20px", 
      fontFamily: "Arial" 
    }}>
      <h1 style={{ textAlign: "center" }}>Marranera Sebasnuel</h1>

      <input
        placeholder="Nombre del cliente"
        value={cliente}
        onChange={e => setCliente(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <h3>Productos</h3>

      {productos.map((p, i) => (
        <div key={i} style={{ 
          background: "#222", 
          padding: 10, 
          marginBottom: 10, 
          borderRadius: 8 
        }}>
          <strong>{p.nombre}</strong>

          <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
            <input
              type="number"
              placeholder="Kilos"
              value={p.kilos}
              onChange={e => actualizarKilos(i, e.target.value)}
              style={{ flex: 1, padding: 6 }}
            />

            <input
              type="number"
              placeholder="Precio por kilo"
              value={p.precio}
              onChange={e => actualizarPrecio(i, e.target.value)}
              style={{ flex: 1, padding: 6 }}
            />
          </div>
        </div>
      ))}

      <textarea
        placeholder="Comentario del cliente (ej: no tan gordo, bien magro, etc)"
        value={comentario}
        onChange={e => setComentario(e.target.value)}
        style={{ width: "100%", padding: 10, minHeight: 60 }}
      />

      <h2>Total: ${total.toLocaleString()}</h2>
    </div>
  )
}
