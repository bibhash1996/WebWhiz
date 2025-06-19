import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, Speaker, Play, Square } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { API_BASE_URL } from "@/const";

interface MessageInputProps {
  onMessageSend: (message: string) => void;
  isVoiceMode?: boolean;
  onSummarize?: () => void;
}

const MessageInput = ({
  onMessageSend,
  onSummarize,
  isVoiceMode = false,
}: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [voiceDialogOpen, setVoiceDialogOpen] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [talkDisabled, setTalkDisabled] = useState(false);
  const [audioWaitingForAnswer, setAudioWaitingForAnswer] = useState(false);
  const [hideSummary, setHideSummary] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    if (audioUrl && isPlaying) {
      audioRef.current.play();
      console.log(audioUrl, isPlaying, audioRef.current);
    }
  }, [audioUrl, isPlaying]);

  useEffect(() => {
    const session_id = localStorage.getItem("session_id");
    console.log("session_id : ", session_id);

    setSessionId(session_id);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onMessageSend(message);
      setMessage("");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);

      const mediaRecorder = new MediaRecorder(stream);
      setRecorder(mediaRecorder);

      const audioChunks = [];

      mediaRecorder.ondataavailable = (e: any) => {
        if (e.data.size > 0) {
          audioChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        sendAudioToBackend(audioBlob);
      };

      mediaRecorder.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    console.log(recorder);
    if (recorder) {
      recorder.stop();
      setRecorder(null);
    }
  };

  const sendAudioToBackend = async (audioBlob: any) => {
    const formData = new FormData();
    setAudioWaitingForAnswer(true);
    formData.append("audio", audioBlob);
    try {
      const response = await fetch(
        API_BASE_URL + `/talk?session_id=${sessionId}`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (response.ok) {
        console.log("*********************");
        console.log("Received response");
        console.log("*********************");
        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        console.log(url);
        setAudioWaitingForAnswer(false);
        const audio = new Audio(audioUrl);
        audio.play();

        // audio.addEventListener("canplaythrough", () => {
        //   console.log("Audio fully loaded and can play through.");
        //   audio.play();
        // });

        // audio.addEventListener("ended", () => {
        //   console.log("Audio playback finished.");
        //   setIsPlaying(false);
        // });

        setAudioUrl(url);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error sending audio to backend:", error);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    setAudioUrl("");
  };

  const openVoiceDialog = () => {
    setVoiceDialogOpen(true);
  };

  return (
    <>
      {!hideSummary ? (
        <div className="p-4 w-100">
          <Button
            type="submit"
            className="bg-slate-500"
            onClick={() => {
              if (onSummarize) {
                onSummarize();
                setHideSummary(true);
              }
            }}
          >
            Summarize with AI ✨
          </Button>
        </div>
      ) : null}
      <form onSubmit={handleSubmit} className="flex w-full gap-2 p-4 border-t">
        {/* {!isVoiceMode ? ( */}
        <Input
          type="text"
          placeholder={"Type your message..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full"
          readOnly={isVoiceMode && isRecording}
        />
        {/* ) : null} */}
        {/* {isVoiceMode ? ( */}
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={openVoiceDialog}
          className="bg-link-300 hover:bg-link-400 text-white"
        >
          <Mic size={20} />
        </Button>
        {/* ) : null} */}
        {/* {!isVoiceMode ? ( */}
        <Button
          type="submit"
          disabled={!message.trim()}
          className="bg-link-300 hover:bg-link-400"
        >
          <Send size={20} />
        </Button>
        {/* ) : null} */}
      </form>

      <Dialog open={voiceDialogOpen} onOpenChange={setVoiceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Talk to me</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 space-y-6">
            <div className="flex flex-col justify-center items-center">
              <Speaker
                size={64}
                className={
                  isRecording ? "text-red-500 animate-pulse" : "text-gray-500"
                }
              />
              <p className="mt-2 text-sm text-gray-500">
                {isRecording
                  ? "Recording in progress..."
                  : "Click to start talking"}
              </p>
            </div>

            {recorder ? (
              <button
                onClick={stopRecording}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full w-32 focus:outline-none"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="bg-blue-500 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-full w-32 focus:outline-none"
                disabled={talkDisabled || audioWaitingForAnswer}
              >
                {audioWaitingForAnswer ? "Thinking....." : "Talk"}
              </button>
            )}

            <audio ref={audioRef} src={audioUrl} onEnded={handleAudioEnd}>
              Your browser does not support the audio element.
            </audio>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MessageInput;
