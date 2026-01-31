import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../security/AuthContext.tsx";
import { LogIn } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        try {
            // Pass username (collected from the email field) and password to login
            await login({ email, password });
            navigate("/"); // redirect after success
        } catch (err) {
            // Use a specific error message based on the problem
            setError("Invalid username or password. Please try again.");
            console.error("Login failed:", err);
        }
    };

    return (
        // The outer div structure seems complex for a simple login; simplified the layout structure for clarity.
        <div className="flex items-center justify-center h-screen w-full bg-gray-50">
            <form onSubmit={handleSubmit} className="w-full max-w-md p-8">
                <div className="bg-white shadow-xl sm:rounded-lg flex flex-col items-center p-8">

                    {/* Title */}
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
                        Login
                    </h1>

                    {error && (
                        <div className="w-full text-center p-3 mb-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
                            {error}
                        </div>
                    )}


                    <div className="w-full">
                        {/* Username/Email Input */}
                        <input
                            className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white"
                            type="text" // Changed to 'text' as it's used as 'username'
                            placeholder="Username or Email"
                            value={email} // 👈 FIX 1: Bind value
                            onChange={(e) => setEmail(e.target.value)} // 👈 FIX 1: Handle changes
                            required
                        />






                        <input
                            className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white mt-5"
                            type="password"
                            placeholder="Password"
                            value={password} // 👈 FIX 1: Bind value
                            onChange={(e) => setPassword(e.target.value)} // 👈 FIX 1: Handle changes
                            required
                        />

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="mt-6 tracking-wide font-semibold bg-indigo-600 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                        >
                            <LogIn className="w-5 h-5 mr-3" />
                            <span>Login</span>
                        </button>
                    </div>

                </div>
            </form>
        </div>
    );
}