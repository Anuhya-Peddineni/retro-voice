import * as admin from 'firebase-admin';
import type { RetroAnalysisResponse } from '../types/retro';
import type { ColumnKey, FeedbackItem } from '../types/board';

export type AnalysisCardStatus = 'pending' | 'accepted' | 'rejected';

export interface SprintBoardData {
  sprintName: string;
  analysis: RetroAnalysisResponse | null;
  manualItems: Record<ColumnKey, FeedbackItem[]>;
  completedActionItems: string[];
  analysisCardStatus: Record<string, AnalysisCardStatus>;
  metadata: {
    lastAnalyzedAt?: string;
    lastModifiedAt: string;
    createdAt: string;
  };
}

export interface IFirestoreService {
  saveBoardData(sprintName: string, data: SprintBoardData): Promise<void>;
  getBoardData(sprintName: string): Promise<SprintBoardData | null>;
  updateBoardData(sprintName: string, updates: Partial<SprintBoardData>): Promise<void>;
  deleteBoardData(sprintName: string): Promise<void>;
}

export class FirestoreService implements IFirestoreService {
  private db: admin.firestore.Firestore;
  private collectionName = 'sprints';

  constructor(projectId?: string) {
    if (!admin.apps.length) {
      if (projectId) {
        admin.initializeApp({
          projectId,
        });
      } else {
        admin.initializeApp();
      }
    }
    this.db = admin.firestore();
  }

  private sanitizeAnalysisForStorage(analysis: SprintBoardData['analysis']): any {
    if (!analysis) return null;

    return {
      ...analysis,
      wentWell: analysis.wentWell.map(({ id, title, description }) => ({ id, title, description })),
      didntGoWell: analysis.didntGoWell.map(({ id, title, description }) => ({ id, title, description })),
    } as any;
  }

  async saveBoardData(sprintName: string, data: SprintBoardData): Promise<void> {
    const docRef = this.db.collection(this.collectionName).doc(sprintName);
    const now = new Date().toISOString();

    try {
      await docRef.set({
        ...data,
        analysis: this.sanitizeAnalysisForStorage(data.analysis),
        metadata: {
          ...data.metadata,
          lastModifiedAt: now,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to save board data for sprint ${sprintName}: ${message}`);
    }
  }

  async getBoardData(sprintName: string): Promise<SprintBoardData | null> {
    const docRef = this.db.collection(this.collectionName).doc(sprintName);

    try {
      const doc = await docRef.get();
      if (!doc.exists) {
        return null;
      }
      return doc.data() as SprintBoardData;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to retrieve board data for sprint ${sprintName}: ${message}`);
    }
  }

  async updateBoardData(sprintName: string, updates: Partial<SprintBoardData>): Promise<void> {
    const docRef = this.db.collection(this.collectionName).doc(sprintName);
    const now = new Date().toISOString();

    try {
      const sanitizedUpdates = {
        ...updates,
        analysis: updates.analysis ? this.sanitizeAnalysisForStorage(updates.analysis) : undefined,
      };

      await docRef.update({
        ...sanitizedUpdates,
        'metadata.lastModifiedAt': now,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update board data for sprint ${sprintName}: ${message}`);
    }
  }

  async deleteBoardData(sprintName: string): Promise<void> {
    const docRef = this.db.collection(this.collectionName).doc(sprintName);

    try {
      await docRef.delete();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete board data for sprint ${sprintName}: ${message}`);
    }
  }
}


