
"use client";

import { useState, type FormEvent } from "react";
import styles from "@/app/blog/blog.module.css";

type SubscriptionResponse = {
  success?: boolean;
  message?: string;
};

export default function BlogNewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result =
        (await response.json()) as SubscriptionResponse;

      if (!response.ok || !result.success) {
        setMessage(
          result.message ||
            "We couldn't complete your subscription."
        );
        return;
      }

      setMessage(result.message || "You're subscribed!");
      setEmail("");
    } catch {
      setMessage(
        "Unable to connect. Please check your connection and retry."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form
        className={styles.newsletterForm}
        onSubmit={handleSubmit}
      >
        <input
          className={styles.newsletterInput}
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email address"
          aria-label="Email address"
          autoComplete="email"
          maxLength={254}
          required
          disabled={isSubmitting}
        />

        <button
          className={styles.newsletterButton}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      {message && (
        <p
          className={styles.newsletterNote}
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </>
  );
}
