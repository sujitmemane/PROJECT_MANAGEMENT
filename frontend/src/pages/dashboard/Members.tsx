import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Members() {
  const members = ["John Doe", "Jane Smith", "Alice Johnson", "Bob Brown"];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-black mb-6">Members</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {members.map((member) => (
          <Card
            key={member}
            className="bg-gray-100 border border-gray-300 shadow-none"
          >
            <CardHeader>
              <CardTitle className="text-black">{member}</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 flex justify-between items-center">
              <span>Role: Member</span>
              <Button className="bg-black text-white hover:bg-gray-900 text-sm px-3 py-1">
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
