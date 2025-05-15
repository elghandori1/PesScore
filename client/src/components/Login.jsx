import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import footballBg from "../assets/images/efootbalBG3.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert({ message: "", type: "" });
    }, 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        showAlert("Login successful!", "success");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        showAlert(result.message || "An unknown error occurred", "error");
      }
    } catch (err) {
      console.error("Login error:", err);
      showAlert("Something went wrong. Please try again.", "error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center overflow-x-hidden relative">
      {/* Background Image */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${footballBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      />

      {/* Alert Notification */}
      {alert.message && (
        <div
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 max-w-[400px] min-w-[250px] px-6 py-4 rounded font-bold text-center z-[1000] transition-opacity duration-300 border-l-4 shadow-lg flex items-center justify-between space-x-4 ${
            alert.type === "success"
              ? "bg-[#e8f5e9] text-[#2e7d32] border-[#2e7d32]"
              : "bg-red-100 text-red-800 border-red-600"
          }`}
        >
          <span>{alert.message}</span>
          <button
            className={`text-xl font-bold ${
              alert.type === "success"
                ? "text-[#2e7d32] hover:text-[#1b5e20]"
                : "text-red-800 hover:text-red-600"
            }`}
            onClick={() => setAlert({ message: "", type: "" })}
          >
            &times;
          </button>
        </div>
      )}
      {/* Header */}
      <header className="w-full flex justify-between items-center px-5 py-4 text-white fixed top-0 left-0 z-10 bg-black/60">
        <h2 className="text-2xl font-bold">PesScore</h2>
        <div>
          <Link to="/" className="bg-white/20 hover:bg-white/40 text-white font-semibold px-4 py-2 rounded-full transition">
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex flex-1 mt-24 justify-center pb-10 px-1">
        <section className="bg-white p-8 rounded-2xl shadow-lg h-1/3 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">Sign In</h2>

          <form className="flex flex-col gap-4 text-left" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block mb-1 font-medium text-gray-700">Email</label>
              <input
                type="text"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-1 font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="mt-4 bg-gradient-to-r from-blue-700 to-blue-500 text-white py-2 rounded-xl font-semibold hover:scale-105 transition"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-gray-700">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-700 font-semibold hover:underline">
              Register
            </Link>
          </p>
        </section>
      </main>

      <footer className="bg-gradient-to-r from-blue-800 to-blue-700 text-white w-full text-center py-4 mt-auto text-sm backdrop-blur-sm">
        PesScore © 2025 - Football Match Tracker
      </footer>
    </div>
  );
}

export default Login;
