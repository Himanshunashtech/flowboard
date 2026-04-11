import { supabase } from './supabase';

/**
 * GitHub Service Wrapper
 * All requests are routed through Supabase Edge Functions to ensure:
 * 1. Secure token handling (Token never leaves the backend)
 * 2. Centralized rate limiting
 * 3. Consistent caching logic
 */
export const githubService = {
  /**
   * Search for repositories accessible by the user
   */
  searchRepositories: async (query = '') => {
    const { data, error } = await supabase.functions.invoke('github-proxy', {
      body: { action: 'search-repos', query }
    });
    if (error) throw error;
    return data;
  },

  /**
   * Link a repository to a board
   */
  linkRepository: async (boardId, repo) => {
    const { data, error } = await supabase.from('board_repositories').insert({
      board_id: boardId,
      repo_id: repo.id,
      repo_full_name: repo.full_name,
      repo_url: repo.html_url,
      default_branch: repo.default_branch || 'main'
    }).select().single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Search for Issues or Pull Requests in a linked repository
   */
  searchItems: async (boardId, query, type = 'all') => {
    const { data, error } = await supabase.functions.invoke('github-proxy', {
      body: { action: 'search-items', boardId, query, type }
    });
    if (error) throw error;
    return data;
  },

  /**
   * Link a GitHub item (Issue/PR) to a card
   */
  linkItemToCard: async (cardId, item) => {
    const { data, error } = await supabase.from('card_github_items').insert({
      card_id: cardId,
      github_id: item.id,
      item_type: item.pull_request ? 'PULL_REQUEST' : 'ISSUE',
      item_number: item.number,
      title: item.title,
      state: item.state.toUpperCase(),
      url: item.html_url,
      repo_full_name: item.repository_url.split('/repos/')[1]
    }).select().single();

    if (error) throw error;
    return data;
  },

  /**
   * Refresh the status of all linked items on a card
   */
  syncCardItems: async (cardId) => {
    const { data, error } = await supabase.functions.invoke('github-proxy', {
      body: { action: 'sync-card', cardId }
    });
    if (error) throw error;
    return data;
  },

  /**
   * Get the GitHub connection status for the current user
   */
  getConnectionStatus: async () => {
    const { data, error } = await supabase.from('github_accounts').select('github_username').maybeSingle();
    if (error) throw error;
    return data;
  }
};
