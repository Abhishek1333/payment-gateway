import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PaymentPage from "./pages/PaymentPage";
import ProtectedRoute from "./components/ProtectedRoute"; 
import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/payment" element={<PaymentPage />} />
        </Route>

        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
