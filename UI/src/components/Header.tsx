import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { API_BASE_URL } from "@/const";

const Header = () => {
  const navigate = useNavigate();

  const handleRestart = async () => {
    const session_id = localStorage.getItem("session_id");
    const response = await fetch(
      `${API_BASE_URL}/reset?session_id=${session_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status !== 200) {
      toast({
        title: "Error",
        description: "Error restarting session",
        variant: "destructive",
      });
      return;
    }
    localStorage.removeItem("session_id");
    toast({
      title: "Conversation reset",
      description: "Starting a new conversation",
    });
    navigate("/");
  };

  return (
    <header className="flex items-center justify-between p-4 border-b glass">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>
      <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        WebWhiz
      </h1>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRestart}
        className="flex items-center"
      >
        <RefreshCcw className="mr-2 h-4 w-4" />
        Restart
      </Button>
    </header>
  );
};

export default Header;
