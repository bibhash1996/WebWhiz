import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg p-4">
      <div className="glass rounded-2xl w-full max-w-md p-8 text-center space-y-6 animate-fade-in">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          WebWhiz
        </h1>
        <p className="text-lg text-gray-700">
          Share and discuss links through chat and voice.
        </p>
        <Button asChild className="w-full bg-link-300 hover:bg-link-400">
          <Link to="/link-chat">Get Started</Link>
        </Button>
      </div>
    </div>
  );
};

export default Index;
