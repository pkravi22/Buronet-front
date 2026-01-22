import nodemailer from 'nodemailer';

type ReportPostPayload = {
  postId: number | string;
  postUrl?: string;
  message?: string;
  reporter?: {
    id?: string;
    email?: string;
    username?: string;
  };
};

function getHeader(req: Request, name: string): string | null {
  return req.headers.get(name);
}

function getBaseUrl(req: Request): string {
  const proto = getHeader(req, 'x-forwarded-proto') || 'http';
  const host = getHeader(req, 'x-forwarded-host') || getHeader(req, 'host');
  if (!host) return '';
  return `${proto}://${host}`;
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as ReportPostPayload;

    const postId = payload?.postId;
    if (postId === undefined || postId === null || postId === '') {
      return Response.json({ ok: false, error: 'postId is required' }, { status: 400 });
    }

    const baseUrl = getBaseUrl(req);
    const postUrl = payload.postUrl || (baseUrl ? `${baseUrl}/posts/${postId}` : `/posts/${postId}`);

    const subject = `Post (${postUrl}) reported! Needs immediate attention!`;

    const lines: string[] = [];
    lines.push('A post was reported from Buronet.');
    lines.push('');
    lines.push(`Post ID: ${postId}`);
    lines.push(`Post Link: ${postUrl}`);
    if (payload.reporter?.id || payload.reporter?.email || payload.reporter?.username) {
      lines.push('');
      lines.push('Reporter:');
      if (payload.reporter.id) lines.push(`- id: ${payload.reporter.id}`);
      if (payload.reporter.username) lines.push(`- username: ${payload.reporter.username}`);
      if (payload.reporter.email) lines.push(`- email: ${payload.reporter.email}`);
    }
    lines.push('');
    lines.push('User message:');
    lines.push(payload.message?.trim() ? payload.message.trim() : '(no message provided)');

    const text = lines.join('\n');

    const mailTo = process.env.REPORT_MAIL_TO || 'moderation@example.com';
    const mailFrom = process.env.REPORT_MAIL_FROM || 'buronet-reports@example.com';

    const hasSmtpConfig = Boolean(
      process.env.REPORT_SMTP_HOST &&
        process.env.REPORT_SMTP_PORT &&
        process.env.REPORT_SMTP_USER &&
        process.env.REPORT_SMTP_PASS
    );

    let transporter: nodemailer.Transporter;

    if (hasSmtpConfig) {
      transporter = nodemailer.createTransport({
        host: process.env.REPORT_SMTP_HOST,
        port: Number(process.env.REPORT_SMTP_PORT),
        secure: process.env.REPORT_SMTP_SECURE === 'true',
        auth: {
          user: process.env.REPORT_SMTP_USER,
          pass: process.env.REPORT_SMTP_PASS,
        },
      });
    } else {
      // Safe defaults for local/dev: create an Ethereal test account.
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const info = await transporter.sendMail({
      from: mailFrom,
      to: mailTo,
      subject,
      text,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;

    return Response.json({ ok: true, previewUrl }, { status: 200 });
  } catch (error: any) {
    console.error('Report post email failed:', error);
    return Response.json(
      { ok: false, error: error?.message || 'Failed to send report email' },
      { status: 500 }
    );
  }
}
