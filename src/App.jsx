import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Hospitals from "./pages/Hospitals";
import MyTickets from "./pages/MyTickets";
import About from "./pages/About";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Login route - standalone without layout */}
            <Route path="/login" element={<Login />} />

            {/* Main app routes with layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="hospitals" element={<Hospitals />} />
              <Route path="tickets" element={<MyTickets />} />
              <Route path="about" element={<About />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Catch all route - redirect to dashboard */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
