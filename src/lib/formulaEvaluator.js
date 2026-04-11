import { differenceInDays, parseISO, startOfDay } from 'date-fns';

/**
 * FORMULA ENGINE
 * Parses and calculates dynamic values for "Logic Cells".
 */

const PRIORITY_MAP = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
  NONE: 0
};

export const evaluateFormula = (card, formula, context = {}) => {
  if (!formula) return null;

  try {
    let expression = formula;

    // 1. Substitute Tokens
    const tokens = {
      '{{priority_score}}': PRIORITY_MAP[card.priority] || 0,
      '{{is_completed}}': card.is_completed ? 1 : 0,
      '{{title_length}}': (card.title || '').length,
      '{{days_left}}': card.due_date 
        ? differenceInDays(startOfDay(parseISO(card.due_date)), startOfDay(new Date())) 
        : 0,
      '{{checklist_count}}': (card.checklist_items || []).length,
      '{{checklist_done}}': (card.checklist_items || []).filter(i => i.is_completed).length,
    };

    // Calculate checklist percentage
    const done = tokens['{{checklist_done}}'];
    const total = tokens['{{checklist_count}}'];
    tokens['{{checklist_pct}}'] = total > 0 ? Math.round((done / total) * 100) : 0;

    // Replace tokens in expression
    Object.entries(tokens).forEach(([token, val]) => {
      expression = expression.replace(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), val);
    });

    // 2. Evaluate Math Expression safely
    // We use a restricted Function for basic math as we don't have a full expression parser like mathjs here.
    // SECURITY: This only runs alphanumeric and basic math operators.
    const cleanExpression = expression.replace(/[^0-9+\-*/().\s]/g, '');
    
    // eslint-disable-next-line no-new-func
    const result = new Function(`return ${cleanExpression || '0'}`)();
    
    return Number.isFinite(result) ? result : 0;
  } catch (err) {
    console.error('Formula evaluation error:', err);
    return 'Error';
  }
};
