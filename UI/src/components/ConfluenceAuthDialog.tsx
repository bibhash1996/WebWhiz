import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function extractConfluenceInfo(url: string) {
  try {
    const parsedUrl = new URL(url);
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}`;

    // Match page ID using regex
    const match = url.match(/\/pages\/(\d+)/);
    const pageId = match ? match[1] : null;

    return { baseUrl, pageId };
  } catch (e) {
    console.error("Invalid URL:", e);
    return { baseUrl: null, pageId: null };
  }
}

interface ConfluenceAuthDialogProps {
  open: boolean;
  confluenceLink: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    baseURL: string,
    username: string,
    apiKey: string,
    spaceKey: string
  ) => void;
}

const ConfluenceAuthDialog = ({
  open,
  confluenceLink,
  onOpenChange,
  onSubmit,
}: ConfluenceAuthDialogProps) => {
  const [username, setUsername] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [pageId, setPageId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [baseURL, setBaseURL] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !apiKey || !baseURL || !pageId) {
      return; // Form validation happens via required attributes
    }

    setIsSubmitting(true);

    // Submit the form data
    onSubmit(baseURL, username, apiKey, pageId);

    // Reset the form
    setUsername("");
    setApiKey("");
    setPageId("");
    setIsSubmitting(false);
  };

  useEffect(() => {
    const data = extractConfluenceInfo(confluenceLink);
    setBaseURL(data.baseUrl);
    setPageId(data.pageId);
  }, [confluenceLink]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confluence Authentication</DialogTitle>
          <DialogDescription>
            This appears to be a Confluence page. Please provide your Confluence
            credentials to access this content.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username or Email</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your Confluence API key"
              required
            />
            <p className="text-xs text-gray-500">
              You can generate an API key in your Atlassian account settings
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="spaceKey">Base URL</Label>
            <Input
              id="spaceKey"
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              placeholder="e.g., TEAM, WIKI, etc."
            />
            <p className="text-xs text-gray-500">
              The base url of the confluence page
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="spaceKey">Page Id</Label>
            <Input
              id="spaceKey"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              placeholder="e.g., TEAM, WIKI, etc."
            />
            <p className="text-xs text-gray-500">
              The page id is usually part of the URL or visible in Confluence
              settings
            </p>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Connecting..." : "Connect"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConfluenceAuthDialog;
