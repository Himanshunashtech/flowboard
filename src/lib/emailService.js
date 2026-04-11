import { Resend } from 'resend';

// NOTE: This usually runs on a server/edge function.
// For client-side demo purposes, we provide the structure.
// Users should set VITE_RESEND_API_KEY in their environment.
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const DEFAULT_FROM = 'FlowBoard <notifications@flowboard.app>';

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!resend) {
    console.warn('Resend API Key missing. Skipping email:', { to, subject });
    return { success: false, error: 'API_KEY_MISSING' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to,
      subject,
      html,
      text
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Email failed:', error);
    return { success: false, error };
  }
};

/**
 * High-level notification helpers
 */
export const EmailTemplates = {
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
