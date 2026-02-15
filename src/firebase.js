import { useState } from "react";
import Inventario from "./components/Inventario";

export default function App() {
  const [usuarioActual] = useState("Raúl Díaz"); // luego lo haremos con login real

  return (
    <div className="contenedor">
      <h1>Marranera Sebasnuel</h1>
      <p>Usuario: {usuarioActual}</p>

      <Inventario usuarioActual={usuarioActual} />
    </div>
  );
}
