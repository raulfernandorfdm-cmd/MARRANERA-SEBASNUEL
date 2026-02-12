import React, { useState } from "react"
import ReactDOM from "react-dom/client"

function App() {
  const [usuario, setUsuario] = useState("")
  const [password, setPassword] = useState("")
  const [logueado, setLogueado] = useState(false)

  const usuarios = [
    { usuario: "rauldiaz", password: "raul2020" },
    { usuario: "yuliana", password: "raul2020" }
  ]

  const productosIniciales = [
    { nombre: "Costilla", precio: 16000 },
    { nombre: "Pernil", precio: 17000 },
    { nombre: "Maza", precio: 18000 },
    { nombre: "Chuleta", precio: 19000 },
    { nombre: "Panceta", precio: 20000 }
  ]

  const [productos, setProductos] = useState(productosIniciales)
  const [productoSeleccionado, setProductoSeleccionado] = useState(productos[0])
  const [kilos, setKilos] = useState("")
  const [precio, setPrecio] = useState(productos[0].precio)
  const [comentario, setComentario] = useState("")
  const [pedidos, setPedidos] = useState([])

  const iniciarSesion = () => {
    const existe = usuarios.find(
      u => u.usuario === usuario && u.password === password
    )
    if (existe) {
      setLogueado(true)
    } else {
      alert("Usuario o contraseña incorrectos")
    }
  }

  const guardarPedido = () => {
    const kilosNum = parseFloat(kilos)
    if (!kilosNum) return alert("Ingresa los kilos")

    const total = kilosNum * precio

    const nuevoPedido = {
      id: Date.now(),
      producto: productoSeleccionado.nombre,
      kilos: kilosNum,
      precio,
      total,
      comentario
    }

    setPedidos([...pedidos, nuevoPedido])
    setKilos("")
    setComentario("")
  }

  const cambiarProducto = (nombre) => {
    const prod = productos.find(p => p.nombre === nombre)
    setProductoSeleccionado(prod)
    setPrecio(prod.precio)
  }

  if (!logueado) {
    return (
      <div style={estilos.fondo}>
        <div style={estilos.loginBox}>
          <h1 style={estilos.titulo}>Marranera Sebasnuel</h1>
          <input
            style={estilos.input}
            placeholder="Usuario"
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
          />
          <input
            style={estilos.input}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button style={estilos.boton} onClick={iniciarSesion}>
            Ingresar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={estilos.fondo}>
      <h1 style={estilos.tituloGrande}>Marranera Sebasnuel</h1>

      <div style={estilos.panel}>

        <select
          style={estilos.input}
          onChange={(e) => cambiarProducto(e.target.value)}
        >
          {productos.map(p => (
            <option key={p.nombre}>{p.nombre}</option>
          ))}
        </select>

        <input
          style={estilos.input}
          placeholder="Kilos"
          type="number"
          value={kilos}
          onChange={e => setKilos(e.target.value)}
        />

        <input
          style={estilos.input}
          placeholder="Precio por kilo"
          type="number"
          value={precio}
          onChange={e => setPrecio(parseFloat(e.target.value))}
        />

        <input
          style={estilos.input}
          placeholder="Comentario (ej: no muy gordo)"
          value={comentario}
          onChange={e => setComentario(e.target.value)}
        />

        <button style={estilos.boton} onClick={guardarPedido}>
          Guardar Pedido
        </button>

      </div>

      <div style={estilos.lista}>
        {pedidos.map(p => (
          <div key={p.id} style={estilos.pedido}>
            <strong>{p.producto}</strong> - {p.kilos}kg  
            <br />
            Total: ${p.total}
            <br />
            <em>{p.comentario}</em>
          </div>
        ))}
      </div>

    </div>
  )
}

const estilos = {
  fondo: {
    backgroundColor: "#111",
    minHeight: "100vh",
    padding: "20px",
    color: "white"
  },
  loginBox: {
    backgroundColor: "#1e1e1e",
    padding: "40px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    width: "300px",
    margin: "auto",
    marginTop: "100px"
  },
  titulo: {
    textAlign: "center"
  },
  tituloGrande: {
    textAlign: "center",
    marginBottom: "20px"
  },
  panel: {
    backgroundColor: "#1e1e1e",
    padding: "20px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxWidth: "400px",
    margin: "auto"
  },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "none"
  },
  boton: {
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#b30000",
    color: "white",
    cursor: "pointer"
  },
  lista: {
    marginTop: "30px",
    maxWidth: "400px",
    marginLeft: "auto",
    marginRight: "auto"
  },
  pedido: {
    backgroundColor: "#222",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "10px"
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
