"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
  }, [
    jobs,
    search,
    matchFilter,
    statusFilter,
  ]);

  const totalJobs = jobs.length;

  const highMatches = jobs.filter(
    (job) => job.match_level === "high"
  ).length;

  const mediumMatches = jobs.filter(
    (job) => job.match_level === "medium"
  ).length;

  const appliedJobs = jobs.filter(
    (job) => job.status === "applied"
  ).length;

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

    // Save the application date only the first time
    // the job is changed to Applied.
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
        <p className="text-slate-600">
          Loading jobs...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-xl font-semibold text-red-700">
            Unable to load jobs
          </h1>

          <p className="mt-2 text-red-600">
            {error}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            AI Job Tracker
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Job Dashboard
          </h1>

          <p className="mt-2 text-slate-500">
            Track relevant jobs collected
            automatically from your LinkedIn alerts.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Jobs"
            value={totalJobs}
          />

          <StatCard
            label="High Matches"
            value={highMatches}
          />

          <StatCard
            label="Medium Matches"
            value={mediumMatches}
          />

          <StatCard
            label="Applied"
            value={appliedJobs}
          />
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <input
              type="text"
              placeholder="Search title, company or location..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500"
            />

            <select
              value={matchFilter}
              onChange={(event) =>
                setMatchFilter(event.target.value)
              }
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500"
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
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500"
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

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Recommended Jobs
            </h2>

            <span className="text-sm text-slate-500">
              {filteredJobs.length} jobs
            </span>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <p className="text-slate-500">
                No jobs match your current filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onStatusChange={
                    updateJobStatus
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
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
  const levelStyles =
    job.match_level === "high"
      ? "bg-emerald-100 text-emerald-700"
      : job.match_level === "medium"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-100 text-slate-600";

  const formattedAddedDate =
    new Date(job.created_at).toLocaleString();

  const formattedAppliedDate =
    job.applied_at
      ? new Date(
          job.applied_at
        ).toLocaleString()
      : null;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold text-slate-900">
              {job.title}
            </h3>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${levelStyles}`}
            >
              {job.match_level.toUpperCase()} ·{" "}
              {job.match_score}
            </span>
          </div>

          <p className="mt-2 font-medium text-slate-700">
            {job.company ??
              "Unknown company"}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {job.location ??
              "Location unavailable"}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {job.easy_apply && (
              <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                Easy Apply
              </span>
            )}

            {job.actively_recruiting && (
              <span className="rounded-md bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                Actively Recruiting
              </span>
            )}

            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {job.source}
            </span>
          </div>

          {job.filter_reason && (
            <p className="mt-4 max-w-3xl text-sm text-slate-500">
              {job.filter_reason}
            </p>
          )}

          <div className="mt-4 space-y-1">
            <p className="text-xs text-slate-400">
              Added: {formattedAddedDate}
            </p>

            {formattedAppliedDate && (
              <p className="text-xs font-medium text-emerald-600">
                Applied: {formattedAppliedDate}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 md:min-w-[150px]">
          <select
            value={job.status}
            onChange={(event) =>
              onStatusChange(
                job.id,
                event.target.value as JobStatus
              )
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
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
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            View Job
          </a>
        </div>
      </div>
    </article>
  );
}