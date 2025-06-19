import { cn } from "@/lib/utils";
import { CircleUser } from "lucide-react";
import { Button } from "@/components/ui/button";

export type MessageType = "user" | "system" | "link" | "summary";

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  type: MessageType;
  url?: string;
  confidence?: number;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.type === "user";

  const getConfidenceColor = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 55) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div
      className={cn(
        "flex w-full gap-2 p-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-link-100 flex items-center justify-center text-link-400">
          <CircleUser size={20} />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl py-2 px-4",
          isUser
            ? "bg-link-300 text-white"
            : message.type === "link"
            ? "bg-white border border-link-300 shadow-sm"
            : "glass"
        )}
      >
        {message.type === "link" && message.url && (
          <div className="mb-2">
            <a
              href={message.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link-500 underline underline-offset-2 font-medium"
            >
              {message.url}
            </a>
          </div>
        )}
        {message.type === "summary" && (
          <div className="mb-2">
            <p className="text-xl">Summary</p>
          </div>
        )}
        {message.confidence !== undefined && (
          <div className="mb-2 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  getConfidenceColor(message.confidence)
                )}
              ></div>
              <span className="text-xs text-gray-600">
                Confidence: {message.confidence.toFixed(2)}%
              </span>
            </div>
          </div>
        )}
        <p>{message.content}</p>
        <div
          className={cn(
            "text-xs mt-1",
            isUser ? "text-white/80" : "text-gray-500"
          )}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-link-300 flex items-center justify-center text-white">
          <CircleUser size={20} />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
