export interface Annotation {
  id: string;
  element: string; // CSS selector or data attribute
  title: string;
  content: string;
  type: 'tooltip' | 'popover' | 'highlight' | 'tour';
  position?: 'top' | 'bottom' | 'left' | 'right';
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  showOnce?: boolean;
  delay?: number;
}

export interface TourStep {
  id: string;
  element: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
  spotlight?: boolean;
}

export interface AnnotationSystemState {
  helpMode: boolean;
  activeTour: string | null;
  currentStep: number;
  dismissedAnnotations: string[];
  completedTours: string[];
}