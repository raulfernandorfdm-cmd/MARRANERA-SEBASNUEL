import { useState } from "react"

export default function App() {
  const [usuario, setUsuario] = useState("")
  const [password, setPassword] = useState("")
  const [logueado, setLogueado] = useState(false)

  const usuariosIniciales = [
    { usuario: "rauldiaz", password: "raul2020" },
    { usuario: "yuliana", password: "raul2020" }
  ]

  const iniciarSesion = () => {
    const existe = usuariosIniciales.find(
      u => u.usuario === usuario && u.password === password
    )

    if (existe) {
      setLogueado(true)
    } else {
      alert("Usuario o contraseña incorrectos")
    }
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
      <p style={{ color: "white" }}>Bienvenido al sistema 🔥</p>
    </div>
  )
}

const estilos = {
  fondo: {
    backgroundColor: "#111",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column"
  },
  loginBox: {
    backgroundColor: "#1e1e1e",
    padding: "40px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    width: "300px"
  },
  titulo: {
    color: "white",
    textAlign: "center"
  },
  tituloGrande: {
    color: "white",
    fontSize: "40px"
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
  }
}
