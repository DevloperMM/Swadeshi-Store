import React, { useEffect } from "react";
import { LoadingSpinner, Navbar } from "./components/index.js";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./store/useUserStore.js";
import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage, SignupPage, LoginPage, AdminPage } from "./pages/index.js";

function App() {
  const { checkAuth, checkingAuth, user } = useUserStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (checkingAuth) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]" />
        </div>
      </div>

      <div className="relative z-50 pt-20">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/signup"
            element={!user ? <SignupPage /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!user ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route
            path="/dashboard"
            element={
              user?.role === "admin" ? <AdminPage /> : <Navigate to="/login" />
            }
            // Need to fix this as customer will not be able to go and without any indication login will redirect him to home
          />
        </Routes>
        <Toaster />
      </div>
    </div>
  );
}

export default App;
