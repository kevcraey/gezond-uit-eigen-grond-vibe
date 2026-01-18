// Wizard Configuration Types v3
// Rule-based business logic

export interface WizardConfig {
  version: string;
  general: GeneralConfig;
  answers: Answer[];
  results: { [id: string]: Result };
  rules: Rule[];
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

// =============================================================================
// ANSWERS
// =============================================================================

export type AnswerValue = string | boolean | number;

export interface Answer {
  id: string;
  type: 'computed' | 'input';
  name: string;
  source?: {
    type: 'wfs';
    layer: string;
    buffer: number;
    url?: string;
  };
}

// Runtime state: collected answers
export interface AnswerState {
  [answerId: string]: AnswerValue | undefined;
}

// =============================================================================
// RESULTS
// =============================================================================

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

// =============================================================================
// RULES
// =============================================================================

// Condition: all keys must match (AND logic)
export interface RuleCondition {
  [answerId: string]: AnswerValue;
}

export interface Rule {
  condition: RuleCondition;
  result: string;  // reference to results[id]
  priority: number;  // higher = evaluated first
}

// =============================================================================
// STEPS
// =============================================================================

export interface StepQuestion {
  answerId: string;
  title?: string;
  description?: string;
  type: 'radio';
  layout: 'vertical' | 'horizontal';
  options: QuestionOption[];
}

export interface QuestionOption {
  value: AnswerValue;
  label: string;
}

export interface Step {
  id: string;
  name: string;
  title: string;
  description?: string;
  helpLink?: {
    label: string;
    url: string;
  };
  type: 'intro' | 'address-input' | 'question' | 'results';
  triggersAnswers?: string[];  // for address-input: which computed answers
  resultsTitle?: string;
  questions?: StepQuestion[];
  navigation: {
    back: { label: string } | null;
    next: { label: string };
  };
}

// =============================================================================
// RULE ENGINE
// =============================================================================

/**
 * Evaluate all rules against current answers and return matching results
 */
export function evaluateRules(
  rules: Rule[],
  results: { [id: string]: Result },
  answers: AnswerState
): Result[] {
  // Sort by priority (highest first)
  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);
  
  const matchedResults: Result[] = [];
  const usedResultIds = new Set<string>();
  
  for (const rule of sortedRules) {
    // Check if all conditions match
    const conditionMatches = Object.entries(rule.condition).every(
      ([answerId, expectedValue]) => {
        const actualValue = answers[answerId];
        return actualValue === expectedValue;
      }
    );
    
    if (conditionMatches && !usedResultIds.has(rule.result)) {
      const result = results[rule.result];
      if (result) {
        matchedResults.push(result);
        usedResultIds.add(rule.result);
      }
    }
  }
  
  return matchedResults;
}

/**
 * Get all rules that involve the given answer IDs
 */
export function getRulesForAnswers(
  rules: Rule[],
  answerIds: string[]
): Rule[] {
  return rules.filter(rule => 
    Object.keys(rule.condition).some(id => answerIds.includes(id))
  );
}
