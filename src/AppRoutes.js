import { useRoutes, Navigate } from "react-router-dom";
import Board from "./ProjectManagementTool/Board/Board";
import { PrivateRoute, PublicRoute } from "./common/route";
import Login from "./User/Login";
import ClearAuth from "./common/ClearAuth";
const AppRoutes = () => {
  const routes = [
    {
      path: `${process.env.REACT_APP_BASE}/board`,
      element: (
        <PrivateRoute>
          <Board />
        </PrivateRoute>
      ),
    },
    {
      path: `${process.env.REACT_APP_BASE}/clearAuth`,
      element: (
        <PrivateRoute>
          <ClearAuth />
        </PrivateRoute>
      ),
    },
    {
      path: `${process.env.REACT_APP_BASE}/login`,
      element: (
        <PublicRoute>
          <Login />
        </PublicRoute>
      ),
    },
    {
      path: "*",
      element: <Navigate to={`${process.env.REACT_APP_BASE}/login`} />,
    },
  ];

  return useRoutes(routes);
};

export default AppRoutes;
