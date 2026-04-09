import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {/* Sidebar – dashboard nav only */}
      <Sidebar />

      {/* Right side content – workouts / challenges / community */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
