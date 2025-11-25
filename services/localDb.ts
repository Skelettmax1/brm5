import { Mission, User, Platoon } from '../types';

// CONFIGURATION
// REPLACE THIS URL WITH YOUR CLOUDFLARE WORKER URL AFTER DEPLOYMENT
const API_URL = 'https://brm5-backend.YOUR_SUBDOMAIN.workers.dev'; 

class ApiService {
  
  // --- Helper for fetch requests ---
  private async request<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const config: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      };

      const response = await fetch(`${API_URL}${endpoint}`, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server Error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`API Request Failed: ${endpoint}`, error);
      // If we are in the development environment without a real backend, throw a clear error
      if (error.message.includes('Failed to fetch')) {
        throw new Error('CONNECTION FAILED: Backend unreachable. Is the Cloudflare Worker deployed?');
      }
      throw error;
    }
  }

  // --- Auth Methods ---
  async login(username: string, password: string): Promise<User> {
    return this.request<User>('/auth/login', 'POST', { username, password });
  }

  async register(username: string, password: string, name: string, platoon: Platoon): Promise<User> {
    return this.request<User>('/auth/register', 'POST', { username, password, name, platoon });
  }

  // --- Mission Methods ---
  async getMissions(): Promise<Mission[]> {
    return this.request<Mission[]>('/missions', 'GET');
  }

  async saveMission(mission: Mission): Promise<Mission> {
    return this.request<Mission>('/missions', 'POST', mission);
  }

  async deleteMission(id: string): Promise<void> {
    return this.request<void>('/missions', 'DELETE', { id });
  }
}

export const db = new ApiService();