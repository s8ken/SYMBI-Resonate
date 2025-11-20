import { Experiment, ExperimentRun, Trial, Evaluation, ResonanceMeasurement, CreateExperimentData, ExperimentStatistics } from '@/lib/experiments/types';

const API_BASE_URL = 'http://localhost:3001/api/experiments';

class ExperimentsAPI {
  private async fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      console.log('Making API call to:', url);
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      console.log('API response status:', response.status);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API error response:', error);
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('API call successful, data:', result);
      return result;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Experiments
  async getExperiments(): Promise<Experiment[]> {
    return this.fetchWithErrorHandling<Experiment[]>(`${API_BASE_URL}/`);
  }

  async getExperiment(id: string): Promise<Experiment> {
    return this.fetchWithErrorHandling<Experiment>(`${API_BASE_URL}/${id}`);
  }

  async createExperiment(data: CreateExperimentData): Promise<Experiment> {
    return this.fetchWithErrorHandling<Experiment>(`${API_BASE_URL}/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExperiment(id: string, data: Partial<Experiment>): Promise<Experiment> {
    return this.fetchWithErrorHandling<Experiment>(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteExperiment(id: string): Promise<void> {
    await this.fetchWithErrorHandling<void>(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
  }

  async updateExperimentStatus(id: string, status: string): Promise<Experiment> {
    return this.fetchWithErrorHandling<Experiment>(`${API_BASE_URL}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Experiment Runs
  async getExperimentRuns(experimentId: string): Promise<ExperimentRun[]> {
    return this.fetchWithErrorHandling<ExperimentRun[]>(`${API_BASE_URL}/${experimentId}/runs`);
  }

  async createExperimentRun(experimentId: string): Promise<ExperimentRun> {
    return this.fetchWithErrorHandling<ExperimentRun>(`${API_BASE_URL}/${experimentId}/runs`, {
      method: 'POST',
    });
  }

  async updateExperimentRun(experimentId: string, runId: string, data: Partial<ExperimentRun>): Promise<ExperimentRun> {
    return this.fetchWithErrorHandling<ExperimentRun>(`${API_BASE_URL}/${experimentId}/runs/${runId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Trials
  async getTrials(experimentId: string, runId?: string): Promise<Trial[]> {
    const url = runId 
      ? `${API_BASE_URL}/${experimentId}/runs/${runId}/trials`
      : `${API_BASE_URL}/${experimentId}/trials`;
    return this.fetchWithErrorHandling<Trial[]>(url);
  }

  async createTrial(experimentId: string, runId: string, data: any): Promise<Trial> {
    return this.fetchWithErrorHandling<Trial>(`${API_BASE_URL}/${experimentId}/runs/${runId}/trials`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Evaluations
  async getEvaluations(experimentId: string, trialId?: string): Promise<Evaluation[]> {
    const url = trialId
      ? `${API_BASE_URL}/${experimentId}/trials/${trialId}/evaluations`
      : `${API_BASE_URL}/${experimentId}/evaluations`;
    return this.fetchWithErrorHandling<Evaluation[]>(url);
  }

  async createEvaluation(experimentId: string, trialId: string, data: any): Promise<Evaluation> {
    return this.fetchWithErrorHandling<Evaluation>(`${API_BASE_URL}/${experimentId}/trials/${trialId}/evaluations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Resonance Measurements
  async getResonanceMeasurements(experimentId: string, runId?: string): Promise<ResonanceMeasurement[]> {
    const url = runId
      ? `${API_BASE_URL}/${experimentId}/runs/${runId}/resonance`
      : `${API_BASE_URL}/${experimentId}/resonance`;
    return this.fetchWithErrorHandling<ResonanceMeasurement[]>(url);
  }

  async createResonanceMeasurement(experimentId: string, runId: string, data: any): Promise<ResonanceMeasurement> {
    return this.fetchWithErrorHandling<ResonanceMeasurement>(`${API_BASE_URL}/${experimentId}/runs/${runId}/resonance`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Statistics
  async getExperimentStatistics(experimentId: string): Promise<ExperimentStatistics> {
    return this.fetchWithErrorHandling<ExperimentStatistics>(`${API_BASE_URL}/${experimentId}/statistics`);
  }

  // Export
  async exportExperimentData(experimentId: string, format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/${experimentId}/export?format=${format}`);
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    return response.blob();
  }
}

export const experimentsAPI = new ExperimentsAPI();