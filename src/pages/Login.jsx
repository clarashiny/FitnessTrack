import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = (data) => {
    console.log("Login Data:", data);

    // ✅ create user object (MATCH Navbar & ProtectedRoute)
    const user = {
      name: data.email,
      role: data.userType, // "user" or "admin"
    };

    // ✅ save current user
    localStorage.setItem("currentUser", JSON.stringify(user));

    // ✅ notify navbar to re-render
    window.dispatchEvent(new Event("authChange"));

    // ✅ navigate based on role
    if (data.userType === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-gray-100 py-12 px-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-800 shadow-xl rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                  message: "Invalid email",
                },
              })}
              type="email"
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              {...register("password", { required: "Password is required" })}
              type="password"
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Login As */}
          <div>
            <label className="block mb-1 font-medium">Login As</label>
            <select
              {...register("userType")}
              defaultValue="user"
              className="w-full px-4 py-2 rounded-lg border "
            >
              <option  value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-full hover:bg-emerald-600 transition"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-emerald-500 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
