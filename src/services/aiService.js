import { supabase } from '../lib/supabase';

/**
 * AI Service to handle requests to the Supabase Edge Function
 */
export const aiService = {
  /**
   * General completion request
   * @param {Object} params 
   * @param {string} params.action - The action to perform (IMPROVE, SUMMARIZE, etc.)
   * @param {string} params.text - The input text
   * @param {Object} [params.context] - Optional context like card title/description
   */
  async getCompletion({ action, text, context = {} }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          action, 
          text, 
          context,
          userId: user?.id 
        },
      });

      if (error) throw error;
      return data.completion;
    } catch (err) {
      console.error('AI Service Error:', err);
      throw err;
    }
  },

  /**
   * Specialized method for improving writing
   */
  async improveWriting(text) {
    return this.getCompletion({ action: 'IMPROVE', text });
  },

  /**
   * Specialized method for grammar checks
   */
  async fixGrammar(text) {
    return this.getCompletion({ action: 'FIX_GRAMMAR', text });
  },

  /**
   * Generate subtasks from description
   */
  async generateSubtasks(title, description) {
    const completion = await this.getCompletion({ 
      action: 'GENERATE_SUBTASKS', 
      text: description,
      context: { title }
    });
    
    try {
      // Basic cleanup in case Gemini adds markdown code blocks
      const cleaned = completion.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse subtasks JSON:', completion);
      // Fallback: split by lines if JSON fails
      return completion.split('\n').filter(line => line.trim()).map(line => line.replace(/^[-*]\s*/, '').trim());
    }
  },

  /**
   * Parse user intent from natural language
   */
  async parseIntention(text) {
    const completion = await this.getCompletion({ action: 'PARSE_INTENTION', text });
    try {
      return JSON.parse(completion.replace(/```json|```/g, '').trim());
    } catch (e) {
      console.error('Failed to parse intention JSON:', completion);
      return { title: text, is_actionable: false };
    }
  },

  /**
   * Generate a daily plan based on tasks and events
   */
  async generateDailyPlan(tasks, externalEvents) {
    const completion = await this.getCompletion({ 
      action: 'GENERATE_DAILY_PLAN', 
      text: 'Generate Schedule',
      context: { tasks, externalEvents }
    });
    try {
      return JSON.parse(completion.replace(/```json|```/g, '').trim());
    } catch (e) {
      console.error('Failed to parse daily plan JSON:', completion);
      return [];
    }
  },

  /**
   * Get focus tips for a specific card
   */
  async getFocusTips(card) {
    const completion = await this.getCompletion({ 
      action: 'GET_FOCUS_TIPS', 
      context: { title: card.title, description: card.description_text }
    });
    try {
      return JSON.parse(completion.replace(/```json|```/g, '').trim());
    } catch (e) {
      console.error('Failed to parse focus tips:', e);
      return [];
    }
  }
};
