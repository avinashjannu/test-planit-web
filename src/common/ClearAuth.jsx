import React, { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../AppContext";

const ClearAuth = () => {
  const { setAuth } = useContext(AppContext);
  console.log("hello");
  useEffect(() => {
    setAuth({});
  }, []);

  return <Navigate to={`${process.env.REACT_APP_BASE}/login`} />;
};

export default ClearAuth;
