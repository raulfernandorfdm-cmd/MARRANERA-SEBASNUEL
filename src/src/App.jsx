import { useState } from "react";

export default function App() {
  // Usuarios iniciales
  const [usuarios, setUsuarios] = useState([
    { user: "raul", pass: "raul2020" },
    { user: "yuliana", pass: "raul2020" },
  ]);

  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [usuarioActivo, setUsuarioActivo] = useState(null);

  const productosBase = [
    { nombre: "Costilla", precio: 16000 },
    { nombre: "Pernil", precio: 16000 },
    { nombre: "Maza", precio: 16000 },
    { nombre: "Chuleta", precio: 16000 },
    { nombre: "Panceta", precio: 16000 },
  ];

  const [cliente, setCliente] = useState("");
  const [items, setItems] = useState([
    { producto: "Costilla", kilos: "", precio: 16000, comentario: "" }
  ]);
  const [pedidos, setPedidos] = useState([]);

  const login = () => {
    const ok = usuarios.find(u => u.user === loginUser && u.pass === loginPass);
    if (!ok) return alert("Usuario o contraseña incorrectos");
    setUsuarioActivo(loginUser);
    setLoginUser("");
    setLoginPass("");
  };

  const crearUsuario = () => {
    if (!loginUser || !loginPass) return alert("Usuario y contraseña requeridos");
    if (usuarios.find(u => u.user === loginUser)) return alert("Ese usuario ya existe");

    setUsuarios([...usuarios, { user: loginUser, pass: loginPass }]);
    alert("Usuario creado");
    setLoginUser("");
    setLoginPass("");
  };

  const logout = () => setUsuarioActivo(null);

  const agregarProducto = () => {
    setItems([...items, { producto: "Costilla", kilos: "", precio: 16000, comentario: "" }]);
  };

  const actualizarItem = (i, campo, valor) => {
    const copia = [...items];
    copia[i][campo] = valor;
    setItems(copia);
  };

  const total = items.reduce((acc, p) => {
    const k = parseFloat(p.kilos) || 0;
    const pr = parseFloat(p.precio) || 0;
    return acc + k * pr;
  }, 0);

  const guardarPedido = () => {
    if (!cliente) return alert("Escribe el nombre del cliente");

    const nuevo = {
      id: Date.now(),
      usuario: usuarioActivo,
      cliente,
      fecha: new Date().toLocaleString(),
      items,
      total,
      estado: "Pendiente",
    };

    setPedidos([nuevo, ...pedidos]);
    setCliente("");
    setItems([{ producto: "Costilla", kilos: "", precio: 16000, comentario: "" }]);
  };

  const marcarEntregado = (id) => {
    setPedidos(pedidos.map(p => p.id === id ? { ...p, estado: "Entregado" } : p));
  };

  if (!usuarioActivo) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#1a1a1a", padding: 30, borderRadius: 10, width: 300 }}>
          <h2>Iniciar sesión</h2>
          <input
            placeholder="Usuario"
            value={loginUser}
            onChange={e => setLoginUser(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={loginPass}
            onChange={e => setLoginPass(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />
          <button onClick={login} style={{ width: "100%", padding: 10, marginBottom: 10 }}>Entrar</button>
          <button onClick={crearUsuario} style={{ width: "100%", padding: 10 }}>Crear usuario</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>Marranera Sebasnuel</h1>
      <p>Usuario: {usuarioActivo} <button onClick={logout}>Cerrar sesión</button></p>

      <div style={{ maxWidth: 400, margin: "auto", background: "#1a1a1a", padding: 20, borderRadius: 10 }}>
        <input
          placeholder="Nombre del cliente"
          value={cliente}
          onChange={e => setCliente(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        {items.map((i, idx) => (
          <div key={idx} style={{ marginBottom: 10, borderBottom: "1px solid #333", paddingBottom: 10 }}>
            <select
              value={i.producto}
              onChange={e => actualizarItem(idx, "producto", e.target.value)}
              style={{ width: "100%", padding: 8 }}
            >
              {productosBase.map(p => (
                <option key={p.nombre}>{p.nombre}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Precio por kilo"
              value={i.precio}
              onChange={e => actualizarItem(idx, "precio", e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 5 }}
            />

            <input
              type="number"
              placeholder="Kilos"
              value={i.kilos}
              onChange={e => actualizarItem(idx, "kilos", e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 5 }}
            />

            <input
              placeholder="Comentario (ej: no muy gordo)"
              value={i.comentario}
              onChange={e => actualizarItem(idx, "comentario", e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 5 }}
            />
          </div>
        ))}

        <button onClick={agregarProducto} style={{ width: "100%", padding: 10, marginBottom: 10 }}>
          ➕ Agregar producto
        </button>

        <h3>Total: ${total.toLocaleString()}</h3>

        <button onClick={guardarPedido} style={{ width: "100%", padding: 12, background: "red", color: "#fff" }}>
          Guardar pedido
        </button>
      </div>

      <h2>Pedidos</h2>

      {pedidos.map(p => (
        <div key={p.id} style={{ background: "#222", padding: 15, borderRadius: 8, marginBottom: 10 }}>
          <strong>Cliente:</strong> {p.cliente}<br />
          <strong>Usuario:</strong> {p.usuario}<br />
          <strong>Fecha:</strong> {p.fecha}<br />
          <strong>Estado:</strong> {p.estado}<br />

          {p.items.map((i, idx) => (
            <div key={idx}>
              • {i.producto}: {i.kilos}kg x ${i.precio} = ${(i.kilos * i.precio).toLocaleString()}  
              <br />Comentario: {i.comentario || "N/A"}
            </div>
          ))}

          <strong>Total: ${p.total.toLocaleString()}</strong><br /><br />

          {p.estado === "Pendiente" && (
            <button onClick={() => marcarEntregado(p.id)}>Marcar como entregado</button>
          )}
        </div>
      ))}
    </div>
  );
}
