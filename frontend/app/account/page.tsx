"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserProfile = {
  id: string;
  username: string;
  email: string;
  status: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.8-4 3.4-6 8-6s7.2 2 8 6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M3 12h4l2-7 4 14 2-7h6" />
    </svg>
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function StatusBadge({
  children,
  positive = false,
}: {
  children: React.ReactNode;
  positive?: boolean;
}) {
  return (
    <span
      className={
        positive
          ? "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
          : "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold"
      }
      style={{
        color: positive
          ? "var(--max-success)"
          : "var(--max-text-secondary)",
        borderColor: positive
          ? "color-mix(in srgb, var(--max-success) 30%, transparent)"
          : "var(--max-border)",
        background: positive
          ? "color-mix(in srgb, var(--max-success) 9%, transparent)"
          : "var(--max-surface-muted)",
      }}
    >
      {positive && <CheckIcon />}
      {children}
    </span>
  );
}

export default function AccountPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/users/me", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Unable to load your profile"
          );
        }

        if (!cancelled) {
          setProfile(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your profile"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = profile?.username || "Administrator";

  return (
    <main
      className="min-h-screen px-6 py-8 lg:px-10"
      style={{
        background: "var(--max-bg)",
        color: "var(--max-text)",
      }}
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm">
            <button
              onClick={() => router.push("/")}
              className="transition-opacity hover:opacity-70"
              style={{ color: "var(--max-text-muted)" }}
            >
              Home
            </button>

            <span style={{ color: "var(--max-text-muted)" }}>
              /
            </span>

            <span style={{ color: "var(--max-text-secondary)" }}>
              Account
            </span>
          </div>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1
                className="text-3xl font-semibold tracking-tight"
                style={{ color: "var(--max-text)" }}
              >
                {loading ? "My Profile" : displayName}
              </h1>

              <p
                className="mt-2 text-sm"
                style={{ color: "var(--max-text-secondary)" }}
              >
                Account & Administration
              </p>
            </div>

            {profile && (
              <StatusBadge positive>
                {profile.status === "ACTIVE"
                  ? "Account Active"
                  : profile.status}
              </StatusBadge>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div
            className="rounded-2xl border p-8"
            style={{
              background: "var(--max-surface)",
              borderColor: "var(--max-border)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
                style={{
                  borderColor: "var(--max-border)",
                  borderTopColor: "var(--max-accent)",
                }}
              />

              <span
                className="text-sm"
                style={{
                  color: "var(--max-text-secondary)",
                }}
              >
                Loading your account information...
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            className="rounded-2xl border p-6"
            style={{
              background:
                "color-mix(in srgb, var(--max-danger) 7%, var(--max-surface))",
              borderColor:
                "color-mix(in srgb, var(--max-danger) 30%, var(--max-border))",
            }}
          >
            <h2
              className="font-semibold"
              style={{ color: "var(--max-danger)" }}
            >
              Unable to load profile
            </h2>

            <p
              className="mt-2 text-sm"
              style={{ color: "var(--max-text-secondary)" }}
            >
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg px-4 py-2 text-sm font-medium"
              style={{
                background: "var(--max-accent)",
                color: "white",
              }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Profile */}
        {!loading && !error && profile && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main profile */}
            <section
              className="rounded-2xl border lg:col-span-2"
              style={{
                background: "var(--max-surface)",
                borderColor: "var(--max-border)",
              }}
            >
              <div
                className="border-b px-6 py-5"
                style={{
                  borderColor: "var(--max-border)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      background:
                        "color-mix(in srgb, var(--max-accent) 12%, transparent)",
                      color: "var(--max-accent)",
                    }}
                  >
                    <UserIcon />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      My Profile
                    </h2>

                    <p
                      className="mt-0.5 text-xs"
                      style={{
                        color: "var(--max-text-muted)",
                      }}
                    >
                      Personal account information
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-x-8 gap-y-6 p-6 md:grid-cols-2">
                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{
                      color: "var(--max-text-muted)",
                    }}
                  >
                    Username
                  </p>

                  <p className="mt-2 font-medium">
                    {profile.username}
                  </p>
                </div>

                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{
                      color: "var(--max-text-muted)",
                    }}
                  >
                    Email
                  </p>

                  <p className="mt-2 font-medium">
                    {profile.email}
                  </p>
                </div>

                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{
                      color: "var(--max-text-muted)",
                    }}
                  >
                    Account Type
                  </p>

                  <p className="mt-2 font-medium">
                    Administrator
                  </p>
                </div>

                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{
                      color: "var(--max-text-muted)",
                    }}
                  >
                    Authentication
                  </p>

                  <p className="mt-2 font-medium">
                    MAX ERP Identity
                  </p>
                </div>

                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{
                      color: "var(--max-text-muted)",
                    }}
                  >
                    Account Created
                  </p>

                  <p className="mt-2 text-sm font-medium">
                    {formatDate(profile.createdAt)}
                  </p>
                </div>

                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{
                      color: "var(--max-text-muted)",
                    }}
                  >
                    Last Updated
                  </p>

                  <p className="mt-2 text-sm font-medium">
                    {formatDate(profile.updatedAt)}
                  </p>
                </div>
              </div>
            </section>

            {/* Account status */}
            <section
              className="rounded-2xl border"
              style={{
                background: "var(--max-surface)",
                borderColor: "var(--max-border)",
              }}
            >
              <div
                className="border-b px-6 py-5"
                style={{
                  borderColor: "var(--max-border)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      background:
                        "color-mix(in srgb, var(--max-success) 10%, transparent)",
                      color: "var(--max-success)",
                    }}
                  >
                    <ShieldIcon />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      Account Status
                    </h2>

                    <p
                      className="mt-0.5 text-xs"
                      style={{
                        color: "var(--max-text-muted)",
                      }}
                    >
                      Security state
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <div className="flex items-center justify-between gap-4">
                  <span
                    className="text-sm"
                    style={{
                      color: "var(--max-text-secondary)",
                    }}
                  >
                    Account
                  </span>

                  <StatusBadge
                    positive={profile.status === "ACTIVE"}
                  >
                    {profile.status}
                  </StatusBadge>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span
                    className="text-sm"
                    style={{
                      color: "var(--max-text-secondary)",
                    }}
                  >
                    Email
                  </span>

                  {profile.emailVerified ? (
                    <StatusBadge positive>
                      Verified
                    </StatusBadge>
                  ) : (
                    <StatusBadge>
                      Not verified
                    </StatusBadge>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span
                    className="text-sm"
                    style={{
                      color: "var(--max-text-secondary)",
                    }}
                  >
                    MFA
                  </span>

                  {profile.mfaEnabled ? (
                    <StatusBadge positive>
                      Enabled
                    </StatusBadge>
                  ) : (
                    <StatusBadge>
                      Not enabled
                    </StatusBadge>
                  )}
                </div>

                <div
                  className="border-t pt-5"
                  style={{
                    borderColor: "var(--max-border)",
                  }}
                >
                  <p
                    className="text-xs leading-5"
                    style={{
                      color: "var(--max-text-muted)",
                    }}
                  >
                    Your account information is provided
                    directly by MAX ERP Identity Service.
                  </p>
                </div>
              </div>
            </section>

            {/* Security */}
            <section
              className="rounded-2xl border"
              style={{
                background: "var(--max-surface)",
                borderColor: "var(--max-border)",
              }}
            >
              <div
                className="border-b px-6 py-5"
                style={{
                  borderColor: "var(--max-border)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      background:
                        "color-mix(in srgb, var(--max-accent) 12%, transparent)",
                      color: "var(--max-accent)",
                    }}
                  >
                    <LockIcon />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      Security
                    </h2>

                    <p
                      className="mt-0.5 text-xs"
                      style={{
                        color: "var(--max-text-muted)",
                      }}
                    >
                      Authentication controls
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6">
                <div
                  className="flex items-center justify-between rounded-xl border p-4"
                  style={{
                    borderColor: "var(--max-border)",
                    background: "var(--max-surface-muted)",
                  }}
                >
                  <div>
                    <p className="text-sm font-medium">
                      Password
                    </p>

                    <p
                      className="mt-1 text-xs"
                      style={{
                        color: "var(--max-text-muted)",
                      }}
                    >
                      Managed by MAX ERP Identity
                    </p>
                  </div>

                  <span
                    className="text-xs font-medium"
                    style={{
                      color: "var(--max-success)",
                    }}
                  >
                    Protected
                  </span>
                </div>

                <div
                  className="flex items-center justify-between rounded-xl border p-4"
                  style={{
                    borderColor: "var(--max-border)",
                    background: "var(--max-surface-muted)",
                  }}
                >
                  <div>
                    <p className="text-sm font-medium">
                      Multi-factor authentication
                    </p>

                    <p
                      className="mt-1 text-xs"
                      style={{
                        color: "var(--max-text-muted)",
                      }}
                    >
                      Additional account protection
                    </p>
                  </div>

                  <span
                    className="text-xs font-medium"
                    style={{
                      color: profile.mfaEnabled
                        ? "var(--max-success)"
                        : "var(--max-text-muted)",
                    }}
                  >
                    {profile.mfaEnabled
                      ? "Enabled"
                      : "Not enabled"}
                  </span>
                </div>
              </div>
            </section>

            {/* Active sessions */}
            <section
              className="rounded-2xl border"
              style={{
                background: "var(--max-surface)",
                borderColor: "var(--max-border)",
              }}
            >
              <div
                className="border-b px-6 py-5"
                style={{
                  borderColor: "var(--max-border)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      background:
                        "color-mix(in srgb, var(--max-accent) 12%, transparent)",
                      color: "var(--max-accent)",
                    }}
                  >
                    <ActivityIcon />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      Active Sessions
                    </h2>

                    <p
                      className="mt-0.5 text-xs"
                      style={{
                        color: "var(--max-text-muted)",
                      }}
                    >
                      Current authentication session
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: "var(--max-border)",
                    background: "var(--max-surface-muted)",
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">
                        Current session
                      </p>

                      <p
                        className="mt-1 text-xs"
                        style={{
                          color: "var(--max-text-muted)",
                        }}
                      >
                        MAX ERP Web Application
                      </p>
                    </div>

                    <StatusBadge positive>
                      Active
                    </StatusBadge>
                  </div>

                  <div
                    className="mt-4 text-xs"
                    style={{
                      color: "var(--max-text-secondary)",
                    }}
                  >
                    Authentication is managed through
                    MAX ERP Identity Service.
                  </div>
                </div>
              </div>
            </section>

            {/* Sign out */}
            <section
              className="rounded-2xl border"
              style={{
                background: "var(--max-surface)",
                borderColor: "var(--max-border)",
              }}
            >
              <div className="p-6">
                <h2 className="font-semibold">
                  Sign out
                </h2>

                <p
                  className="mt-2 text-sm leading-6"
                  style={{
                    color: "var(--max-text-secondary)",
                  }}
                >
                  End your current MAX ERP session on this
                  device.
                </p>

                <button
                  onClick={() => router.push("/")}
                  className="mt-5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
                  style={{
                    borderColor: "var(--max-border)",
                    color: "var(--max-text)",
                    background: "var(--max-surface-muted)",
                  }}
                >
                  Return to dashboard
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Footer */}
        <div
          className="mt-8 border-t pt-5 text-xs"
          style={{
            borderColor: "var(--max-border)",
            color: "var(--max-text-muted)",
          }}
        >
          MAX ERP Identity • Account & Administration
        </div>
      </div>
    </main>
  );
}
