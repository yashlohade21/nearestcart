"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/dashboard");
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-emerald-800">Dalla Deal Tracker</h1>
        <p className="text-lg text-gray-600 max-w-md">
          Track your agricultural deals, manage payments, and monitor profits — all in one place.
        </p>
        <Link
          href="/login"
          className="inline-block px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-lg"
        >
          Login to Dashboard
        </Link>
      </div>
    </div>
  );
}
