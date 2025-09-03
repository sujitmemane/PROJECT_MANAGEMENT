import { Button } from "@/components/ui/button";
import { Outlet, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
