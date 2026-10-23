"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button, Card, Field, PageHeader, inputCls } from "@/components/ui";

type Msg = { ok: boolean; text: string } | null;

export default function AccountPage() {
  const [currentEmail, setCurrentEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [emailMsg, setEmailMsg] = useState<Msg>(null);
  const [pwMsg, setPwMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setCurrentEmail(data.user?.email ?? "");
      setEmail(data.user?.email ?? "");
    });
  }, []);

  async function changeEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ email });
    setEmailMsg(
      error
        ? { ok: false, text: error.message }
        : { ok: true, text: "Check your inbox (old and new email) and click the confirmation link to finish the change." },
    );
    setBusy(false);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return setPwMsg({ ok: false, text: "Password must be at least 6 characters." });
    if (password !== confirm) return setPwMsg({ ok: false, text: "Passwords do not match." });
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setPwMsg({ ok: false, text: error.message });
    else {
      setPwMsg({ ok: true, text: "Password updated. Use it next time you sign in." });
      setPassword("");
      setConfirm("");
    }
    setBusy(false);
  }

  const msg = (m: Msg) => m && <p className={`text-sm ${m.ok ? "text-green-700" : "text-red-600"}`}>{m.text}</p>;

  return (
    <>
      <PageHeader title="Account Settings" subtitle={`Signed in as ${currentEmail || "…"}`} />
      <div className="grid max-w-3xl gap-6 md:grid-cols-2">
        <Card className="p-5">
          <form onSubmit={changeEmail} className="space-y-4">
            <h2 className="font-semibold text-neutral-900">Change email (login name)</h2>
            <Field label="New email">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </Field>
            {msg(emailMsg)}
            <Button type="submit" disabled={busy || email === currentEmail}>
              Update email
            </Button>
          </form>
        </Card>
        <Card className="p-5">
          <form onSubmit={changePassword} className="space-y-4">
            <h2 className="font-semibold text-neutral-900">Change password</h2>
            <Field label="New password">
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Confirm new password">
              <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} />
            </Field>
            {msg(pwMsg)}
            <Button type="submit" disabled={busy}>
              Update password
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
