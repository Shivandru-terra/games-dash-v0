import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const LoginSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(()=>{
    console.log("LoginSuccess mounted");
    console.log("Query string:", location.search);
  },[])

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const email = queryParams.get("email");
    const name = queryParams.get("name");
    const userId = queryParams.get("userId");
    console.log("✅ Extracted from URL:", { token, email, name });

    if (!email?.endsWith("@letsterra.com")) {
      navigate("/unauthorized");
    } else {
      localStorage.setItem("token", token!);
      localStorage.setItem("email", email!);
      localStorage.setItem("name", name!);
      localStorage.setItem("userId", userId);
      navigate("/dashboard");
    }
  }, [location.search, navigate]);

  return <p>Logging in...</p>;
};

export default LoginSuccess;
