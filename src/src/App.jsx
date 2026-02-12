import { useEffect, useMemo, useState } from "react";

export default function App() {
  // ---- USUARIOS (simple, en memoria) ----
  const [usuarios, setUsuarios] = useState([
    { user: "raul diaz", pass: "raul2020" },
    { user: "yuliana", pass: "raul2020" },
  ]);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [nuevoUser, setNuevoUser] = useState("");
  const [nuevoPass, setNuevoPass] = useState("");

  // ---- PRODUCTOS BASE (editable por pedido) ----
  const productosIniciales = [
    { nombre: "Costilla", precio: 16000 },
    { nombre: "Pernil", precio: 16000 },
    { nombre: "Maza", precio: 16000 },
    { nombre: "Chuleta", precio: 16000 },
    { nombre: "Panceta", precio: 16000 },
  ];

  // ---- ESTADO DEL PEDIDO ----
  const [cliente, setCliente] = useState("");
  const [comentario, setComentario] = useState("");
  const [productos, setProductos] = useState(
    productosIniciales.map(p => ({ ...p, kilos: "" }))
  );
  const [historial, setHistorial] = useState([]);
  const [pagado, setPagado] = useState(false);

  // ---- FILTROS ----
  const [filtro, setFiltro] = useState("hoy"); // hoy | semana | mes | todos

  // ---- LOGIN ----
  const login = () => {
    const ok = usuarios.find(u => 
      u.user.toLowerCase() === loginUser.toLowerCase() && u.pass === loginPass
    );
    if (ok) setAutenticado(true);
    else alert("Usuario o contraseña incorrectos");
  };

  const crearUsuario = () => {
    if (!nuevoUser || !nuevoPass) return alert("Completa usuario y contraseña");
    setUsuarios([...usuarios, { user: nuevoUser, pass: nuevoPass }]);
    setNuevoUser("");
    setNuevoPass("");
    alert("Usuario creado");
  };

  // ---- CÁLCULOS ----
  const totalPedido = useMemo(() => {
    return productos.reduce((acc, p) => {
      const k = parseFloat(p.kilos) || 0;
      const pr = parseFloat(p.precio) || 0;
      return acc + k * pr;
    }, 0);
  }, [productos]);

  const actualizarProducto = (i, campo, valor) => {
    const copia = [...productos];
    copia[i][campo] = valor;
    setProductos(copia);
  };

  const guardarPedido = () => {
    if (!cliente) return alert("Pon el nombre del cliente");
    const pedido = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      cliente,
      comentario,
      productos,
      total: totalPedido,
      pagado,
    };
    setHistorial([pedido, ...historial]);
    // limpiar
    setCliente("");
    setComentario("");
    setProductos(productosIniciales.map(p => ({ ...p, kilos: "" })));
    setPagado(false);
  };

  // ---- FILTRADO POR FECHA ----
  const ahora = new Date();
  const filtrados = useMemo(() => {
    return historial.filter(p => {
      if (filtro === "todos") return true;
      const f = new Date(p.fecha);
      if (filtro === "hoy") {
        return f.toDateString() === ahora.toDateString();
      }
      if (filtro === "semana") {
        const diff = (ahora - f) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }
      if (filtro === "mes") {
        return f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear();
      }
      return true;
    });
  }, [historial, filtro]);

  // ---- EXPORTAR A EXCEL (CSV) ----
  const exportarExcel = () => {
    if (!filtrados.length) return alert("No hay pedidos para exportar");
    const encabezados = ["Fecha", "Cliente", "Productos", "Comentario", "Total", "Pagado"];
    const filas = filtrados.map(p => [
      new Date(p.fecha).toLocaleString(),
      p.cliente,
      p.productos.map(x => `${x.nombre} ${x.kilos || 0}kg @${x.precio}`).join(" | "),
      p.comentario || "",
      p.total,
      p.pagado ? "SI" : "NO",
    ]);
    const csv = [encabezados, ...filas]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "marranera_pedidos.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- UI ----
  if (!autenticado) {
    return (
      <div style={styles.page}>
        <h1 style={styles.title}>Marranera Sebasnuel</h1>
        <div style={styles.card}>
          <h3>Iniciar sesión</h3>
          <input placeholder="Usuario" value={loginUser} onChange={e=>setLoginUser(e.target.value)} style={styles.input}/>
          <input placeholder="Contraseña" type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} style={styles.input}/>
          <button onClick={login} style={styles.btn}>Entrar</button>
        </div>

        <div style={styles.card}>
          <h3>Crear usuario</h3>
          <input placeholder="Usuario" value={nuevoUser} onChange={e=>setNuevoUser(e.target.value)} style={styles.input}/>
          <input placeholder="Contraseña" type="password" value={nuevoPass} onChange={e=>setNuevoPass(e.target.value)} style={styles.input}/>
          <button onClick={crearUsuario} style={styles.btnAlt}>Crear</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Marranera Sebasnuel</h1>

      <div style={styles.card}>
        <h3>Cliente</h3>
        <input placeholder="Nombre del cliente" value={cliente} onChange={e=>setCliente(e.target.value)} style={styles.input}/>
      </div>

      <div style={styles.card}>
        <h3>Productos</h3>
        {productos.map((p, i) => (
          <div key={i} style={styles.row}>
            <strong style={{ width: 90 }}>{p.nombre}</strong>
            <input type="number" placeholder="Kilos" value={p.kilos}
              onChange={e=>actualizarProducto(i, "kilos", e.target.value)} style={styles.small}/>
            <input type="number" placeholder="Precio/kg" value={p.precio}
              onChange={e=>actualizarProducto(i, "precio", e.target.value)} style={styles.small}/>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <h3>Comentario</h3>
        <textarea placeholder="Ej: no tan gordo..." value={comentario}
          onChange={e=>setComentario(e.target.value)} style={styles.textarea}/>
        <label style={{display:"block", marginTop:8}}>
          <input type="checkbox" checked={pagado} onChange={e=>setPagado(e.target.checked)} /> Pagado
        </label>
        <h2>Total: ${totalPedido.toLocaleString()}</h2>
        <button onClick={guardarPedido} style={styles.btn}>Guardar pedido</button>
        <button onClick={()=>window.print()} style={styles.btnAlt}>Imprimir</button>
      </div>

      <div style={styles.card}>
        <h3>Historial</h3>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <select value={filtro} onChange={e=>setFiltro(e.target.value)} style={styles.input}>
            <option value="hoy">Hoy</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
            <option value="todos">Todos</option>
          </select>
          <button onClick={exportarExcel} style={styles.btnAlt}>Exportar a Excel</button>
        </div>

        {filtrados.map(p => (
          <div key={p.id} style={styles.hist}>
            <strong>{p.cliente}</strong> — ${p.total.toLocaleString()} — {p.pagado ? "Pagado" : "Pendiente"}
            <div style={{opacity:.8}}>{new Date(p.fecha).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:"100vh", background:"#0f0f12", color:"#fff", padding:20, fontFamily:"system-ui" },
  title: { textAlign:"center", marginBottom:20, letterSpacing:1 },
  card: { background:"#17171c", border:"1px solid #2a2a33", borderRadius:12, padding:12, marginBottom:12 },
  input: { width:"100%", padding:10, borderRadius:8, border:"1px solid #333", background:"#0f0f12", color:"#fff", marginBottom:8 },
  textarea: { width:"100%", minHeight:60, padding:10, borderRadius:8, border:"1px solid #333", background:"#0f0f12", color:"#fff" },
  row: { display:"flex", gap:8, alignItems:"center", marginBottom:8 },
  small: { width:110, padding:8, borderRadius:8, border:"1px solid #333", background:"#0f0f12", color:"#fff" },
  btn: { padding:"10px 14px", borderRadius:10, border:"none", background:"#2b7cff", color:"#fff", marginRight:8, cursor:"pointer" },
  btnAlt: { padding:"10px 14px", borderRadius:10, border:"1px solid #333", background:"#0f0f12", color:"#fff", cursor:"pointer" },
  hist: { borderTop:"1px dashed #2a2a33", paddingTop:8, marginTop:8 }
};
