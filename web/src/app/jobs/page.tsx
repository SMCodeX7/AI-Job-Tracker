"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SignOutButton } from "@/components/auth/sign-out-button";

type JobStatus = "new" | "saved" | "applied" | "rejected";

type Job = {
  id: number;
  job_id: string;
  title: string;
  company: string | null;
  location: string | null;
  job_url: string;
  source: string;
  easy_apply: boolean;
  actively_recruiting: boolean;
  match_score: number;
  match_level: string;
  filter_reason: string | null;
  status: JobStatus;
  applied_at: string | null;
  created_at: string;
};

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [matchFilter, setMatchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadJobs() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("jobs")
        .select(
          `
          id,
          job_id,
          title,
          company,
          location,
          job_url,
          source,
          easy_apply,
          actively_recruiting,
          match_score,
          match_level,
          filter_reason,
          status,
          applied_at,
          created_at
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setJobs((data ?? []) as Job[]);
      }

      setLoading(false);
    }

    loadJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        job.title.toLowerCase().includes(searchText) ||
        job.company?.toLowerCase().includes(searchText) ||
        job.location?.toLowerCase().includes(searchText);

      const matchesLevel =
        matchFilter === "all" ||
        job.match_level === matchFilter;

      const matchesStatus =
        statusFilter === "all" ||
        job.status === statusFilter;

      return (
        matchesSearch &&
        matchesLevel &&
        matchesStatus
      );
    });
  }, [jobs, search, matchFilter, statusFilter]);

  const totalJobs = jobs.length;

  const highMatches = jobs.filter(
    (job) => job.match_level === "high"
  ).length;

  const mediumMatches = jobs.filter(
    (job) => job.match_level === "medium"
  ).length;

  const unscoredJobs = jobs.filter(
    (job) => job.match_level === "unscored"
  ).length;

  const newJobs = jobs.filter(
    (job) => job.status === "new"
  ).length;

  const savedJobs = jobs.filter(
    (job) => job.status === "saved"
  ).length;

  const appliedJobs = jobs.filter(
    (job) => job.status === "applied"
  ).length;

  const rejectedJobs = jobs.filter(
    (job) => job.status === "rejected"
  ).length;

  const filtersActive =
    search !== "" ||
    matchFilter !== "all" ||
    statusFilter !== "all";

  function resetFilters() {
    setSearch("");
    setMatchFilter("all");
    setStatusFilter("all");
  }

  async function updateJobStatus(
    jobId: number,
    newStatus: JobStatus
  ) {
    const currentJob = jobs.find(
      (job) => job.id === jobId
    );

    if (!currentJob) {
      return;
    }

    const supabase = createClient();

    let appliedAt = currentJob.applied_at;

    const updateData: {
      status: JobStatus;
      applied_at?: string;
    } = {
      status: newStatus,
    };

    if (
      newStatus === "applied" &&
      !currentJob.applied_at
    ) {
      appliedAt = new Date().toISOString();
      updateData.applied_at = appliedAt;
    }

    const { error } = await supabase
      .from("jobs")
      .update(updateData)
      .eq("id", jobId);

    if (error) {
      alert(
        `Unable to update status: ${error.message}`
      );
      return;
    }

    setJobs((currentJobs) =>
      currentJobs.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: newStatus,
              applied_at: appliedAt,
            }
          : job
      )
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading your jobs...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-7 shadow-sm">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
            !
          </div>

          <h1 className="text-xl font-bold text-slate-900">
            Unable to load jobs
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-sm">
                AI
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  AI Job Tracker
                </h1>

                <p className="text-sm text-slate-500">
                  Automated LinkedIn job discovery
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Automation Active
            </div>

            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6">
        {/* Intro */}
        <section className="mb-8">
          <p className="text-sm font-semibold text-blue-600">
            Dashboard
          </p>

          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Job opportunities
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Review jobs collected from LinkedIn alerts,
            track their relevance and manage your
            application progress.
          </p>
        </section>

        {/* Match overview */}
        <section>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">
              Match Overview
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Jobs identified by the relevance scoring
              workflow.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Jobs"
              value={totalJobs}
              description="All opportunities"
              variant="blue"
            />

            <StatCard
              label="High Matches"
              value={highMatches}
              description="Best opportunities"
              variant="green"
            />

            <StatCard
              label="Medium Matches"
              value={mediumMatches}
              description="Relevant opportunities"
              variant="amber"
            />

            <StatCard
              label="Unscored"
              value={unscoredJobs}
              description="Legacy jobs"
              variant="slate"
            />
          </div>
        </section>

        {/* Application tracking */}
        <section className="mt-9">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">
              Application Tracking
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Track your progress across saved and
              submitted applications.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <TrackingCard
              label="New"
              value={newJobs}
              description="Not reviewed yet"
              variant="blue"
            />

            <TrackingCard
              label="Saved"
              value={savedJobs}
              description="Consider applying"
              variant="amber"
            />

            <TrackingCard
              label="Applied"
              value={appliedJobs}
              description="Applications sent"
              variant="green"
            />

            <TrackingCard
              label="Rejected"
              value={rejectedJobs}
              description="Not successful"
              variant="red"
            />
          </div>
        </section>

        {/* Search and filters */}
        <section className="mt-9 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-semibold text-slate-900">
                Find Jobs
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Search and filter your collected
                opportunities.
              </p>
            </div>

            {filtersActive && (
              <button
                type="button"
                onClick={resetFilters}
                className="self-start text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Reset filters
              </button>
            )}
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search title, company or location..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={matchFilter}
              onChange={(event) =>
                setMatchFilter(event.target.value)
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">
                All match levels
              </option>

              <option value="high">
                High matches
              </option>

              <option value="medium">
                Medium matches
              </option>

              <option value="unscored">
                Unscored
              </option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">
                All statuses
              </option>

              <option value="new">
                New
              </option>

              <option value="saved">
                Saved
              </option>

              <option value="applied">
                Applied
              </option>

              <option value="rejected">
                Rejected
              </option>
            </select>
          </div>
        </section>

        {/* Jobs */}
        <section className="mt-8">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Recommended Jobs
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Medium and high relevance opportunities
                collected automatically.
              </p>
            </div>

            <div className="rounded-full bg-slate-200/70 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {filteredJobs.length}{" "}
              {filteredJobs.length === 1
                ? "job"
                : "jobs"}
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                ⌕
              </div>

              <h4 className="mt-4 font-semibold text-slate-900">
                No matching jobs
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                No opportunities match the current
                search or filters.
              </p>

              {filtersActive && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onStatusChange={updateJobStatus}
                />
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-200 py-6 text-center text-xs text-slate-400">
          AI Job Tracker · LinkedIn → Gmail → n8n →
          Supabase
        </footer>
      </div>
    </main>
  );
}

type StatVariant =
  | "blue"
  | "green"
  | "amber"
  | "slate"
  | "red";

function StatCard({
  label,
  value,
  description,
  variant,
}: {
  label: string;
  value: number;
  description: string;
  variant: StatVariant;
}) {
  const accentStyles: Record<
    StatVariant,
    string
  > = {
    blue: "bg-blue-500",
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    slate: "bg-slate-400",
    red: "bg-red-500",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`absolute left-0 top-0 h-full w-1 ${accentStyles[variant]}`}
      />

      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function TrackingCard({
  label,
  value,
  description,
  variant,
}: {
  label: string;
  value: number;
  description: string;
  variant: StatVariant;
}) {
  const badgeStyles: Record<
    StatVariant,
    string
  > = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-100 text-slate-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${badgeStyles[variant]}`}
        >
          {label}
        </span>

        <span className="text-2xl font-bold text-slate-900">
          {value}
        </span>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function JobCard({
  job,
  onStatusChange,
}: {
  job: Job;
  onStatusChange: (
    jobId: number,
    status: JobStatus
  ) => void;
}) {
  const matchStyles =
    job.match_level === "high"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : job.match_level === "medium"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-100 text-slate-600";

  const statusStyles: Record<
    JobStatus,
    string
  > = {
    new: "border-blue-200 bg-blue-50 text-blue-700",
    saved:
      "border-amber-200 bg-amber-50 text-amber-700",
    applied:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    rejected:
      "border-red-200 bg-red-50 text-red-700",
  };

  const formattedAddedDate =
    new Date(job.created_at).toLocaleString();

  const formattedAppliedDate =
    job.applied_at
      ? new Date(job.applied_at).toLocaleString()
      : null;

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1">
              <h4 className="text-lg font-bold leading-6 text-slate-900 sm:text-xl">
                {job.title}
              </h4>

              <p className="mt-2 font-semibold text-slate-700">
                {job.company ??
                  "Unknown company"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {job.location ??
                  "Location unavailable"}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${matchStyles}`}
            >
              {job.match_level === "unscored"
                ? "UNSCORED"
                : `${job.match_level.toUpperCase()} · ${job.match_score}`}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {job.easy_apply && (
              <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                Easy Apply
              </span>
            )}

            {job.actively_recruiting && (
              <span className="rounded-md bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                Actively Recruiting
              </span>
            )}

            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {job.source}
            </span>
          </div>

          {job.filter_reason && (
            <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Match reason
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                {job.filter_reason}
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-1 text-xs text-slate-400 sm:flex-row sm:gap-5">
            <span>
              Added: {formattedAddedDate}
            </span>

            {formattedAppliedDate && (
              <span className="font-semibold text-emerald-600">
                Applied: {formattedAppliedDate}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:w-44 lg:flex-col">
          <label className="text-xs font-semibold text-slate-500">
            Application status
          </label>

          <select
            value={job.status}
            onChange={(event) =>
              onStatusChange(
                job.id,
                event.target.value as JobStatus
              )
            }
            className={`w-full rounded-xl border px-3 py-2.5 text-sm font-semibold outline-none transition focus:ring-2 focus:ring-blue-100 ${statusStyles[job.status]}`}
          >
            <option value="new">
              New
            </option>

            <option value="saved">
              Saved
            </option>

            <option value="applied">
              Applied
            </option>

            <option value="rejected">
              Rejected
            </option>
          </select>

          <a
            href={job.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
          >
            View Job
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </article>
  );
}