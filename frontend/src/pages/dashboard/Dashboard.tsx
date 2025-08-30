import { Button } from "@/components/ui/button";
import { Outlet, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-300 p-4 flex flex-col space-y-6">
        <h1 className="text-xl font-bold text-black mb-6">My Dashboard</h1>

        {/* Navigation */}
        <div className="flex flex-col space-y-2">
          <Button
            className="w-full justify-start bg-gray-100 text-black hover:bg-gray-200 border-none"
            onClick={() => navigate("/dashboard/")}
          >
            Boards
          </Button>

          <Button
            className="w-full justify-start bg-gray-100 text-black hover:bg-gray-200 border-none"
            onClick={() => navigate("/dashboard/members")}
          >
            Members
          </Button>

          <Button
            className="w-full justify-start bg-gray-100 text-black hover:bg-gray-200 border-none"
            onClick={() => {
              // Logout logic
              localStorage.clear();
              window.location.href = "/login";
            }}
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
