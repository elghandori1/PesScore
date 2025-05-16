import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await fetch("http://localhost:5000/logout", {
          method: "GET",
          credentials: "include", // Important for cookies/sessions
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Redirect to login after logout
        navigate("/login");
      } catch (error) {
        console.error("Logout failed:", error);
        navigate("/login"); // Fallback
      }
    };

    handleLogout();
  }, [navigate]);

  return <div>Logging you out...</div>;
};

export default Logout;