// src/components/Admin.jsx
import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaDumbbell,
  FaFire,
  FaClipboardList,
  FaTrash,
  FaComments,
} from "react-icons/fa";

import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("Users"); // <-- Tracks which list to show

  // Load all data
  useEffect(() => {
    setUsers(JSON.parse(localStorage.getItem("allUsers")) || []);
    setWorkouts(JSON.parse(localStorage.getItem("workouts")) || []);
    setChallenges(JSON.parse(localStorage.getItem("challenges")) || []);
    setCommunityPosts(JSON.parse(localStorage.getItem("communityPosts")) || []);
  }, []);

  // DELETE FUNCTIONS
  const deleteUser = (id) => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser?.id === id) {
      alert("You cannot delete yourself!");
      return;
    }
    if (window.confirm("Are you sure you want to delete this user?")) {
      const updatedUsers = users.filter((u) => u.id !== id);
      setUsers(updatedUsers);
      localStorage.setItem("allUsers", JSON.stringify(updatedUsers));

      // Remove user's workouts, challenges, community posts
      const updatedWorkouts = workouts.filter((w) => w.creatorId !== id);
      setWorkouts(updatedWorkouts);
      localStorage.setItem("workouts", JSON.stringify(updatedWorkouts));

      const updatedChallenges = challenges.filter((c) => c.creatorId !== id);
      setChallenges(updatedChallenges);
      localStorage.setItem("challenges", JSON.stringify(updatedChallenges));

      const updatedPosts = communityPosts.filter((p) => p.userId !== id);
      setCommunityPosts(updatedPosts);
      localStorage.setItem("communityPosts", JSON.stringify(updatedPosts));
    }
  };

  const deleteWorkout = (id) => {
    if (window.confirm("Delete this workout?")) {
      const updated = workouts.filter((w) => w.id !== id);
      setWorkouts(updated);
      localStorage.setItem("workouts", JSON.stringify(updated));
    }
  };

  const deleteChallenge = (id) => {
    if (window.confirm("Delete this challenge?")) {
      const updated = challenges.filter((c) => c.id !== id);
      setChallenges(updated);
      localStorage.setItem("challenges", JSON.stringify(updated));
    }
  };

  const deletePost = (id) => {
    if (window.confirm("Delete this post?")) {
      const updated = communityPosts.filter((p) => p.id !== id);
      setCommunityPosts(updated);
      localStorage.setItem("communityPosts", JSON.stringify(updated));
    }
  };

  // CHART DATA (STATIC)
  const pieData = {
    labels: ["Users", "Workouts", "Challenges", "Community Posts"],
    datasets: [
      {
        data: [users.length, workouts.length, challenges.length, communityPosts.length],
        backgroundColor: ["#10b981", "#3b82f6", "#ef4444", "#f59e0b"],
      },
    ],
  };

  const barData = {
    labels: ["Users", "Workouts", "Challenges", "Community Posts"],
    datasets: [
      {
        label: "Count",
        data: [users.length, workouts.length, challenges.length, communityPosts.length],
        backgroundColor: "#10b981",
      },
    ],
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-r from-zinc-100 to-emerald-100">
      <h1 className="text-3xl font-bold mb-6 text-emerald-800">
        Admin Dashboard 🛠️
      </h1>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <Stat title="Users" value={users.length} icon={<FaUsers />} />
        <Stat title="Workouts" value={workouts.length} icon={<FaDumbbell />} />
        <Stat title="Challenges" value={challenges.length} icon={<FaFire />} />
        <Stat title="Community Posts" value={communityPosts.length} icon={<FaComments />} />
      </div>

      {/* TAB BUTTONS */}
      <div className="flex gap-4 mb-6">
        {["Users", "Workouts", "Challenges", "Community Posts"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold ${
              activeTab === tab ? "bg-emerald-500 text-white" : "bg-zinc-200 text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* LEFT SIDE - only show active tab */}
        <div className="md:w-3/5 space-y-6">
          {activeTab === "Users" && (
            <Section
              title="Users"
              data={users}
              onDelete={deleteUser}
              render={(u) => (
                <>
                  <span className="font-semibold">{u.name}</span>
                  <span className="text-sm text-gray-500">{u.userType || "User"}</span>
                </>
              )}
            />
          )}

          {activeTab === "Workouts" && (
            <Section
              title="Workouts"
              data={workouts}
              onDelete={deleteWorkout}
              render={(w) => (
                <>
                  <span className="font-semibold">{w.name}</span>
                  <span className="text-sm text-gray-500">By {w.creatorName}</span>
                </>
              )}
            />
          )}

          {activeTab === "Challenges" && (
            <Section
              title="Challenges"
              data={challenges}
              onDelete={deleteChallenge}
              render={(c) => (
                <>
                  <span className="font-semibold">{c.title}</span>
                  <span className="text-sm text-gray-500">By {c.creatorName}</span>
                </>
              )}
            />
          )}

          {activeTab === "Community Posts" && (
            <Section
              title="Community Posts"
              data={communityPosts}
              onDelete={deletePost}
              render={(p) => (
                <>
                  <span className="font-semibold">{p.userName}</span>
                  <span className="text-sm text-gray-500">{p.content.slice(0, 40)}...</span>
                </>
              )}
            />
          )}
        </div>

        {/* RIGHT SIDE - CHARTS (STATIC) */}
        <div className="md:w-2/5 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow border-2 border-emerald-300">
            <h2 className="font-bold mb-4 text-emerald-700">Overview (Pie)</h2>
            <Pie data={pieData} />
          </div>
          <div className="bg-white p-6 rounded-xl shadow border-2 border-emerald-300">
            <h2 className="font-bold mb-4 text-emerald-700">Overview (Bar)</h2>
            <Bar data={barData} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* SMALL COMPONENTS */
const Stat = ({ title, value, icon }) => (
  <div className="bg-white p-5 rounded-xl shadow border-l-4 border-emerald-400">
    <div className="text-2xl mb-2 text-emerald-600">{icon}</div>
    <h3 className="font-semibold">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const Section = ({ title, data, onDelete, render }) => (
  <div className="bg-white p-6 rounded-xl shadow border-2 border-emerald-300 mb-8">
    <h2 className="text-xl font-bold mb-4 text-emerald-700">{title}</h2>

    {data.length === 0 ? (
      <p className="text-gray-500">No data</p>
    ) : (
      <ul className="space-y-3">
        {data.map((item) => (
          <li
            key={item.id}
            className="flex justify-between items-center border-b pb-2"
          >
            <div className="flex flex-col">{render(item)}</div>
            <button
              onClick={() => onDelete(item.id)}
              className="text-red-500 hover:text-red-700"
            >
              <FaTrash />
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default Admin;
