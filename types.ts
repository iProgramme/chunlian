
export enum WorkflowStep {
  UPLOAD = 'UPLOAD',
  VISUALIZE = 'VISUALIZE',
  FINAL = 'FINAL'
}

export interface SocialCopy {
  title: string;
  content: string;
}

export interface AppState {
  step: WorkflowStep;
  coupletImage: string | null; // Renamed from originalImage (The product)
  doorImage: string | null;    // New: User's own door (Target scene)
  
  // Text Inputs (Step 1)
  originalCopy: SocialCopy;
  
  // Visualization Config & Results (Step 2)
  generatedImages: string[]; // Array of Base64
  selectedImageIndex: number; // Which image user picked
  generatedCopy: SocialCopy | null;
  
  isLoading: boolean;
  error: string | null;
}

// Window augmentation for AiStudio key selection
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}
