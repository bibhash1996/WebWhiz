import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Header from "@/components/Header";
import LinkInput from "@/components/LinkInput";
import ChatContainer from "@/components/ChatContainer";
import MessageInput from "@/components/MessageInput";
import { Message } from "@/components/ChatMessage";
import { toast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/const";

type InteractionMode = "chat" | "voice" | null;

const LinkChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentLink, setCurrentLink] = useState<string | null>(null);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);

  const summarizeLink = async (session_id: string, link: string) => {
    const thinking: Message = {
      id: "Thinking",
      content: "Summarizing....",
      timestamp: new Date(),
      type: "system",
    };
    setMessages((prev) => [...prev, thinking]);
    setSummarizing(true);
    const response = await fetch(
      `${API_BASE_URL}/summarize?session_id=${session_id}&link=${link}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    setSummarizing(false);
    /**
     * Remove thinking
     */
    setMessages((prev) => prev.filter((m) => m.id !== "Thinking"));
    if (response.status !== 200) {
      toast({
        title: "Error summarizing link",
        description: "Error summarizing document",
        variant: "destructive",
      });
      return;
    }
    const data = await response.json();
    const summary: Message = {
      id: uuidv4(),
      content: data.data.summary,
      timestamp: new Date(),
      type: "summary",
    };
    setMessages((prev) => [...prev, summary]);
  };

  const handleLinkSubmit = async (link: string) => {
    const linkMessage: Message = {
      id: uuidv4(),
      content: "Let's discuss this link. How would you like to interact?",
      timestamp: new Date(),
      type: "link",
      url: link,
    };

    setCurrentLink(link);
    setMessages((prev) => [...prev, linkMessage]);

    const session_id = linkMessage.id;

    // Submit link to baceknd
    setIsLoading(true);
    const response = await fetch(
      `${API_BASE_URL}/upload?session_id=${session_id}&link=${link}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    setIsLoading(false);
    if (response.status != 200) {
      toast({
        title: "Error submitting link",
        description: "Error reading/parsing the link provided",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem("session_id", session_id);
    toast({
      title: "Link added",
      description: "Please select how you'd like to interact with this link.",
    });

    // await summarizeLink(session_id, link);
  };

  const handleConfluenceLinkSubmit = async (
    link: string,
    base_url: string,
    api_key: string,
    username: string,
    pageId: string
  ) => {
    const linkMessage: Message = {
      id: uuidv4(),
      content: "Let's discuss this link. How would you like to interact?",
      timestamp: new Date(),
      type: "link",
      url: link,
    };

    setCurrentLink(link);
    setMessages((prev) => [...prev, linkMessage]);

    const session_id = linkMessage.id;

    // Submit link to baceknd
    setIsLoading(true);
    const response = await fetch(
      `${API_BASE_URL}/upload/confluence?session_id=${session_id}&link=${link}&base_url=${base_url}&username=${username}&api_key=${api_key}&page_id=${pageId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    setIsLoading(false);
    if (response.status != 200) {
      toast({
        title: "Error submitting link",
        description: "Error reading/parsing the link provided",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem("session_id", session_id);
    toast({
      title: "Link added",
      description: "Please select how you'd like to interact with this link.",
    });

    // await summarizeLink(session_id, link);
  };

  const handleModeSelect = (mode: InteractionMode) => {
    setInteractionMode(mode);

    const modeMessage: Message = {
      id: uuidv4(),
      content:
        mode === "chat"
          ? "Chat mode activated. Type your questions below."
          : "Voice mode activated. Click the microphone to start speaking.",
      timestamp: new Date(),
      type: "system",
    };

    setMessages((prev) => [...prev, modeMessage]);
  };

  const handleMessageSend = async (message: string) => {
    const session_id = localStorage.getItem("session_id");
    const userMessage: Message = {
      id: uuidv4(),
      content: message,
      timestamp: new Date(),
      type: "user",
    };
    const thinking: Message = {
      id: "Thinking",
      content: "Thinking....",
      timestamp: new Date(),
      type: "system",
    };
    setMessages((prev) => [...prev, userMessage, thinking]);

    const response = await fetch(
      `${API_BASE_URL}/answer?session_id=${session_id}&question=${message}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    /**
     * Remove thinking
     */
    setMessages((prev) => prev.filter((m) => m.id !== "Thinking"));
    if (response.status != 200) {
      toast({
        title: "Error sending message",
        description: "Error sending question to backend",
        variant: "destructive",
      });
      return;
    }
    const data = await response.json();
    console.log(data);
    const answer: Message = {
      id: uuidv4(),
      content: data.data.answer,
      timestamp: new Date(),
      type: "system",
      confidence: data.data.confidence_score,
    };
    setMessages((prev) => [...prev, answer]);
  };

  return (
    <>
      <div className="flex flex-col h-screen gradient-bg">
        <Header />
        <div className="flex flex-col flex-grow overflow-hidden p-4">
          <div className="glass rounded-lg flex-grow flex flex-col overflow-hidden mb-4">
            <ChatContainer messages={messages} loading={isLoading} />
            {interactionMode && (
              <MessageInput
                onMessageSend={handleMessageSend}
                isVoiceMode={interactionMode === "voice"}
                onSummarize={async () => {
                  const session_id = localStorage.getItem("session_id");
                  await summarizeLink(session_id, currentLink);
                }}
              />
            )}
          </div>
          {!currentLink && (
            <div className="glass rounded-lg p-4">
              <LinkInput
                onLinkSubmit={handleLinkSubmit}
                onConfluenceLinkSubmit={handleConfluenceLinkSubmit}
              />
            </div>
          )}
          {currentLink && !interactionMode && !isLoading && !summarizing && (
            <div className="glass rounded-lg p-4">
              <h3 className="text-center text-lg font-medium mb-4">
                How would you like to interact with this link?
              </h3>
              <RadioGroup
                className="flex gap-4 justify-center"
                onValueChange={(value) =>
                  handleModeSelect(value as InteractionMode)
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="chat" id="chat" />
                  <Label htmlFor="chat" className="cursor-pointer">
                    Chat
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="voice" id="voice" />
                  <Label htmlFor="voice" className="cursor-pointer">
                    Talk
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LinkChat;
