import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSocket } from "@/socket/SocketProvider";

export default function BoardPage() {
  const [lists, setLists] = useState([
    { id: 1, title: "To Do", cards: ["Task 1", "Task 2"] },
    { id: 2, title: "In Progress", cards: ["Task 3"] },
    { id: 3, title: "Done", cards: ["Task 4"] },
  ]);

  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket) return;
    socket.on("test", (data: any) => {
      console.log(data);
    });
    return () => {};
  }, [socket]);

  const [addingCard, setAddingCard] = useState<number | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");

  const [board, setBoard] = useState({});
  const { boardId } = useParams();

  const fetchBoard = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/boards/${boardId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setBoard(response.data.data);
    } catch (error) {
      console.error("Failed to fetch boards:", error);
    } finally {
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [boardId]);

  console.log("Board", board);

  const addList = () => {
    if (!newListTitle.trim()) return;
    const newList = { id: Date.now(), title: newListTitle.trim(), cards: [] };
    setLists([...lists, newList]);
    setNewListTitle("");
    setAddingList(false);
  };

  const addCard = (listId: number) => {
    if (!newCardTitle.trim()) return;
    setLists(
      lists.map((list) =>
        list.id === listId
          ? { ...list, cards: [...list.cards, newCardTitle.trim()] }
          : list
      )
    );
    setNewCardTitle("");
    setAddingCard(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">{board?.title}</h1>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {lists.map((list) => (
          <Card key={list.id} className="w-64 flex-shrink-0 bg-white shadow">
            <CardHeader>
              <CardTitle>{list.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {list.cards.map((card, index) => (
                  <div
                    key={index}
                    className="p-2 rounded bg-gray-50 border text-sm"
                  >
                    {card}
                  </div>
                ))}

                {addingCard === list.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      placeholder="Enter card title..."
                      autoFocus
                      className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="bg-black text-white hover:bg-gray-900"
                        onClick={() => addCard(list.id)}
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setAddingCard(null);
                          setNewCardTitle("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start text-gray-600"
                    onClick={() => setAddingCard(list.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Card
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add new list */}
        <Card className="w-64 flex-shrink-0 bg-gray-50 border-dashed border-2 p-4">
          {!addingList ? (
            <Button
              size="sm"
              variant="ghost"
              className="w-full justify-start text-gray-600"
              onClick={() => setAddingList(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Add List
            </Button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="Enter list title..."
                autoFocus
                className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  className="bg-black text-white hover:bg-gray-900"
                  onClick={addList}
                >
                  Add List
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setAddingList(false);
                    setNewListTitle("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
