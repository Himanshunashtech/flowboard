import { supabase } from './supabase';

/**
 * Sends an email via the Supabase send-email Edge Function.
 * This bypasses CORS issues and secures the Resend API key on the server.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        subject,
        html,
        text,
        from: 'FlowBoard <hello@unitsconverter.in>' // Default for free/testing tier
      }
    });

    if (error) throw error;
    
    // The resend API returns { id: "..." } on success
    return { success: true, data };
  } catch (error) {
    console.error('Email service failure:', error);
    return { success: false, error: error.message || error };
  }
};

/**
 * High-level notification helpers
 */
export const EmailTemplates = {
  workspaceInvitation: (inviter, workspaceName, inviteLink) => ({
    subject: `Join ${workspaceName} on FlowBoard`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #efefff; border-radius: 16px; max-width: 500px; margin: 0 auto; background: #ffffff;">
        <h2 style="color: #6366f1; margin-top: 0;">FlowBoard Team Invite</h2>
        <p style="color: #4b5563; line-height: 1.6;"><strong>${inviter}</strong> has invited you to join their workspace <strong>${workspaceName}</strong>.</p>
        <div style="margin: 30px 0;">
          <a href="${inviteLink}" style="display: inline-block; padding: 14px 28px; background: #6366f1; color: white; border-radius: 12px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">Join Workspace</a>
        </div>
        <p style="color: #9ca3af; font-size: 12px;">This invitation link will expire in 7 days.</p>
      </div>
    `
  }),
  boardInvitation: (inviter, boardName, inviteLink) => ({
    subject: `You've been invited to ${boardName}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #6366f1;">FlowBoard Invitation</h2>
        <p><strong>${inviter}</strong> has invited you to collaborate on the board <strong>${boardName}</strong>.</p>
        <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Join Board</a>
      </div>
    `
  }),
  cardAssignment: (assigneeName, cardTitle, listName) => ({
    subject: `Task Assigned: ${cardTitle}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h3 style="color: #6366f1;">New Task Assigned</h3>
        <p>Hi ${assigneeName},</p>
        <p>You have been assigned to the card <strong>${cardTitle}</strong> in list <strong>${listName}</strong>.</p>
      </div>
    `
  })
};
