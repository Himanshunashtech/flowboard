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
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { action, text, context },
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
  }
};
