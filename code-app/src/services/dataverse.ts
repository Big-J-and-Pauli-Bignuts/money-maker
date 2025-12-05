import axios, { AxiosInstance } from 'axios';
import { getAccessToken, dataverseScopes } from './auth';

export interface DataverseEntity {
  [key: string]: any;
}

export class DataverseClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_DATAVERSE_URL}/api/data/v${import.meta.env.VITE_DATAVERSE_API_VERSION}`;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        Accept: 'application/json',
      },
    });

    // Add request interceptor to include access token
    this.client.interceptors.request.use(async (config) => {
      const token = await getAccessToken(dataverseScopes.scopes);
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Query entities from Dataverse
   */
  async query<T = DataverseEntity>(
    entityName: string,
    options?: {
      select?: string[];
      filter?: string;
      orderBy?: string;
      top?: number;
      expand?: string;
    }
  ): Promise<T[]> {
    const params: any = {};
    if (options?.select) params.$select = options.select.join(',');
    if (options?.filter) params.$filter = options.filter;
    if (options?.orderBy) params.$orderby = options.orderBy;
    if (options?.top) params.$top = options.top;
    if (options?.expand) params.$expand = options.expand;

    const response = await this.client.get(`/${entityName}`, { params });
    return response.data.value;
  }

  /**
   * Get a single entity by ID
   */
  async getById<T = DataverseEntity>(
    entityName: string,
    id: string,
    select?: string[]
  ): Promise<T> {
    const params: any = {};
    if (select) params.$select = select.join(',');

    const response = await this.client.get(`/${entityName}(${id})`, { params });
    return response.data;
  }

  /**
   * Create a new entity
   */
  async create<T = DataverseEntity>(
    entityName: string,
    data: Partial<T>
  ): Promise<string> {
    const response = await this.client.post(`/${entityName}`, data);
    // Extract ID from the response header
    const entityUrl = response.headers['odata-entityid'];
    const id = entityUrl.match(/\(([^)]+)\)/)?.[1] || '';
    return id;
  }

  /**
   * Update an existing entity
   */
  async update<T = DataverseEntity>(
    entityName: string,
    id: string,
    data: Partial<T>
  ): Promise<void> {
    await this.client.patch(`/${entityName}(${id})`, data);
  }

  /**
   * Delete an entity
   */
  async delete(entityName: string, id: string): Promise<void> {
    await this.client.delete(`/${entityName}(${id})`);
  }

  /**
   * Execute an action
   */
  async executeAction(
    actionName: string,
    parameters?: Record<string, any>
  ): Promise<any> {
    const response = await this.client.post(`/${actionName}`, parameters);
    return response.data;
  }
}

// Export singleton instance
export const dataverseClient = new DataverseClient();
