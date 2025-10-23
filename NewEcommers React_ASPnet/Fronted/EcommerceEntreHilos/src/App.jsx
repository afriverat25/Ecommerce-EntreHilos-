// Archivo: App.jsx

// 1. Importa el componente que contiene todas tus rutas
import RouterPage from "./Components/Router.jsx"; 
import './App.css' // Mantenemos la importación de CSS si la necesitas

function App() {
  // 2. Retorna solo el componente de rutas
  return (
    <>
      {/* RouterPage ya contiene el <Router> y el <Routes> */}
      <RouterPage /> 
    </>
  )
}

export default App