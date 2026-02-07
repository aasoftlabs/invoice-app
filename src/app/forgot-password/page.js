"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return;

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        // Start a default 60s cooldown on success to prevent immediate retry
        setCooldown(60);
      } else {
        if (res.status === 429 && data.remainingTime) {
          setCooldown(data.remainingTime);
          setError(`Please wait ${data.remainingTime} seconds.`);
        } else {
          setError(data.message || "Something went wrong");
        }
      }
    } catch (err) {
      setError("Failed to send request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-96 p-6">
        <div className="flex items-center justify-center mb-6 gap-2">
          <Logo />
        </div>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Forgot Password</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your email to reset your password
          </p>
        </div>
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            {message ? <p className="text-green-600 text-sm text-center">{message}</p> : null}
            {error ? <p className="text-red-500 text-sm text-center">{error}</p> : null}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || cooldown > 0}
            >
              {loading
                ? "Sending..."
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Send Reset Link"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="text-blue-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
