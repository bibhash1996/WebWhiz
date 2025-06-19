import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuid } from "uuid";
import ConfluenceAuthDialog from "@/components/ConfluenceAuthDialog";

interface LinkInputProps {
  onLinkSubmit: (link: string) => void;
  onConfluenceLinkSubmit: (
    link: string,
    base_url: string,
    api_key: string,
    username: string,
    pageId: string
  ) => void;
}

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};

const LinkInput = ({
  onLinkSubmit,
  onConfluenceLinkSubmit,
}: LinkInputProps) => {
  const [link, setLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfluenceAuth, setShowConfluenceAuth] = useState(false);
  const [confluenceLink, setConfluenceLink] = useState("");

  const isConfluenceLink = (url: string): boolean => {
    if (!url) return false;

    try {
      const parsedUrl = new URL(url);
      // Check for common Confluence URL patterns
      return (
        parsedUrl.hostname.includes("atlassian.net") ||
        parsedUrl.hostname.includes("confluence") ||
        parsedUrl.pathname.includes("/wiki/") ||
        parsedUrl.pathname.includes("/display/") ||
        parsedUrl.pathname.includes("/spaces/")
      );
    } catch (err) {
      return false;
    }
  };

  const handleConfluenceAuth = async (
    baseURL: string,
    username: string,
    api_key: string,
    pageId: string
  ) => {
    setShowConfluenceAuth(false);
    setIsLoading(true);

    // Add the authentication information to the link submission
    // In a real app, you would use this to authenticate with the Confluence API
    const confluenceData = {
      username,
      api_key,
      pageId: pageId,
      url: confluenceLink,
      baseURL,
    };

    // For demo purposes, we're logging the confluence data and submitting the original link
    console.log("Confluence authentication data:", confluenceData);

    // Simulate processing time
    setTimeout(() => {
      onConfluenceLinkSubmit(
        confluenceLink,
        baseURL,
        api_key,
        username,
        pageId
      );
      setLink("");
      setConfluenceLink("");
      setIsLoading(false);
    }, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!link.trim()) {
      toast({
        title: "Link required",
        description: "Please enter a link to continue.",
        variant: "destructive",
      });
      return;
    }

    // Add http:// if protocol is missing
    let formattedLink = link;
    if (!link.startsWith("http://") && !link.startsWith("https://")) {
      formattedLink = `https://${link}`;
    }

    if (!isValidUrl(formattedLink)) {
      toast({
        title: "Invalid link",
        description: "Please enter a valid URL.",
        variant: "destructive",
      });
      return;
    }

    if (isConfluenceLink(formattedLink)) {
      setConfluenceLink(formattedLink);
      setShowConfluenceAuth(true);
      return;
    }

    setIsLoading(true);

    // Simulate processing time
    setTimeout(() => {
      onLinkSubmit(formattedLink);
      setLink("");
      setIsLoading(false);
    }, 100);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full space-y-2">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter link (e.g., https://example.com)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-link-300 hover:bg-link-400"
          >
            {isLoading ? "Processing..." : "Submit"}
          </Button>
        </div>
      </form>
      <ConfluenceAuthDialog
        open={showConfluenceAuth}
        onOpenChange={setShowConfluenceAuth}
        onSubmit={handleConfluenceAuth}
        confluenceLink={confluenceLink}
      />
    </>
  );
};

export default LinkInput;
