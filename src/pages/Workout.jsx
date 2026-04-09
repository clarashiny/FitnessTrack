// src/components/Workout.jsx
import React, { useState, useEffect } from "react";
import { FaRunning, FaDumbbell, FaTrash, FaEdit } from "react-icons/fa";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const Workout = () => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("users");
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem("currentUserEmail");
    if (savedEmail) {
      const foundUser = users.find((u) => u.email === savedEmail);
      setCurrentUser(foundUser || null);
    }
  }, [users]);

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  /* ---------- Profile ---------- */
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    age: "",
    height: "",
    weight: "",
    goalWeight: "",
    activityLevel: ""
  });

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || "",
        age: currentUser.age || "",
        height: currentUser.height || "",
        weight: currentUser.weight || "",
        goalWeight: currentUser.goalWeight || "",
        activityLevel: currentUser.activityLevel || ""
      });
    }
  }, [currentUser]);

  const handleProfileChange = (e) =>
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });

  const saveProfile = () => {
    if (!profileForm.name || !profileForm.weight || !profileForm.goalWeight)
      return alert("Fill required fields");

    const updatedUser = {
      ...currentUser,
      ...profileForm,
      weightHistory: [
        ...(currentUser.weightHistory || []),
        { weight: Number(profileForm.weight), dateTime: new Date().toLocaleString() }
      ]
    };

    const updatedUsers = users.map((u) => (u.email === currentUser.email ? updatedUser : u));
    setUsers(updatedUsers);
    setCurrentUser(updatedUser); // Update immediately
    setShowProfileForm(false);   // Close form after saving
    alert("Profile updated!");
  };

  const calculateBMI = () => {
    const heightM = profileForm.height / 100;
    return profileForm.weight && heightM
      ? (profileForm.weight / (heightM * heightM)).toFixed(1)
      : "-";
  };

  /* ---------- Workout ---------- */
  const [workoutForm, setWorkoutForm] = useState({
    name: "",
    type: "",
    description: "",
    duration: "",
    dateTime: ""
  });
  const [isEditingWorkout, setIsEditingWorkout] = useState(false);

  const handleWorkoutChange = (e) =>
    setWorkoutForm({ ...workoutForm, [e.target.name]: e.target.value });

  const addOrUpdateWorkout = (e) => {
    e.preventDefault();
    if (!workoutForm.name || !workoutForm.type || !workoutForm.duration)
      return alert("Fill required fields");

    const newWorkout = {
      ...workoutForm,
      id: isEditingWorkout ? workoutForm.id : Date.now(),
      dateTime: workoutForm.dateTime || new Date().toLocaleString()
    };

    const updatedUser = {
      ...currentUser,
      workouts: isEditingWorkout
        ? currentUser.workouts.map((w) => (w.id === workoutForm.id ? newWorkout : w))
        : [...(currentUser.workouts || []), newWorkout]
    };

    const updatedUsers = users.map((u) => (u.email === currentUser.email ? updatedUser : u));
    setUsers(updatedUsers);
    setCurrentUser(updatedUser);

    setWorkoutForm({ name: "", type: "", description: "", duration: "", dateTime: "" });
    setIsEditingWorkout(false);
  };

  const editWorkout = (w) => {
    setWorkoutForm(w);
    setIsEditingWorkout(true);
  };
  const deleteWorkout = (w) => {
    if (window.confirm("Delete this workout?")) {
      const updatedUser = {
        ...currentUser,
        workouts: currentUser.workouts.filter((wk) => wk.id !== w.id)
      };
      const updatedUsers = users.map((u) => (u.email === currentUser.email ? updatedUser : u));
      setUsers(updatedUsers);
      setCurrentUser(updatedUser);
    }
  };

  /* ---------- Timer ---------- */
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive || !activeWorkout) return;
    if (secondsLeft === 0) {
      setIsActive(false);
      // Mark as completed
      const newHist = { id: Date.now(), activity: activeWorkout.name, type: "completed", timestamp: new Date().toLocaleString() };
      const updatedUser = { ...currentUser, workoutHistory: [...(currentUser.workoutHistory||[]), newHist] };
      const updatedUsers = users.map(u => u.email === currentUser.email ? updatedUser : u);
      setUsers(updatedUsers);
      setCurrentUser(updatedUser);
      alert(`${activeWorkout.name} completed!`);
      setActiveWorkout(null);
      return;
    }
    const timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isActive, secondsLeft, activeWorkout]);

  const startWorkout = (w) => {
    setActiveWorkout(w);
    setSecondsLeft(w.duration * 60);
    setIsActive(true);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  /* ---------- Workout Pie Chart ---------- */
  const totalWorkouts = currentUser?.workouts?.length || 0;
  const completedWorkouts = currentUser?.workoutHistory?.filter(h => h.type === "completed").length || 0;
  const pendingWorkouts = Math.max(totalWorkouts - completedWorkouts, 0);

  const pieData = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        data: [completedWorkouts, pendingWorkouts],
        backgroundColor: ["#10b981", "#d1d5db"],
        hoverOffset: 4
      }
    ]
  };

  if (!currentUser) return <p className="text-center text-red-500 mt-20">No user logged in.</p>;

  return (
    <div className="min-h-screen py-10 px-4 grid md:grid-cols-2 gap-6">

      {/* Profile Panel */}
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col gap-4 min-h-[450px]">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-teal-700 text-2xl">Profile</h2>
          <button onClick={() => setShowProfileForm(true)} className="text-emerald-600 font-semibold text-sm">
            Edit
          </button>
        </div>

        {showProfileForm ? (
          <div className="flex flex-col gap-3">
            <input name="name" value={profileForm.name} onChange={handleProfileChange} placeholder="Name" className="border p-2 rounded"/>
            <input name="age" type="number" value={profileForm.age} onChange={handleProfileChange} placeholder="Age" className="border p-2 rounded"/>
            <input name="height" type="number" value={profileForm.height} onChange={handleProfileChange} placeholder="Height (cm)" className="border p-2 rounded"/>
            <input name="weight" type="number" value={profileForm.weight} onChange={handleProfileChange} placeholder="Weight (kg)" className="border p-2 rounded"/>
            <input name="goalWeight" type="number" value={profileForm.goalWeight} onChange={handleProfileChange} placeholder="Goal Weight (kg)" className="border p-2 rounded"/>
            <input name="activityLevel" value={profileForm.activityLevel} onChange={handleProfileChange} placeholder="Activity Level" className="border p-2 rounded"/>
            <p className="text-sm font-semibold">BMI: {calculateBMI()}</p>
            <button onClick={saveProfile} className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">Save Profile</button>
          </div>
        ) : (
          <div className="text-sm space-y-1">
            <p><strong>Name:</strong> {currentUser.name}</p>
            <p><strong>Weight:</strong> {currentUser.weight} kg</p>
            <p><strong>Goal:</strong> {currentUser.goalWeight} kg</p>
            <p><strong>BMI:</strong> {calculateBMI()}</p>
          </div>
        )}

        {/* Weight History */}
        {currentUser.weightHistory && currentUser.weightHistory.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-teal-700 mb-2">Weight Progress</h3>
            <div className="flex flex-col gap-3">
              {currentUser.weightHistory.map((w, idx) => {
                const progress = Math.min(Math.max(((profileForm.goalWeight - w.weight)/profileForm.goalWeight)*100,0),100);
                return (
                  <div key={idx}>
                    <p className="text-sm">{w.dateTime} - {w.weight} kg</p>
                    <div className="w-full bg-zinc-200 h-4 rounded">
                      <div className="bg-emerald-500 h-4 rounded" style={{width: `${progress}%`}}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Workout Progress Pie */}
        {totalWorkouts > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-teal-700 mb-2">Workout Progress</h3>
            <Pie data={pieData} />
          </div>
        )}
      </div>

      {/* Workouts Panel */}
      <div className="flex flex-col gap-6">


        
        {/* Heading for workouts */}
            <h2 className="text-teal-700 font-bold text-xl ms-6">Daily Workouts</h2>

        <form onSubmit={addOrUpdateWorkout} className="bg-white p-6 rounded-xl shadow-lg grid md:grid-cols-2 gap-3">
          <input name="name" placeholder="Workout Name" value={workoutForm.name} onChange={handleWorkoutChange} className="border p-2 rounded"/>
          <input name="type" placeholder="Type" value={workoutForm.type} onChange={handleWorkoutChange} className="border p-2 rounded"/>
          <input name="duration" type="number" placeholder="Duration (min)" value={workoutForm.duration} onChange={handleWorkoutChange} className="border p-2 rounded"/>
          <input name="dateTime" type="datetime-local" value={workoutForm.dateTime} onChange={handleWorkoutChange} className="border p-2 rounded"/>
          <textarea name="description" placeholder="Description" value={workoutForm.description} onChange={handleWorkoutChange} className="border p-2 rounded md:col-span-2"/>
          <button className="bg-emerald-500 text-white rounded px-4 py-2 hover:bg-emerald-600">{isEditingWorkout ? "Update" : "Add"}</button>
        </form>


        <div className="grid md:grid-cols-2 gap-4">
          {(currentUser?.workouts || []).map((w) => (
            <div key={w.id} className="bg-white p-4 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold flex items-center gap-2">{w.type === "Running" ? <FaRunning/> : <FaDumbbell/>} {w.name}</h3>
              <p className="text-gray-600">{w.description}</p>
              <p className="mt-1 text-sm">⏱ {w.duration} mins</p>
              <p className="text-sm text-gray-500">📅 {new Date(w.dateTime).toLocaleString()}</p>
              <div className="flex justify-between mt-2">
                <button onClick={() => startWorkout(w)} className="text-emerald-600 font-semibold hover:underline">Start</button>
                <div className="flex gap-2">
                  <FaEdit onClick={() => editWorkout(w)} className="cursor-pointer text-blue-500"/>
                  <FaTrash onClick={() => deleteWorkout(w)} className="cursor-pointer text-red-500"/>
                </div>
              </div>
            </div>
          ))}
        </div>

        {activeWorkout && (
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-3">{activeWorkout.name}</h2>
            <div className="text-3xl font-mono mb-4">{formatTime(secondsLeft)}</div>
            <button onClick={() => setIsActive(!isActive)} className="px-6 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600">{isActive ? "Pause" : "Resume"}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workout;
