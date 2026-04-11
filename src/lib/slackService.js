import { supabase } from './supabase';

/**
 * Slack Integration Service
 * Routes all Slack interactions through the secure 'slack-proxy' Edge Function.
 */
export const slackService = {
  /**
   * Connect to Slack via OAuth
   */
  connect: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'slack',
      options: {
        scopes: 'channels:read,chat:write,commands',
        redirectTo: window.location.href
      }
    });
    if (error) throw error;
    return data;
  },

  /**
   * List all channels in the connected Slack workspace
   */
  listChannels: async () => {
    const { data, error } = await supabase.functions.invoke('slack-proxy', {
      body: { action: 'list-channels' }
    });
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    return data.channels || [];
  },

  /**
   * Link a Slack channel to a board
   */
  linkChannel: async (boardId, channelId, channelName) => {
    const { data, error } = await supabase.from('board_slack_channels')
      .upsert({
        board_id: boardId,
        channel_id: channelId,
        channel_name: channelName,
        is_active: true
      }, { onConflict: 'board_id' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Get the current Slack connection for the user
   */
  getConnection: async () => {
    const { data, error } = await supabase.from('slack_accounts')
      .select('slack_workspace_name, slack_user_id')
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  /**
   * Post a notification message to the linked Slack channel
   */
  notify: async (boardId, text, blocks = null) => {
    const { data: mapping } = await supabase.from('board_slack_channels')
      .select('channel_id')
      .eq('board_id', boardId)
      .maybeSingle();

    if (!mapping) return null;

    const { data, error } = await supabase.functions.invoke('slack-proxy', {
      body: { 
        action: 'post-message', 
        channelId: mapping.channel_id,
        text,
        blocks
      }
    });
    return data;
  }
};
