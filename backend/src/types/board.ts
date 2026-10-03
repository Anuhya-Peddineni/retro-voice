export type ColumnKey = 'well' | 'improve' | 'actions';
export type AnalysisCardStatus = 'pending' | 'accepted' | 'rejected';

export interface FeedbackItem {
  id: string;
  text: string;
  author?: string;
  createdAt?: string;
  createdBy?: string;
  editedAt?: string;
  editedBy?: string;
}

