"use server";

import { Resend } from "resend";
import { str } from "../../lib/validate";

const MAX_FEEDBACK_LEN = 3000;
// Kept server-side only — this file never ships to the client bundle (server
// actions expose just a callable reference, not their source), so the
// destination address stays invisible to users.
const FEEDBACK_TO_EMAIL = process.env.FEEDBACK_TO_EMAIL || "nfabir7@gmail.com";

export async function submitFeedback(rawText) {
  const text = str(rawText, MAX_FEEDBACK_LEN);
  if (!text) return { error: "Please write some feedback before sending." };

  if (!process.env.RESEND_API_KEY) {
    return { error: "Feedback sending isn't configured on the server yet." };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "Vocabularium Feedback <onboarding@resend.dev>",
      to: FEEDBACK_TO_EMAIL,
      subject: "New Vocabularium feedback",
      text,
    });

    if (error) {
      console.error("Failed to send feedback email:", error);
      return { error: "Failed to send feedback. Please try again." };
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to send feedback email:", err);
    return { error: "Failed to send feedback. Please try again." };
  }
}
