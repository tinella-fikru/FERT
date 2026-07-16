import { Resend } from 'resend'
import { formatEtb } from '~/shared/types'

let _resend: Resend | undefined

function resend(): Resend {
  if (!_resend) {
    _resend = new Resend(useRuntimeConfig().resendApiKey)
  }
  return _resend
}

const FROM = 'FERT Atelier <orders@fert.et>'

/** Shared shell — monochrome + gold, mobile-friendly table layout */
function shell(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:Georgia,serif;color:#0A0A0A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #E4E4E7;">
        <tr><td style="background:#0A0A0A;padding:28px;text-align:center;">
          <span style="color:#B98A2F;font-size:24px;letter-spacing:8px;font-weight:bold;">FERT</span>
        </td></tr>
        <tr><td style="padding:32px 28px;">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:normal;">${title}</h1>
          ${bodyHtml}
        </td></tr>
        <tr><td style="border-top:3px solid #0A0A0A;padding:20px 28px;text-align:center;">
          <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#3F3F46;">
            FERT — Bole, Addis Ababa · atelier@fert.et
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

const row = (label: string, value: string) =>
  `<tr>
    <td style="padding:8px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#3F3F46;">${label}</td>
    <td style="padding:8px 0;text-align:right;font-size:14px;">${value}</td>
  </tr>`

interface OrderEmailData {
  order: {
    order_number: string
    total_etb: number
    estimated_ready_date: string | null
    garments?: { name: string } | null
    tibeb_patterns?: { name: string } | null
  }
  customer: { email: string; full_name: string | null }
}

export async function sendOrderConfirmation({ order, customer }: OrderEmailData) {
  const body = `
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3F3F46;">
      ${customer.full_name ?? 'Dear customer'}, thank you. Your garment has been
      entered into the atelier's order book and weaving will begin shortly.
    </p>
    <table role="presentation" width="100%" style="border-top:1px solid #E4E4E7;">
      ${row('Order', order.order_number)}
      ${row('Garment', order.garments?.name ?? '—')}
      ${row('Tibeb', order.tibeb_patterns?.name ?? '—')}
      ${row('Total paid', formatEtb(Number(order.total_etb)))}
      ${row('Estimated ready', order.estimated_ready_date ?? 'To be confirmed')}
    </table>
    <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#3F3F46;">
      We will write again when your garment is ready for its final fitting.
    </p>`

  await resend().emails.send({
    from: FROM,
    to: customer.email,
    subject: `Order ${order.order_number} confirmed — FERT`,
    html: shell('Your order is confirmed', body),
  })
}

interface AppointmentEmailData {
  appointment: {
    full_name: string
    email: string
    preferred_date: string
    preferred_time: string
    purpose: string | null
  }
}

export async function sendAppointmentReceived({ appointment }: AppointmentEmailData) {
  const body = `
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3F3F46;">
      ${appointment.full_name}, we have received your appointment request and
      will confirm the exact time by email within one working day.
    </p>
    <table role="presentation" width="100%" style="border-top:1px solid #E4E4E7;">
      ${row('Date requested', appointment.preferred_date)}
      ${row('Time', appointment.preferred_time === 'morning' ? 'Morning (9:00–12:00)' : 'Afternoon (13:00–18:00)')}
      ${row('Purpose', appointment.purpose ?? 'Consultation')}
    </table>
    <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#3F3F46;">
      The atelier is in Bole, Addis Ababa. If you need to change the date,
      simply reply to this email.
    </p>`

  await resend().emails.send({
    from: FROM,
    to: appointment.email,
    subject: 'Appointment request received — FERT Atelier',
    html: shell('We look forward to seeing you', body),
  })
}
