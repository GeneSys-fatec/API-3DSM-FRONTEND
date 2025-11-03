import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LayoutPrincipal from "./layouts/LayoutPrincipal";

import Cadastro from "./pages/Cadastro";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Equipes from "./pages/Equipes";
import Calendario from "./pages/Calendario";
import Tarefas from "./pages/Tarefas";
import Dashboard from "./pages/Dashboard";
import { ModalProvider } from "./context/ModalContext";
import ModalRenderer from "./components/ModalRenderer";
import { AuthProvider } from "./context/AuthContext";
import RotaProtegida from "./components/common/RotaProtegida";

function App() {
  return (
    <>
      <AuthProvider>
        <Router>
          <ModalProvider>
            <Routes>
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/login" element={<Login />} />
              <Route element={<RotaProtegida />}>
                <Route element={<LayoutPrincipal />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/equipes" element={<Equipes />} />
                  <Route path="/calendario" element={<Calendario />} />
                  <Route path="/tarefas" element={<Tarefas />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                </Route>
              </Route>
            </Routes>
            <ModalRenderer />
          </ModalProvider>
        </Router>
      </AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;
