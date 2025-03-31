import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./AppRoutes"; // Move routing logic to a separate component

const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
