import { useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "thanks" | "error";

export function SubscribeCard() {
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, hp }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const data = (await res.json()) as { ok?: boolean };
      setStatus(data.ok ? "thanks" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "thanks") {
    return (
      <aside className="subscribe-card subscribe-card--thanks">
        <p>Got it. I'll be in touch.</p>
      </aside>
    );
  }

  return (
    <aside className="subscribe-card">
      <h2>Want to try it?</h2>
      <p>
        Drop your email. If something is ready to test I'll send you a link.
        No newsletter, no drip campaign, no "we're sorry to see you go" email
        if you change your mind.
      </p>
      <form onSubmit={onSubmit} noValidate>
        <label className="visually-hidden" htmlFor="subscribe-email">
          Email
        </label>
        <input
          id="subscribe-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <input
          type="text"
          name="hp"
          tabIndex={-1}
          autoComplete="off"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          aria-hidden="true"
          className="hp"
        />
        <button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending..." : "Subscribe"}
        </button>
      </form>
      {status === "error" && (
        <p className="subscribe-card__error">
          Something broke on my end. Try again in a minute.
        </p>
      )}
    </aside>
  );
}
