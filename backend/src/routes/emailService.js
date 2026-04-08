import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// rejection email
export async function sendRejectionEmail({ to, fullName, title, comment }) {
    const fromEmail = process.env.SMTP_USER;
    const fromName  = "Veiklų registravimo sistema";
    const subject = `Jūsų veikla buvo atmesta: ${title}`;
    const text = `
Sveiki, ${fullName || ""}

Jūsų veikla "${title}" buvo atmesta.

Priežastis:
${comment}

Jei manote, kad tai klaida, susisiekite su vadybininke.
`;

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text,
  });
};

// return email
export async function sendReturnEmail({ to, fullName, title, comment }) {
    const fromEmail = process.env.SMTP_USER;
    const fromName  = "Veiklų registravimo sistema";
    const subject = `Jūsų veikla buvo grąžinta tikslinimui: ${title}`;
    const text = `
Sveiki, ${fullName || ""}

Jūsų veikla "${title}" buvo grąžinta tikslinimui.

Vadybininkės komentaras:
${comment}

Jei manote, kad tai klaida, susisiekite su vadybininke.
`;

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text,
  });
}
