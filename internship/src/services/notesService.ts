import { apiClient } from '../api';
import type { Note } from '../types';

// Admin notes services
export const notesService = {
  // Get all notes for an application
  getByApplication: async (applicationId: number): Promise<Note[]> => {
    const response = await apiClient.get<Note[]>(`/admin/applications/${applicationId}/notes`, true);
    return response.data || [];
  },

  // Create note
  create: async (applicationId: number, note: string): Promise<Note> => {
    const response = await apiClient.post<Note>(
      `/admin/applications/${applicationId}/notes`,
      { note },
      true
    );
    if (!response.data) {
      throw new Error(response.message || 'Failed to create note');
    }
    return response.data;
  },

  // Update note
  update: async (noteId: number, note: string): Promise<Note> => {
    const response = await apiClient.put<Note>(
      `/admin/notes/${noteId}`,
      { note },
      true
    );
    if (!response.data) {
      throw new Error(response.message || 'Failed to update note');
    }
    return response.data;
  },

  // Delete note
  delete: async (noteId: number): Promise<void> => {
    await apiClient.delete(`/admin/notes/${noteId}`, true);
  },
};

