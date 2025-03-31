import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../AppContext";
import AppLayout from "./layout/AppLayout";

export const PrivateRoute = ({ children }) => {
  const { auth } = useContext(AppContext);
  let isAuthenticated = false;
  if (auth && auth.accessToken) {
    isAuthenticated = true;
  }
  return isAuthenticated ? (
    <AppLayout isAuthenticated={isAuthenticated}>{children}</AppLayout>
  ) : (
    <Navigate to={`${process.env.REACT_APP_BASE}/login`} replace />
  );
};

export const PublicRoute = ({ children }) => {
  return <AppLayout>{children}</AppLayout>;
};
