import { supabase } from './supabase';
import { sendEmail, EmailTemplates } from './emailService';

/**
 * Handles the creation and dispatch of workspace invitations
 */
export const createWorkspaceInvitations = async ({ emailList, workspaceId, role, invitedByProfile, workspaceName }) => {
  if (!emailList || emailList.length === 0) return { success: false, error: 'NO_EMAILS' };

  try {
    // 1. Prepare invitation records
    // Supabase will automatically generate tokens and IDs
    const invitations = emailList.map(email => ({
      workspace_id: workspaceId,
      email: email.toLowerCase(),
      role: role || 'MEMBER',
      invited_by: invitedByProfile.id
    }));

    // 2. Insert into database
    const { data: insertedInvites, error: insertError } = await supabase
      .from('workspace_invitations')
      .insert(invitations)
      .select();

    if (insertError) throw insertError;

    // 3. Dispatch emails via Resend
    const baseLink = `${window.location.origin}/invite`;
    const emailPromises = insertedInvites.map(invite => {
      const inviteLink = `${baseLink}/${invite.token}`;
      const template = EmailTemplates.workspaceInvitation(
        invitedByProfile.full_name || invitedByProfile.email,
        workspaceName,
        inviteLink
      );

      return sendEmail({
        to: invite.email,
        subject: template.subject,
        html: template.html
      });
    });

    const results = await Promise.all(emailPromises);
    const failures = results.filter(r => !r.success);

    if (failures.length > 0) {
      console.error('Some emails failed to send:', failures);
      // We don't throw here because DB insert was successful
    }

    return { 
      success: true, 
      count: insertedInvites.length,
      warning: failures.length > 0 ? 'SOME_EMAILS_FAILED' : null 
    };
  } catch (error) {
    console.error('Invitation service failure:', error);
    return { success: false, error: error.message || error };
  }
};

/**
 * Validates a token and returns invitation context
 */
export const getInvitationData = async (token) => {
  try {
    const { data, error } = await supabase
      .from('workspace_invitations')
      .select('*, workspaces(name, logo_url), profiles:invited_by(full_name, avatar_url)')
      .eq('token', token)
      .single();

    if (error) throw error;
    
    // Check expiration (7 days)
    const isExpired = new Date(data.expires_at) < new Date();
    const isAccepted = !!data.accepted_at;

    return { 
      success: true, 
      invitation: data, 
      isExpired, 
      isAccepted 
    };
  } catch (error) {
    console.error('Token validation failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Finalizes the invitation by adding the user to the workspace via Secure RPC
 */
export const acceptWorkspaceInvitation = async (token) => {
  try {
    const { data, error } = await supabase.rpc('join_workspace_via_invitation', { 
      invite_token: token 
    });

    if (error) throw error;
    if (data && !data.success) throw new Error(data.error);

    return { success: true, workspaceId: data.workspace_id };
  } catch (error) {
    console.error('Acceptance failed:', error);
    return { success: false, error: error.message || error };
  }
};
