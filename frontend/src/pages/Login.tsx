import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/users/login",
        {
          email,
          password,
        }
      );

      console.log("Login success:", response.data);
      localStorage.setItem("token", response?.data?.token);
      navigate("/dashboard");
      alert("Login successful!");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white border border-gray-300 p-8 rounded-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-black mb-6 text-center">
          Login
        </h1>
        <form className="flex flex-col space-y-4" onSubmit={handleLogin}>
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
          <Button
            type="submit"
            className="bg-black text-white hover:bg-gray-900"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
