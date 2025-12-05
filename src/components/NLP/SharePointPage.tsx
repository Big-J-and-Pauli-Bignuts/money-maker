import React, { useState, useMemo } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import type { SharePointItem } from "../../types";
import { sharepointRequest } from "../../config/authConfig";
import { sharepointService } from "../../services";
import "./NLP.css";

/**
 * SharePoint Component for browsing and searching SharePoint content
 */
const SharePointPage: React.FC = () => {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<SharePointItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Sample items for demonstration when not authenticated
  const sampleItems: SharePointItem[] = useMemo(() => [
    {
      id: "1",
      name: "Project Documentation",
      webUrl: "#",
      itemType: "folder" as const,
      createdDateTime: new Date(),
      lastModifiedDateTime: new Date(),
    },
    {
      id: "2",
      name: "Q4 Report.docx",
      webUrl: "#",
      itemType: "file" as const,
      createdDateTime: new Date(),
      lastModifiedDateTime: new Date(),
      size: 245000,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
    {
      id: "3",
      name: "Budget Analysis.xlsx",
      webUrl: "#",
      itemType: "file" as const,
      createdDateTime: new Date(),
      lastModifiedDateTime: new Date(),
      size: 128000,
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
    {
      id: "4",
      name: "Meeting Notes",
      webUrl: "#",
      itemType: "folder" as const,
      createdDateTime: new Date(),
      lastModifiedDateTime: new Date(),
    },
    {
      id: "5",
      name: "Presentation.pptx",
      webUrl: "#",
      itemType: "file" as const,
      createdDateTime: new Date(),
      lastModifiedDateTime: new Date(),
      size: 3400000,
      mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    },
  ], []);

  // Initialize items on first render
  if (!hasLoadedOnce && items.length === 0) {
    setItems(sampleItems);
    setHasLoadedOnce(true);
  }

  // Get access token and load items
  const loadItems = async () => {
    if (!isAuthenticated) {
      setItems(sampleItems);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await instance.acquireTokenSilent({
        ...sharepointRequest,
        account: accounts[0],
      });

      sharepointService.setAccessToken(response.accessToken);
      const driveItems = await sharepointService.getDriveItems();
      setItems(driveItems);
    } catch (err) {
      console.error("Error loading SharePoint items:", err);
      setError("Failed to load SharePoint content. Please ensure you have the necessary permissions.");
      setItems(sampleItems);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadItems();
      return;
    }

    if (!isAuthenticated) {
      const filtered = sampleItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setItems(filtered);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await instance.acquireTokenSilent({
        ...sharepointRequest,
        account: accounts[0],
      });

      sharepointService.setAccessToken(response.accessToken);
      const searchResults = await sharepointService.searchItems(searchQuery);
      setItems(searchResults);
    } catch (err) {
      console.error("Error searching SharePoint:", err);
      setError("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Get icon for item type
  const getItemIcon = (item: SharePointItem): string => {
    if (item.itemType === "folder") return "📁";
    if (item.mimeType?.includes("word")) return "📄";
    if (item.mimeType?.includes("excel") || item.mimeType?.includes("spreadsheet")) return "📊";
    if (item.mimeType?.includes("powerpoint") || item.mimeType?.includes("presentation")) return "📽️";
    if (item.mimeType?.includes("pdf")) return "📕";
    if (item.mimeType?.includes("image")) return "🖼️";
    return "📄";
  };

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Handle item click
  const handleItemClick = async (item: SharePointItem) => {
    if (item.itemType === "folder") {
      setCurrentPath([...currentPath, item.name]);
      // In a real implementation, navigate into the folder
      // For now, show a message
      setError(`Navigation to "${item.name}" folder would load its contents.`);
    } else {
      // Open file in new tab
      if (item.webUrl && item.webUrl !== "#") {
        window.open(item.webUrl, "_blank");
      }
    }
  };

  // Handle sign in for SharePoint
  const handleSignIn = async () => {
    try {
      await instance.loginPopup(sharepointRequest);
      loadItems();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="sharepoint-page">
      <div className="page-header">
        <h1>📁 SharePoint</h1>
        <p>Access your SharePoint files and documents</p>
      </div>

      {!isAuthenticated && (
        <div className="auth-prompt">
          <p>Sign in to access your SharePoint content</p>
          <button className="sign-in-btn" onClick={handleSignIn}>
            Sign in with Microsoft
          </button>
          <p className="demo-note">Showing sample data for demonstration</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search for files and documents..."
        />
        <button onClick={handleSearch} disabled={isLoading}>
          🔍 Search
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span
          className="breadcrumb-item clickable"
          onClick={() => {
            setCurrentPath([]);
            loadItems();
          }}
        >
          🏠 Home
        </span>
        {currentPath.map((folder, index) => (
          <React.Fragment key={index}>
            <span className="breadcrumb-separator">/</span>
            <span
              className="breadcrumb-item clickable"
              onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
            >
              {folder}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span>ℹ️</span>
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading SharePoint content...</p>
        </div>
      )}

      {/* Items Grid */}
      <div className="items-grid">
        {items.map((item) => (
          <div
            key={item.id}
            className={`item-card ${item.itemType}`}
            onClick={() => handleItemClick(item)}
          >
            <div className="item-icon">{getItemIcon(item)}</div>
            <div className="item-info">
              <div className="item-name">{item.name}</div>
              <div className="item-meta">
                {item.itemType === "folder" ? (
                  "Folder"
                ) : (
                  <>
                    {formatFileSize(item.size)}
                    {item.size && " • "}
                    Modified {item.lastModifiedDateTime.toLocaleDateString()}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !isLoading && (
        <div className="empty-state">
          <p>No items found</p>
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}>Clear search</button>
          )}
        </div>
      )}
    </div>
  );
};

export default SharePointPage;
