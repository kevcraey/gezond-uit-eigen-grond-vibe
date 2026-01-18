// Wizard Configuration Types

export interface WizardConfig {
  version: string;
  general: GeneralConfig;
  addressChecks: AddressCheck[];
  steps: Step[];
}

export interface GeneralConfig {
  title: string;
  description: string;
  advice: {
    title: string;
    intro: string;
    items: string[];
  };
}

export interface Result {
  title: string;
  description: string;  // HTML allowed
  button?: {
    caption: string;
    link: string;
  };
  type: 'success' | 'warning' | 'error';
  important: boolean;  // true = normal alert, false = naked alert
}

export interface AddressCheck {
  id: string;
  name: string;
  source: string;
  results: {
    true: Result;
    false: Result;
  };
}

export interface QuestionOption {
  value: string;
  label: string;
  result: Result;
}

export interface Question {
  id: string;
  title?: string;
  description?: string;
  type: 'radio';
  layout: 'vertical' | 'horizontal';
  options: QuestionOption[];
}

export interface Step {
  id: string;
  name: string;
  title: string;
  description: string;
  helpText?: string;
  helpLink?: {
    label: string;
    url: string;
  };
  type: 'address-input' | 'question';
  triggersChecks?: string[];
  resultsTitle: string;
  questions?: Question[];
  navigation: {
    back: { label: string } | null;
    next: {
      label: string;
      requiresConfirmation: boolean;
    };
  };
}

// Answer state type
export interface WizardAnswers {
  [questionId: string]: string;
}

// Check results type
export interface CheckResults {
  [checkId: string]: boolean;
}
