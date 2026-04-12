import { supabase } from './supabase';

/**
 * Universal Integration Manager
 * Handles OAuth orchestration, token lifecycle, and service-agnostic connection state.
 */
export const integrationService = {
  /**
   * Fetch all integrated accounts for the current user
   */
  getAccounts: async () => {
    const { data, error } = await supabase
      .from('integrated_accounts')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },

  /**
   * Fetch connections for a specific board
   */
  getBoardConnections: async (boardId) => {
    const { data, error } = await supabase
      .from('board_connections')
      .select('*, account:integrated_accounts(*)')
      .eq('board_id', boardId);
      
    if (error) throw error;
    return data;
  },

  /**
   * Connect a board to an external resource (e.g., Slack Channel, Jira Project)
   */
  connectBoard: async (boardId, accountId, resourceId, resourceName, config = {}) => {
    const { data, error } = await supabase
      .from('board_connections')
      .insert({
        board_id: boardId,
        account_id: accountId,
        external_resource_id: resourceId,
        external_resource_name: resourceName,
        config
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  /**
   * Log an integration event (Bidirectional audit trail)
   */
  logEvent: async (connectionId, service, direction, payload, status, errorMessage = null) => {
    const { error } = await supabase
      .from('integration_logs')
      .insert({
        connection_id: connectionId,
        service,
        direction,
        payload,
        status,
        error_message: errorMessage
      });
      
    if (error) console.error('Failed to log integration event:', error);
  },

  /**
   * Proxy request to external service via Supabase Edge Functions
   * Ensures tokens remain secure on the backend.
   */
  callService: async (service, action, params = {}) => {
    const { data, error } = await supabase.functions.invoke('integration-orchestrator', {
      body: { service, action, ...params }
    });
    
    if (error) throw error;
    return data;
  }
};
