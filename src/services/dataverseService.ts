import type { DataverseRecord } from "../types";

/**
 * Dataverse Service for interacting with Microsoft Dataverse
 * Requires proper Azure AD authentication with appropriate scopes
 */
export class DataverseService {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(organizationUrl?: string) {
    this.baseUrl = organizationUrl || 
      `https://${import.meta.env.VITE_DATAVERSE_URL || "your-org"}.crm.dynamics.com/api/data/v9.2`;
  }

  /**
   * Set the access token for API calls
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
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
      "OData-MaxVersion": "4.0",
      "OData-Version": "4.0",
      Accept: "application/json",
      "Content-Type": "application/json; charset=utf-8",
    };
  }

  /**
   * Query records from a Dataverse entity
   */
  async queryRecords(
    entityName: string,
    select?: string[],
    filter?: string,
    top?: number
  ): Promise<DataverseRecord[]> {
    let url = `${this.baseUrl}/${entityName}`;
    const params: string[] = [];

    if (select && select.length > 0) {
      params.push(`$select=${select.join(",")}`);
    }
    if (filter) {
      params.push(`$filter=${encodeURIComponent(filter)}`);
    }
    if (top) {
      params.push(`$top=${top}`);
    }

    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Dataverse query failed: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToRecords(entityName, data.value || []);
  }

  /**
   * Get a single record by ID
   */
  async getRecord(
    entityName: string,
    recordId: string,
    select?: string[]
  ): Promise<DataverseRecord | null> {
    let url = `${this.baseUrl}/${entityName}(${recordId})`;

    if (select && select.length > 0) {
      url += `?$select=${select.join(",")}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Dataverse get failed: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToRecord(entityName, data);
  }

  /**
   * Create a new record
   */
  async createRecord(
    entityName: string,
    data: Record<string, unknown>
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/${entityName}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Dataverse create failed: ${response.statusText}`);
    }

    // Extract the record ID from the OData-EntityId header
    const entityId = response.headers.get("OData-EntityId");
    if (entityId) {
      const match = entityId.match(/\(([^)]+)\)/);
      return match ? match[1] : "";
    }
    return "";
  }

  /**
   * Update an existing record
   */
  async updateRecord(
    entityName: string,
    recordId: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${entityName}(${recordId})`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Dataverse update failed: ${response.statusText}`);
    }
  }

  /**
   * Delete a record
   */
  async deleteRecord(entityName: string, recordId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${entityName}(${recordId})`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Dataverse delete failed: ${response.statusText}`);
    }
  }

  /**
   * Map API response to DataverseRecord format
   */
  private mapToRecord(entityType: string, data: Record<string, unknown>): DataverseRecord {
    return {
      id: String(data["@odata.etag"] || data["id"] || ""),
      entityType,
      attributes: data,
      createdOn: new Date(String(data["createdon"] || new Date())),
      modifiedOn: new Date(String(data["modifiedon"] || new Date())),
    };
  }

  /**
   * Map multiple API responses to DataverseRecord format
   */
  private mapToRecords(entityType: string, data: Record<string, unknown>[]): DataverseRecord[] {
    return data.map((item) => this.mapToRecord(entityType, item));
  }
}

export const dataverseService = new DataverseService();
