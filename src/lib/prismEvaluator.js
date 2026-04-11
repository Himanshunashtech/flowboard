/**
 * PRISM ENGINE — Rule Evaluator
 * Evaluates conditional formatting rules against card data.
 */

export const OPERATORS = {
  EQ: 'eq',
  NEQ: 'neq',
  GT: 'gt',
  LT: 'lt',
  CONTAINS: 'contains',
  EXISTS: 'exists',
  NOT_EXISTS: 'not_exists'
};

export const evaluatePrismRule = (card, rule) => {
  if (!rule.condition) return false;
  
  const { field, operator, value } = rule.condition;
  const cardValue = card[field];

  switch (operator) {
    case OPERATORS.EQ:
      return cardValue === value;
    case OPERATORS.NEQ:
      return cardValue !== value;
    case OPERATORS.GT:
      return Number(cardValue) > Number(value);
    case OPERATORS.LT:
      return Number(cardValue) < Number(value);
    case OPERATORS.CONTAINS:
      return String(cardValue || '').toLowerCase().includes(String(value || '').toLowerCase());
    case OPERATORS.EXISTS:
      return !!cardValue;
    case OPERATORS.NOT_EXISTS:
      return !cardValue;
    default:
      return false;
  }
};

/**
 * Resolves all styles for a given card based on board-level prism rules.
 */
export const resolvePrismStyles = (card, rules = []) => {
  const activeStyles = {
    rowBg: null,
    rowBorder: null,
    textColor: null,
    glow: false
  };

  rules.forEach(rule => {
    if (evaluatePrismRule(card, rule)) {
      if (rule.style.rowBg) activeStyles.rowBg = rule.style.rowBg;
      if (rule.style.rowBorder) activeStyles.rowBorder = rule.style.rowBorder;
      if (rule.style.textColor) activeStyles.textColor = rule.style.textColor;
      if (rule.style.glow) activeStyles.glow = true;
    }
  });

  return activeStyles;
};
