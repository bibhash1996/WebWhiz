import { useRef, useEffect } from "react";
import ChatMessage, { Message } from "./ChatMessage";

interface ChatContainerProps {
  messages: Message[];
  loading: boolean;
}

const ChatContainer = ({ messages, loading }: ChatContainerProps) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {loading ? (
        <div className="text-lg text-gray-500 animate-pulse-slow">
          Reading and parsing link. Please Wait
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col h-full items-center justify-center text-center p-4">
          <div className="text-lg text-gray-500 animate-pulse-slow">
            Submit a link to start a conversation
          </div>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={endOfMessagesRef} />
        </>
      )}
    </div>
  );
};

export default ChatContainer;
