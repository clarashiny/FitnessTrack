// src/components/Challenges.jsx
import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { FaBell, FaCheck, FaTimes, FaEdit, FaTrash, FaPlus } from "react-icons/fa";


ChartJS.register(ArcElement, Tooltip, Legend);

const Challenges = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return <p className="text-red-500 text-center mt-10">No logged-in user found!</p>;

  const [allUserChallenges, setAllUserChallenges] = useState(() => JSON.parse(localStorage.getItem("userChallenges")) || {});
  const [allUserNotifications, setAllUserNotifications] = useState(() => JSON.parse(localStorage.getItem("userNotifications")) || {});
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddChallenge, setShowAddChallenge] = useState(false);
  const [challengeForm, setChallengeForm] = useState({ title: "", description: "" });

  useEffect(() => { localStorage.setItem("userChallenges", JSON.stringify(allUserChallenges)); }, [allUserChallenges]);
  useEffect(() => { localStorage.setItem("userNotifications", JSON.stringify(allUserNotifications)); }, [allUserNotifications]);

  // Notifications
  const getRecentNotifications = () => {
    const notifs = allUserNotifications[currentUser.username] || [];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return notifs.filter(n => new Date(n.timestamp) >= weekAgo);
  };

  const addNotification = (type, challenge, username) => {
    const newNotif = {
      id: Date.now() + Math.random(),
      type,
      challengeTitle: challenge.title,
      timestamp: new Date().toISOString(),
      status: type === "completed" ? "done" : "new",
    };
    setAllUserNotifications(prev => ({
      ...prev,
      [username]: [...(prev[username] || []), newNotif]
    }));
  };

  // Post Challenge
  const postChallenge = () => {
    if (!challengeForm.title) return alert("Title required!");
    const newCh = {
      id: Date.now() + Math.random(),
      title: challengeForm.title,
      description: challengeForm.description,
      createdAt: new Date().toLocaleString(),
      status: "notStarted",
      acceptedAt: null,
      completedAt: null,
      sender: currentUser.username
    };

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const recipients = users.filter(u => u.username !== currentUser.username);
    recipients.forEach(u => {
      setAllUserChallenges(prev => ({
        ...prev,
        [u.username]: [...(prev[u.username] || []), newCh]
      }));
      addNotification("new challenge", newCh, u.username);
    });

    // Add to own challenges
    setAllUserChallenges(prev => ({
      ...prev,
      [currentUser.username]: [...(prev[currentUser.username] || []), newCh]
    }));

    setChallengeForm({ title: "", description: "" });
    setShowAddChallenge(false);
  };

  const editChallenge = (id) => {
    const newTitle = prompt("New Title") || "";
    const newDesc = prompt("New Description") || "";
    setAllUserChallenges(prev => ({
      ...prev,
      [currentUser.username]: prev[currentUser.username].map(c => c.id === id ? { ...c, title: newTitle, description: newDesc } : c)
    }));
  };

  const deleteChallenge = (id) => {
    setAllUserChallenges(prev => ({
      ...prev,
      [currentUser.username]: prev[currentUser.username].filter(c => c.id !== id)
    }));
  };

  const acceptChallenge = (id) => {
    const userChallenges = allUserChallenges[currentUser.username] || [];
    const updatedChallenges = userChallenges.map(c => c.id === id ? { ...c, status: "ready", acceptedAt: new Date().toLocaleString() } : c);
    setAllUserChallenges(prev => ({ ...prev, [currentUser.username]: updatedChallenges }));
    const challenge = updatedChallenges.find(c => c.id === id);
    addNotification("accepted", challenge, currentUser.username);
  };

  const rejectChallenge = (id) => {
    const userChallenges = allUserChallenges[currentUser.username] || [];
    const updatedChallenges = userChallenges.filter(c => c.id !== id);
    setAllUserChallenges(prev => ({ ...prev, [currentUser.username]: updatedChallenges }));
  };

  // Chart
  const challenges = allUserChallenges[currentUser.username] || [];
  const completedCount = challenges.filter(c => c.status === "completed").length;
  const readyCount = challenges.filter(c => c.status === "ready").length;
  const notStartedCount = challenges.filter(c => c.status === "notStarted").length;
  const data = {
    labels: ["Completed", "Ready", "Not Started"],
    datasets: [{
      data: [completedCount, readyCount, notStartedCount],
      backgroundColor: ["#10b981", "#3b82f6", "#9ca3af"]
    }]
  };

  // Leaderboard
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const leaderboard = users
    .filter(u => u.username !== currentUser.username)
    .map(u => {
      const userCh = allUserChallenges[u.username] || [];
      return { name: u.name, completed: userCh.filter(c => c.status === "completed").length };
    })
    .sort((a, b) => b.completed - a.completed);

  // Card colors
  const cardColors = ["bg-emerald-50", "bg-teal-50", "bg-zinc-100"];

  return (
    <div className="p-4 bg-gray-100 min-h-screen text-zinc-900 grid md:grid-cols-3 gap-6">
      {/* Left: Challenges */}
      <div className="md:col-span-2 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-teal-600">Welcome, {currentUser.name}</h2>

        <div className="flex gap-2">
          <button onClick={()=>setShowAddChallenge(!showAddChallenge)} className="bg-emerald-500 px-4 py-2 rounded hover:bg-emerald-600 text-white flex items-center gap-1">
            <FaPlus /> {showAddChallenge ? "Cancel" : "Add Challenge"}
          </button>

          <button onClick={()=>setShowNotifications(!showNotifications)} className="bg-teal-500 px-4 py-2 rounded hover:bg-teal-600 text-white flex items-center gap-1">
            <FaBell /> Notifications ({getRecentNotifications().length})
          </button>
        </div>

        {showAddChallenge && (
          <div className="p-4 rounded shadow border border-zinc-300">
            <input type="text" placeholder="Challenge Title" value={challengeForm.title} onChange={e=>setChallengeForm({...challengeForm,title:e.target.value})} className="w-full mb-2 p-2 rounded border border-zinc-300"/>
            <textarea placeholder="Description" value={challengeForm.description} onChange={e=>setChallengeForm({...challengeForm,description:e.target.value})} className="w-full mb-2 p-2 rounded border border-zinc-300"/>
            <button onClick={postChallenge} className="bg-teal-500 px-4 py-2 rounded hover:bg-teal-600 text-white flex items-center gap-1"><FaPlus /> Post Challenge</button>
          </div>
        )}

        {showNotifications && (
          <div className="bg-zinc-100 p-4 rounded shadow max-h-64 overflow-y-auto">
            {getRecentNotifications().length === 0 ? <p className="text-zinc-500 text-center">No new notifications</p> :
              getRecentNotifications().map(n => (
                <div key={n.id} className="border-l-4 border-emerald-500 pl-3 mb-2">
                  <p className="text-sm">{n.challengeTitle}</p>
                  <p className="text-xs text-zinc-500 italic">{n.type} - {new Date(n.timestamp).toLocaleString()}</p>
                </div>
              ))
            }
          </div>
        )}

        <h3 className="text-lg font-bold mb-2 text-teal-600">Your Challenges</h3>
        {challenges.length === 0 ? <p className="text-zinc-500">No challenges yet</p> : (
          challenges.map((c,i) => (
            <div key={c.id} className={`${cardColors[i % cardColors.length]} p-4 rounded shadow-inner border border-zinc-200 mb-2`}>
              <h4 className="font-semibold text-emerald-600">{c.title}</h4>
              <p className="text-zinc-700">{c.description}</p>
              <p className="text-xs text-zinc-500">Created: {c.createdAt}</p>
              {c.acceptedAt && <p className="text-xs text-teal-600">Accepted: {c.acceptedAt}</p>}

              <div className="flex gap-2 mt-2">
                {c.sender === currentUser.username ? (
                  <>
                    <button onClick={()=>editChallenge(c.id)} className="bg-emerald-500 px-2 py-1 rounded text-white flex items-center gap-1 hover:bg-emerald-600"><FaEdit /> Edit</button>
                    <button onClick={()=>deleteChallenge(c.id)} className="bg-red-500 px-2 py-1 rounded text-white flex items-center gap-1 hover:bg-red-600"><FaTrash /> Delete</button>
                  </>
                ) : (
                  <>
                    {c.status === "notStarted" && (
                      <>
                        <button onClick={()=>acceptChallenge(c.id)} className="bg-teal-500 px-2 py-1 rounded text-white flex items-center gap-1 hover:bg-teal-600"><FaCheck /> Accept</button>
                        <button onClick={()=>rejectChallenge(c.id)} className="bg-red-500 px-2 py-1 rounded text-white flex items-center gap-1 hover:bg-red-600"><FaTimes /> Reject</button>
                      </>
                    )}
                    {c.status === "ready" && <span className="text-teal-600 px-2 py-1 rounded border border-teal-600 flex items-center gap-1"><FaCheck /> Ready</span>}
                    {c.status === "completed" && <span className="text-emerald-600 px-2 py-1 rounded border border-emerald-600 flex items-center gap-1"><FaCheck /> Completed</span>}
                  </>
                )}
              </div>
            </div>
          ))
        )}

        {/* Chart below challenges */}
        <div className="bg-zinc-50 p-4 rounded shadow mt-4 w-full max-w-md mx-auto">
          <h3 className="text-lg font-bold mb-2 text-center text-teal-600">Progress</h3>
          <Pie data={data} />
        </div>
      </div>

      {/* Right: Leaderboard */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold mb-2 text-center text-teal-800">Leaderboard</h3>
        <div className="bg-zinc-50 p-4 rounded shadow max-h-[70vh] overflow-y-auto border border-zinc-200">
          {leaderboard.length === 0 ? <p className="text-zinc-500 text-center">No other users</p> : leaderboard.map((u, idx) => (
            <div key={u.name} className={`flex justify-between mb-2 ${idx===0 ? "font-bold text-emerald-600" : ""}`}>
              <span>{idx + 1}. {u.name}</span>
              <span>{u.completed} ✔️</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Challenges;
