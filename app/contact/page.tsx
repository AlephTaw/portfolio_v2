import type { Metadata } from "next";
import { ContactCard } from "../components/ContactCard";

export const metadata: Metadata = {
  title: "Contact - Steven Wilcox",
  description: "Send a private inquiry to Steven Wilcox.",
};

export default function ContactPage() {
  const publicEmail = process.env.CONTACT_PUBLIC_EMAIL?.trim();

  return (
    <ContactCard
      title="Contact"
      description={
        publicEmail
          ? `Use the form below or email ${publicEmail}. Messages from this page are delivered privately.`
          : "Use the form below to send a private inquiry."
      }
      submitLabel="Transmit"
    />
  );
}
