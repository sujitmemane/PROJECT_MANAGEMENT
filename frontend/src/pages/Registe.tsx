import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("http://localhost:8000/api/users", {
        username,
        email,
        password,
      });

      console.log("Registration success:", response.data);
      localStorage.setItem("token", response?.data?.token);
      navigate("/dashboard");

      setSuccess("Registration successful! You can now login.");
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white border border-gray-300 p-8 rounded-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-black mb-6 text-center">
          Register
        </h1>
        <form className="flex flex-col space-y-4" onSubmit={handleRegister}>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-gray-100 text-black border-gray-300 focus:border-black focus:ring-black"
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-100 text-black border-gray-300 focus:border-black focus:ring-black"
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-100 text-black border-gray-300 focus:border-black focus:ring-black"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
          <Button
            type="submit"
            className="bg-black text-white hover:bg-gray-900"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
      </div>
    </div>
  );
}
