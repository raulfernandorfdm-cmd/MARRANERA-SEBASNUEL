import React, { useState } from "react"
import ReactDOM from "react-dom/client"

function App() {
  // --- Login simple ---
  const [usuario, setUsuario] = useState("")
  const [password, setPassword] = useState("")
  const [logueado, setLogueado] = useState(false)

  const usuarios = [
    { usuario: "rauldiaz", password: "raul2020" },
    { usuario: "yuliana", password: "raul2020" }
  ]

  // --- Productos con precio base ---
  const productosBase = [
    { id: 1, nombre: "Costilla", precio: 16000 },
    { id: 2, nombre: "Pernil",  precio: 17000 },
    { id: 3, nombre: "Maza",    precio: 18000 },
    { id: 4, nombre: "Chuleta", precio: 19000 },
    { id: 5, nombre: "Panceta", precio: 20000 }
  ]

  // --- Estados del pedido actual ---
  const [cliente, setCliente] = useState("")
  const [productoSel, setProductoSel] = useState(productosBase[0])
  const [precio, setPrecio] = useState(productosBase[0].precio)
  const [kilos, setKilos] = useState("")
  const [comentario, setComentario] = useState("")
  const [lineas, setLineas] = useState([])
  const [pedidos, setPedidos] = useState([])

  // --- Edición de línea ---
  const [editandoId, setEditandoId] = useState(null)
  const [editKilos, setEditKilos] = useState("")
  const [editPrecio, setEditPrecio] = useState("")
  const [editComentario, setEditComentario] = useState("")

  const iniciarSesion = () => {
    const ok = usuarios.find(u => u.usuario === usuario && u.password === password)
    if (ok) setLogueado(true)
    else alert("Usuario o contraseña incorrectos")
  }

  const cambiarProducto = (nombre) => {
    const p = productosBase.find(x => x.nombre === nombre)
    setProductoSel(p)
    setPrecio(p.precio)
  }

  const agregarLinea = () => {
    const k = parseFloat(kilos)
    const pr = parseFloat(precio)
    if (!k || !pr) return alert("Ingresa kilos y precio válidos")

    const subtotal = k * pr
    setLineas([
      ...lineas,
      {
        id: Date.now(),
        producto: productoSel.nombre,
        kilos: k,
        precio: pr,
        subtotal,
        comentario
      }
    ])
    setKilos("")
    setComentario("")
  }

  const totalGeneral = lineas.reduce((acc, l) => acc + l.subtotal, 0)

  const guardarPedido = () => {
    if (!cliente.trim()) return alert("Ingresa el nombre del cliente")
    if (lineas.length === 0) return alert("Agrega al menos un producto")

    const pedido = {
      id: Date.now(),
      cliente,
      fecha: new Date().toLocaleString(),
      estado: "Pendiente",
      lineas,
      total: totalGeneral
    }

    setPedidos([pedido, ...pedidos])
    setCliente("")
    setLineas([])
    setProductoSel(productosBase[0])
    setPrecio(productosBase[0].precio)
    setKilos("")
    setComentario("")
  }

  const marcarEntregado = (id) => {
    setPedidos(pedidos.map(p => p.id === id ? { ...p, estado: "Entregado" } : p))
  }

  const borrarLinea = (id) => {
    setLineas(lineas.filter(l => l.id !== id))
  }

  const empezarEditar = (l) => {
    setEditandoId(l.id)
    setEditKilos(l.kilos)
    setEditPrecio(l.precio)
    setEditComentario(l.comentario || "")
  }

  const guardarEdicion = (id) => {
    const k = parseFloat(editKilos)
    const pr = parseFloat(editPrecio)
    if (!k || !pr) return alert("Valores inválidos")

    setLineas(lineas.map(l => {
      if (l.id === id) {
        const subtotal = k * pr
        return { ...l, kilos: k, precio: pr, subtotal, comentario: editComentario }
      }
      return l
    }))
    setEditandoId(null)
  }

  if (!logueado) {
    return (
      <div style={S.fondo}>
        <div style={S.loginBox}>
          <h1 style={S.titulo}>Marranera Sebasnuel</h1>
          <input style={S.input} placeholder="Usuario" value={usuario} onChange={e=>setUsuario(e.target.value)} />
          <input style={S.input} type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} />
          <button style={S.boton} onClick={iniciarSesion}>Ingresar</button>
        </div>
      </div>
    )
  }

  return (
    <div style={S.fondo}>
      <h1 style={S.tituloGrande}>Marranera Sebasnuel</h1>

      <div style={S.panel}>
        <input style={S.input} placeholder="Nombre del cliente" value={cliente} onChange={e => setCliente(e.target.value)} />

        <select style={S.input} onChange={e => cambiarProducto(e.target.value)}>
          {productosBase.map(p => <option key={p.id}>{p.nombre}</option>)}
        </select>

        <input style={S.input} type="number" placeholder="Precio por kilo (editable)" value={precio} onChange={e => setPrecio(e.target.value)} />
        <input style={S.input} type="number" placeholder="Kilos" value={kilos} onChange={e => setKilos(e.target.value)} />
        <input style={S.input} placeholder="Comentario (ej: no muy gordo)" value={comentario} onChange={e => setComentario(e.target.value)} />

        <button style={S.botonSec} onClick={agregarLinea}>➕ Agregar producto</button>

        <div style={{marginTop:10}}>
          {lineas.map(l => (
            <div key={l.id} style={S.linea}>
              {editandoId === l.id ? (
                <>
                  <div><b>{l.producto}</b></div>
                  <input style={S.inputMini} type="number" value={editKilos} onChange={e=>setEditKilos(e.target.value)} />
                  <input style={S.inputMini} type="number" value={editPrecio} onChange={e=>setEditPrecio(e.target.value)} />
                  <input style={S.inputMini} value={editComentario} onChange={e=>setEditComentario(e.target.value)} />
                  <button style={S.botonMini} onClick={()=>guardarEdicion(l.id)}>Guardar</button>
                </>
              ) : (
                <>
                  <strong>{l.producto}</strong> — {l.kilos} kg × ${l.precio} = <b>${l.subtotal}</b>
                  {l.comentario && <div style={{opacity:.8}}>📝 {l.comentario}</div>}
                  <div style={{marginTop:6}}>
                    <button style={S.botonMini} onClick={()=>empezarEditar(l)}>✏️ Editar</button>{" "}
                    <button style={S.botonMini} onClick={()=>borrarLinea(l.id)}>🗑️ Borrar</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <h3 style={{textAlign:"right"}}>Total: ${totalGeneral}</h3>
        <button style={S.boton} onClick={guardarPedido}>Guardar pedido</button>
      </div>

      <div style={S.lista}>
        <h2>Pedidos</h2>
        {pedidos.map(p => (
          <div key={p.id} style={S.pedido}>
            <div><b>Cliente:</b> {p.cliente}</div>
            <div><b>Fecha:</b> {p.fecha}</div>
            <div><b>Estado:</b> {p.estado}</div>
            <div>
              {p.lineas.map(l => (
                <div key={l.id} style={{fontSize:14}}>
                  • {l.producto}: {l.kilos} kg × ${l.precio} = ${l.subtotal}
                </div>
              ))}
            </div>
            <div style={{marginTop:6}}><b>Total:</b> ${p.total}</div>
            {p.estado !== "Entregado" && (
              <button style={S.botonMini} onClick={() => marcarEntregado(p.id)}>Marcar como entregado</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const S = {
  fondo: { backgroundColor:"#111", minHeight:"100vh", padding:20, color:"#fff" },
  loginBox: { background:"#1e1e1e", padding:30, borderRadius:10, maxWidth:320, margin:"80px auto", display:"flex", gap:10, flexDirection:"column" },
  titulo: { textAlign:"center", marginBottom:10 },
  tituloGrande: { textAlign:"center", marginBottom:20 },
  panel: { background:"#1e1e1e", padding:16, borderRadius:10, maxWidth:420, margin:"0 auto", display:"flex", gap:8, flexDirection:"column" },
  input: { padding:10, borderRadius:6, border:"none" },
  inputMini: { padding:8, borderRadius:6, border:"none", width:"100%", marginTop:6 },
  boton: { padding:10, borderRadius:6, border:"none", background:"#b30000", color:"#fff", cursor:"pointer" },
  botonSec: { padding:10, borderRadius:6, border:"none", background:"#333", color:"#fff", cursor:"pointer" },
  botonMini: { padding:6, borderRadius:6, border:"none", background:"#444", color:"#fff", cursor:"pointer", marginTop:6 },
  lista: { maxWidth:420, margin:"24px auto 0" },
  pedido: { background:"#222", padding:10, borderRadius:8, marginBottom:10 },
  linea: { background:"#222", padding:8, borderRadius:6, marginBottom:6 }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
