import { NextResponse } from "next/server";

const SUBJECT_PREFIX = "swilcox.dev contact inquiry";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  organization?: unknown;
  subject?: unknown;
  message?: unknown;
  companyWebsite?: unknown;
};

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeSubject(subject: string) {
  const clean = subject || SUBJECT_PREFIX;
  return clean.toLowerCase().startsWith(SUBJECT_PREFIX.toLowerCase())
    ? clean
    : `${SUBJECT_PREFIX} | ${clean}`;
}

async function sendWithResend({
  apiKey,
  to,
  from,
  replyTo,
  subject,
  text,
}: {
  apiKey: string;
  to: string;
  from: string;
  replyTo: string;
  subject: string;
  text: string;
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: replyTo,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend error: ${response.status} ${errorText}`);
  }
}

export async function POST(request: Request) {
  let body: ContactPayload;

  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const honeypot = readString(body.companyWebsite);
  if (honeypot) {
    return NextResponse.json({ message: "Message sent." });
  }

  const name = readString(body.name);
  const email = readString(body.email);
  const organization = readString(body.organization);
  const subject = normalizeSubject(readString(body.subject));
  const message = readString(body.message);

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "Name, email, subject, and message are required." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 },
    );
  }

  if (
    name.length > 120 ||
    email.length > 320 ||
    organization.length > 160 ||
    subject.length > 200 ||
    message.length > 5000
  ) {
    return NextResponse.json(
      { error: "One or more fields exceed the allowed length." },
      { status: 400 },
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const contactDestinationEmail =
    process.env.CONTACT_DESTINATION_EMAIL ?? process.env.CONTACT_TO_EMAIL;
  const contactFromEmail = process.env.CONTACT_FROM_EMAIL;

  if (!resendApiKey || !contactDestinationEmail || !contactFromEmail) {
    return NextResponse.json(
      {
        error:
          "Contact delivery is not configured yet. Add RESEND_API_KEY, CONTACT_DESTINATION_EMAIL, and CONTACT_FROM_EMAIL to enable it.",
      },
      { status: 503 },
    );
  }

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Organization: ${organization || "Not provided"}`,
    "",
    message,
  ].join("\n");

  try {
    await sendWithResend({
      apiKey: resendApiKey,
      to: contactDestinationEmail,
      from: contactFromEmail,
      replyTo: email,
      subject,
      text,
    });
  } catch (error) {
    console.error("Contact form delivery failed", error);
    return NextResponse.json(
      { error: "The message could not be delivered right now." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    message: "Message sent. Thanks for reaching out.",
  });
}
