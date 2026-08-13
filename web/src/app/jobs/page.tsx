"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Job = {
  id: number;
  job_id: string;
  title: string;
  company: string | null;
  location: string | null;
  job_url: string;
  match_score: number;
  match_level: string;
  filter_reason: string | null;
  status: string;
  created_at: string;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadJobs() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("jobs")
        .select(
          "id, job_id, title, company, location, job_url, match_score, match_level, filter_reason, status, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setJobs(data ?? []);
      }

      setLoading(false);
    }

    loadJobs();
  }, []);

  if (loading) {
    return <main className="p-8">Loading jobs...</main>;
  }

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">Supabase connection error</h1>
        <p className="mt-4 text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">AI Job Tracker</h1>

      <p className="mt-2">
        Jobs loaded from Supabase: <strong>{jobs.length}</strong>
      </p>

      <div className="mt-8 space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="rounded-lg border p-4">
            <h2 className="text-xl font-semibold">{job.title}</h2>

            <p>{job.company ?? "Unknown company"}</p>
            <p>{job.location ?? "Location unavailable"}</p>

            <p className="mt-2">
              Match: {job.match_score} — {job.match_level}
            </p>

            <p>Status: {job.status}</p>
          </div>
        ))}
      </div>
    </main>
  );
}