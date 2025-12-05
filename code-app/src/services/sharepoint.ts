import axios, { AxiosInstance } from 'axios';
import { getAccessToken, graphScopes } from './auth';

export interface SharePointFile {
  id: string;
  name: string;
  webUrl: string;
  size: number;
  lastModifiedDateTime: string;
  createdDateTime: string;
  folder?: {
    childCount: number;
  };
  file?: {
    mimeType: string;
  };
  createdBy: {
    user: {
      displayName: string;
      email: string;
    };
  };
  lastModifiedBy: {
    user: {
      displayName: string;
      email: string;
    };
  };
}

export interface SharePointListItem {
  id: string;
  fields: {
    [key: string]: any;
  };
  webUrl: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
}

export interface SharePointSiteInfo {
  id: string;
  displayName: string;
  description: string;
  webUrl: string;
}

export class SharePointClient {
  private client: AxiosInstance;
  private siteUrl: string;

  constructor() {
    this.siteUrl = import.meta.env.VITE_SHAREPOINT_SITE_URL;
    this.client = axios.create({
      baseURL: 'https://graph.microsoft.com/v1.0',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include access token
    this.client.interceptors.request.use(async (config) => {
      const token = await getAccessToken(graphScopes.scopes);
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Get SharePoint site information
   */
  async getSiteInfo(sitePath: string): Promise<SharePointSiteInfo> {
    const hostname = new URL(this.siteUrl).hostname;
    const response = await this.client.get(
      `/sites/${hostname}:${sitePath}`
    );
    return response.data;
  }

  /**
   * Get documents from a SharePoint document library
   */
  async getDocuments(sitePath: string, libraryName: string = 'Documents'): Promise<SharePointFile[]> {
    const siteInfo = await this.getSiteInfo(sitePath);
    const response = await this.client.get(
      `/sites/${siteInfo.id}/drives`
    );
    
    // Find the document library by name
    const drive = response.data.value.find((d: any) => d.name === libraryName);
    if (!drive) {
      throw new Error(`Library ${libraryName} not found`);
    }

    // Get items from the drive
    const itemsResponse = await this.client.get(
      `/drives/${drive.id}/root/children`,
      {
        params: {
          $select: 'id,name,webUrl,size,lastModifiedDateTime,createdDateTime,folder,file,createdBy,lastModifiedBy',
          $orderby: 'lastModifiedDateTime desc',
        },
      }
    );

    return itemsResponse.data.value;
  }

  /**
   * Search for files in SharePoint
   */
  async searchFiles(sitePath: string, query: string): Promise<SharePointFile[]> {
    const siteInfo = await this.getSiteInfo(sitePath);
    const response = await this.client.get(
      `/sites/${siteInfo.id}/drive/root/search(q='${encodeURIComponent(query)}')`,
      {
        params: {
          $select: 'id,name,webUrl,size,lastModifiedDateTime,createdDateTime,folder,file,createdBy,lastModifiedBy',
        },
      }
    );

    return response.data.value;
  }

  /**
   * Get items from a SharePoint list
   */
  async getListItems(sitePath: string, listName: string): Promise<SharePointListItem[]> {
    const siteInfo = await this.getSiteInfo(sitePath);
    
    // Get lists
    const listsResponse = await this.client.get(
      `/sites/${siteInfo.id}/lists`,
      {
        params: {
          $filter: `displayName eq '${listName}'`,
        },
      }
    );

    if (listsResponse.data.value.length === 0) {
      throw new Error(`List ${listName} not found`);
    }

    const listId = listsResponse.data.value[0].id;

    // Get list items
    const itemsResponse = await this.client.get(
      `/sites/${siteInfo.id}/lists/${listId}/items`,
      {
        params: {
          $expand: 'fields',
          $orderby: 'lastModifiedDateTime desc',
        },
      }
    );

    return itemsResponse.data.value;
  }

  /**
   * Get recent files from SharePoint site
   */
  async getRecentFiles(sitePath: string, top: number = 10): Promise<SharePointFile[]> {
    const siteInfo = await this.getSiteInfo(sitePath);
    const response = await this.client.get(
      `/sites/${siteInfo.id}/drive/recent`,
      {
        params: {
          $top: top,
          $select: 'id,name,webUrl,size,lastModifiedDateTime,createdDateTime,file,createdBy,lastModifiedBy',
        },
      }
    );

    return response.data.value;
  }

  /**
   * Upload file to SharePoint
   */
  async uploadFile(
    sitePath: string,
    fileName: string,
    fileContent: Blob,
    folderPath: string = ''
  ): Promise<SharePointFile> {
    const siteInfo = await this.getSiteInfo(sitePath);
    
    // Get the default drive
    const drivesResponse = await this.client.get(`/sites/${siteInfo.id}/drives`);
    const drive = drivesResponse.data.value[0];

    const uploadPath = folderPath 
      ? `/drives/${drive.id}/root:/${folderPath}/${fileName}:/content`
      : `/drives/${drive.id}/root:/${fileName}:/content`;

    const response = await this.client.put(uploadPath, fileContent, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });

    return response.data;
  }

  /**
   * Get site pages/news
   */
  async getSitePages(sitePath: string): Promise<any[]> {
    const siteInfo = await this.getSiteInfo(sitePath);
    const response = await this.client.get(
      `/sites/${siteInfo.id}/pages`,
      {
        params: {
          $orderby: 'lastModifiedDateTime desc',
        },
      }
    );

    return response.data.value;
  }
}

export const sharepointClient = new SharePointClient();
