/**
 * The invitation / password-reset contracts, mirroring the backend.
 */

/** What a token preview returns — enough to greet the person, nothing more. */
export interface TokenPreview {
  firstName: string;
  email: string;
  organizationName: string | null;
  expiresAt: string;
}

export interface AcceptInvitationBody {
  password: string;
}

export interface ForgotPasswordBody {
  email: string;
}

export interface ResetPasswordBody {
  password: string;
}

/**
 * What the API reports about an invitation it just queued.
 *
 * Note what is **not** here. There is no `url`: the link is a credential that
 * sets an account's password, and it now travels only by email — it used to
 * come back in the response so an admin could copy it out of a dialog, which
 * put it in the browser, the network log and anywhere that response was
 * recorded.
 *
 * There is no `delivered` either, and there cannot be: the send happens in a
 * queue consumer, so nothing the API returns at request time could honestly
 * claim it. `queued` says the message was accepted; `emailJobId` is the thread
 * that leads to what became of it.
 */
export interface InvitationResult {
  queued: boolean;
  expiresAt: string;
  emailJobId: string | null;
}
