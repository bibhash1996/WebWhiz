function extractConfluenceInfo(url) {
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

// Example usage
const info = extractConfluenceInfo(
  "https://sgkbounteous.atlassian.net/wiki/spaces/SD/pages/1015809/Local+Setup+without+docker"
);
console.log(info);
// Output: { baseUrl: 'https://yourcompany.atlassian.net', pageId: '123456789' }
