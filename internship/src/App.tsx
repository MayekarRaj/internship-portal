import React from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import AdminRouter from "./components/admin/AdminRouter";
import InternshipPortal from "./pages/InternshipPortal";

// Root App with Provider
const App: React.FC = () => {
  // Check if we're on an admin route
  const isAdminRoute = window.location.pathname.startsWith('/admin') || window.location.hash.startsWith('#admin');
  
  if (isAdminRoute) {
    return (
      <Provider store={store}>
        <AdminRouter />
      </Provider>
    );
  }
  
  return (
    <Provider store={store}>
      <InternshipPortal />
    </Provider>
  );
};

export default App;
