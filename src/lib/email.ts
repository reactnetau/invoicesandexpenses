import { getAppUrl } from '@/lib/app-url'

const FROM = `Invoice Tracker <${process.env.GMAIL_USER}>`

interface Attachment {
  filename: string
  contentType: string
  data: Buffer
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  replyTo?: string
  attachments?: Attachment[]
}

interface InvoiceEmailInput {
  to: string
  clientName: string
  amount: number
  dueDate: Date
  publicId: string
  pdfBuffer: Buffer
}

function base64UrlEncode(value: string) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function encodeBase64(value: string | Buffer) {
  return Buffer.from(value).toString('base64')
}

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID ?? '',
      client_secret: process.env.GMAIL_CLIENT_SECRET ?? '',
      refresh_token: process.env.GMAIL_REFRESH_TOKEN ?? '',
      grant_type: 'refresh_token',
    }),
    signal: AbortSignal.timeout(8000),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(`OAuth error: ${JSON.stringify(data)}`)
  return data.access_token
}

function buildRawEmail({ to, subject, html, replyTo, attachments = [] }: SendEmailOptions): string {
  if (attachments.length === 0) {
    const message = [
      `From: ${FROM}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      ...(replyTo ? [`Reply-To: ${replyTo}`] : []),
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      'Content-Transfer-Encoding: base64',
      '',
      encodeBase64(html),
    ].join('\r\n')

    return base64UrlEncode(message)
  }

  const boundary = `invoice-tracker-${Date.now()}`
  const parts: string[] = [
    `From: ${FROM}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    ...(replyTo ? [`Reply-To: ${replyTo}`] : []),
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    encodeBase64(html),
  ]

  for (const attachment of attachments) {
    parts.push(
      `--${boundary}`,
      `Content-Type: ${attachment.contentType}; name="${attachment.filename}"`,
      `Content-Disposition: attachment; filename="${attachment.filename}"`,
      'Content-Transfer-Encoding: base64',
      '',
      encodeBase64(attachment.data)
    )
  }

  parts.push(`--${boundary}--`)

  return base64UrlEncode(parts.join('\r\n'))
}

async function sendEmail(options: SendEmailOptions): Promise<void> {
  const accessToken = await getAccessToken()
  const raw = buildRawEmail(options)

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(`Gmail API error: ${JSON.stringify(data)}`)
  }
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function formatDueDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const from = `Invoice Tracker <${process.env.GMAIL_FROM ?? process.env.GMAIL_USER}>`
  const html = `
    <p>Hi,</p>
    <p>We received a request to reset your Invoice Tracker password.</p>
    <p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background-color:#2563eb;color:#ffffff;font-weight:bold;text-decoration:none;border-radius:8px;">
        Reset password
      </a>
    </p>
    <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
  `
  const accessToken = await getAccessToken()
  const boundary = `boundary_${Date.now()}`
  const parts = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: Reset your Invoice Tracker password`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(html, 'utf-8').toString('base64'),
    '',
    `--${boundary}--`,
  ].join('\r\n')

  const raw = Buffer.from(parts).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(`Gmail API error: ${JSON.stringify(data)}`)
  }
}

export async function sendInvoiceEmail(input: InvoiceEmailInput): Promise<void> {
  const invoiceUrl = `${getAppUrl()}/invoice/${input.publicId}`

  await sendEmail({
    to: input.to,
    subject: `Your invoice from Invoice Tracker - ${formatAmount(input.amount)}`,
    html: `
      <p>Hi ${input.clientName},</p>
      <p>Your invoice is ready. A PDF copy is attached for your records.</p>
      <p><strong>Amount due:</strong> ${formatAmount(input.amount)}</p>
      <p><strong>Due date:</strong> ${formatDueDate(input.dueDate)}</p>
      <p>
        <a href="${invoiceUrl}" style="display:inline-block;padding:12px 20px;background-color:#2563eb;color:#ffffff;font-weight:bold;text-decoration:none;border-radius:8px;">
          View invoice online
        </a>
      </p>
      <p>If you have any questions, just reply to this email.</p>
    `,
    attachments: [
      {
        filename: `invoice-${input.publicId}.pdf`,
        contentType: 'application/pdf',
        data: input.pdfBuffer,
      },
    ],
  })
}
