import type { SharePointItem } from "../types";

/**
 * SharePoint Service for interacting with Microsoft SharePoint
 * Requires proper Azure AD authentication with appropriate scopes
 */
export class SharePointService {
  private graphBaseUrl: string = "https://graph.microsoft.com/v1.0";
  private accessToken: string | null = null;
  private siteId: string | null = null;

  /**
   * Set the access token for API calls
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Set the site ID for SharePoint operations
   */
  setSiteId(siteId: string): void {
    this.siteId = siteId;
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): HeadersInit {
    if (!this.accessToken) {
      throw new Error("Access token not set. Please authenticate first.");
    }
    return {
      Authorization: `Bearer ${this.accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  /**
   * Get SharePoint site by hostname and path
   */
  async getSite(hostname: string, sitePath?: string): Promise<{ id: string; name: string; webUrl: string }> {
    let url = `${this.graphBaseUrl}/sites/${hostname}`;
    if (sitePath) {
      url += `:${sitePath}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get SharePoint site: ${response.statusText}`);
    }

    const data = await response.json();
    this.siteId = data.id;
    return {
      id: data.id,
      name: data.name,
      webUrl: data.webUrl,
    };
  }

  /**
   * Get lists in a SharePoint site
   */
  async getLists(): Promise<{ id: string; name: string; webUrl: string }[]> {
    if (!this.siteId) {
      throw new Error("Site ID not set. Please call getSite first.");
    }

    const response = await fetch(`${this.graphBaseUrl}/sites/${this.siteId}/lists`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get lists: ${response.statusText}`);
    }

    const data = await response.json();
    return (data.value || []).map((list: Record<string, unknown>) => ({
      id: list.id as string,
      name: list.name as string,
      webUrl: list.webUrl as string,
    }));
  }

  /**
   * Get items from a SharePoint list
   */
  async getListItems(listId: string): Promise<SharePointItem[]> {
    if (!this.siteId) {
      throw new Error("Site ID not set. Please call getSite first.");
    }

    const response = await fetch(
      `${this.graphBaseUrl}/sites/${this.siteId}/lists/${listId}/items?expand=fields`,
      {
        method: "GET",
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get list items: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToSharePointItems(data.value || [], "list");
  }

  /**
   * Get files from a document library (drive)
   */
  async getDriveItems(folderId?: string): Promise<SharePointItem[]> {
    if (!this.siteId) {
      throw new Error("Site ID not set. Please call getSite first.");
    }

    let url = `${this.graphBaseUrl}/sites/${this.siteId}/drive`;
    if (folderId) {
      url += `/items/${folderId}/children`;
    } else {
      url += "/root/children";
    }

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get drive items: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToSharePointItems(data.value || []);
  }

  /**
   * Search for items across SharePoint
   */
  async searchItems(query: string): Promise<SharePointItem[]> {
    const response = await fetch(`${this.graphBaseUrl}/search/query`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        requests: [
          {
            entityTypes: ["driveItem", "listItem", "site"],
            query: {
              queryString: query,
            },
            from: 0,
            size: 25,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();
    const hits = data.value?.[0]?.hitsContainers?.[0]?.hits || [];
    return hits.map((hit: Record<string, unknown>) => {
      const resource = hit.resource as Record<string, unknown>;
      return {
        id: String(resource.id || ""),
        name: String(resource.name || ""),
        webUrl: String(resource.webUrl || ""),
        itemType: this.determineItemType(resource),
        createdDateTime: new Date(String(resource.createdDateTime || new Date())),
        lastModifiedDateTime: new Date(String(resource.lastModifiedDateTime || new Date())),
        size: resource.size as number | undefined,
        mimeType: (resource.file as Record<string, unknown>)?.mimeType as string | undefined,
      };
    });
  }

  /**
   * Download a file
   */
  async downloadFile(itemId: string): Promise<Blob> {
    if (!this.siteId) {
      throw new Error("Site ID not set. Please call getSite first.");
    }

    const response = await fetch(
      `${this.graphBaseUrl}/sites/${this.siteId}/drive/items/${itemId}/content`,
      {
        method: "GET",
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Upload a file to SharePoint
   */
  async uploadFile(
    folderId: string | null,
    fileName: string,
    content: Blob | ArrayBuffer
  ): Promise<SharePointItem> {
    if (!this.siteId) {
      throw new Error("Site ID not set. Please call getSite first.");
    }

    let url = `${this.graphBaseUrl}/sites/${this.siteId}/drive`;
    if (folderId) {
      url += `/items/${folderId}:/${fileName}:/content`;
    } else {
      url += `/root:/${fileName}:/content`;
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        ...this.getHeaders(),
        "Content-Type": "application/octet-stream",
      },
      body: content,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToSharePointItem(data);
  }

  /**
   * Determine item type from resource
   */
  private determineItemType(resource: Record<string, unknown>): "file" | "folder" | "list" {
    if (resource.folder) return "folder";
    if (resource.file) return "file";
    return "list";
  }

  /**
   * Map API response to SharePointItem format
   */
  private mapToSharePointItem(data: Record<string, unknown>): SharePointItem {
    return {
      id: String(data.id || ""),
      name: String(data.name || ""),
      webUrl: String(data.webUrl || ""),
      itemType: this.determineItemType(data),
      createdDateTime: new Date(String(data.createdDateTime || new Date())),
      lastModifiedDateTime: new Date(String(data.lastModifiedDateTime || new Date())),
      size: data.size as number | undefined,
      mimeType: (data.file as Record<string, unknown>)?.mimeType as string | undefined,
    };
  }

  /**
   * Map multiple API responses to SharePointItem format
   */
  private mapToSharePointItems(
    data: Record<string, unknown>[],
    defaultType?: "file" | "folder" | "list"
  ): SharePointItem[] {
    return data.map((item) => ({
      ...this.mapToSharePointItem(item),
      itemType: defaultType || this.determineItemType(item),
    }));
  }
}

export const sharepointService = new SharePointService();
