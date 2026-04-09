
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";

// Pages
import Workout from "../pages/Workout";
import Challenges from "../pages/Challenges";
import Community from "../pages/Community";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex min-h-screen bg-zinc-100">
      
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Navigate to="workouts" replace />} />
          <Route path="workouts" element={<Workout />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="community" element={<Community />} />
        </Routes>
      </div>
    </div>
  );
};

export default DashboardLayout;
