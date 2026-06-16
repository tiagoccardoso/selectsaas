interface PasswordResetEmailInput {
  to: string;
  resetUrl: string;
}

interface EmailDeliveryResult {
  configured: boolean;
  sent: boolean;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendPasswordResetEmail({ to, resetUrl }: PasswordResetEmailInput): Promise<EmailDeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.PASSWORD_RESET_EMAIL_FROM;

  if (!apiKey || !from) {
    return { configured: false, sent: false };
  }

  const safeResetUrl = escapeHtml(resetUrl);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Recuperação de senha SelectSaaS",
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
          <h1 style="font-size: 22px;">Recuperação de senha</h1>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta SelectSaaS.</p>
          <p>Para criar uma nova senha, acesse o link abaixo. Ele é temporário e expira em 1 hora.</p>
          <p><a href="${safeResetUrl}" style="display: inline-block; background: #7c3aed; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 700;">Redefinir senha</a></p>
          <p>Se você não solicitou essa recuperação, ignore este e-mail.</p>
        </div>
      `,
      text: `Recebemos uma solicitação para redefinir sua senha SelectSaaS. Acesse o link temporário, válido por 1 hora: ${resetUrl}. Se você não solicitou essa recuperação, ignore este e-mail.`,
    }),
  });

  if (!response.ok) {
    console.error("Falha ao enviar e-mail de recuperação de senha.", { status: response.status });
    return { configured: true, sent: false };
  }

  return { configured: true, sent: true };
}
