# AI Job Tracker

An automated job tracking system that collects LinkedIn job alerts from Gmail, processes and scores job opportunities using n8n, stores relevant jobs in Supabase, and provides a secure Next.js dashboard for reviewing and tracking applications.

---

## Overview

AI Job Tracker automates the process of discovering, evaluating, and managing relevant job opportunities.

The system monitors LinkedIn job-alert emails, extracts individual job listings, calculates a relevance score based on predefined career preferences, filters unsuitable opportunities, prevents duplicate jobs, stores relevant results in Supabase, and displays them through a private authenticated dashboard.

The application is currently designed as a **single-user private job tracking dashboard**.

---

## System Workflow

```text
LinkedIn Job Alerts
        ↓
      Gmail
        ↓
  n8n Gmail Trigger
        ↓
 Get Email Content
        ↓
 Extract LinkedIn Jobs
        ↓
 Score Job Relevance
        ↓
 Keep Medium / High Matches
        ↓
 Remove Duplicate Jobs
        ↓
     Supabase
        ↓
 Supabase Authentication
        ↓
 Next.js Dashboard
        ↓
 Application Tracking
```

---

## Features

### Automated Job Collection

- Monitors LinkedIn job-alert emails automatically
- Gmail integration through n8n
- Extracts individual job listings from LinkedIn emails
- Extracts job title, company, location, and LinkedIn URL
- Detects Easy Apply opportunities
- Detects actively recruiting jobs

### Job Relevance Scoring

- Automatically scores job opportunities
- Supports High, Medium, and Low relevance levels
- Gives additional priority to internships
- Gives additional priority to entry-level positions
- Penalizes senior-level positions
- Uses LinkedIn alert context in scoring
- Filters out low-relevance jobs

### Duplicate Prevention

- Uses LinkedIn Job ID for duplicate detection
- Prevents previously processed jobs from being inserted again
- Supabase maintains a unique `job_id` constraint as an additional safeguard

### Job Dashboard

- Displays jobs stored in Supabase
- Search by job title
- Search by company
- Search by location
- Filter by match level
- Filter by application status
- View match score
- View match reason
- View Easy Apply status
- View actively recruiting status
- Open jobs directly on LinkedIn
- Responsive dashboard interface

### Application Tracking

Jobs can be tracked using the following statuses:

- New
- Saved
- Applied
- Rejected

When a job is changed to `Applied` for the first time, the application timestamp is automatically recorded.

### Dashboard Statistics

The dashboard displays:

- Total Jobs
- High Matches
- Medium Matches
- Unscored Jobs
- New Jobs
- Saved Jobs
- Applied Jobs
- Rejected Jobs

### Authentication and Security

- Private dashboard authentication using Supabase Auth
- Email/password sign-in
- Protected `/jobs` route
- Unauthenticated users are redirected to `/login`
- Sign-out functionality
- Supabase Row Level Security enabled
- Anonymous users cannot read job data
- Anonymous users cannot update job data
- Authenticated users can read jobs
- Authenticated users can update only application-related fields required by the dashboard

---

## Match Scoring

Jobs are scored according to their relevance to Data Science, Artificial Intelligence, Machine Learning, Analytics, and related entry-level career opportunities.

### High-Value Roles

Examples include:

- Data Science
- Data Scientist
- Machine Learning
- ML Engineer
- AI Engineer
- Artificial Intelligence
- AI/ML
- Data Analyst
- Data Analytics
- Business Intelligence
- BI Analyst
- Data Engineer

### Related Skills and Domains

The scoring workflow also considers terms such as:

- Python
- SQL
- Power BI
- Analytics
- Computer Vision
- NLP
- Deep Learning
- Predictive Analytics
- Research

### Internship Priority

Additional points are given to titles containing terms such as:

- Intern
- Internship
- Co-op
- Trainee

### Entry-Level Priority

Additional points are also given to:

- Junior
- Entry Level
- Entry-Level
- Graduate
- Associate

### Senior-Level Penalty

Senior roles receive a negative score adjustment.

Examples include:

- Senior
- Lead
- Principal
- Staff
- Manager
- Director
- Architect
- Head of

### Additional Scoring Factors

The workflow can also increase the score when:

- The LinkedIn email alert itself is related to Data Science, AI, ML, Analytics, Data Engineering, or Business Intelligence
- Easy Apply is available

### Match Levels

| Score | Match Level |
|------:|-------------|
| 75–100 | High |
| 50–74 | Medium |
| 0–49 | Low |

Only **Medium** and **High** matches continue to Supabase.

Legacy jobs inserted before relevance scoring was introduced are displayed as:

```text
Unscored
```

---

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Authentication

- Supabase Auth
- Email/password authentication

### Database

- Supabase
- PostgreSQL
- Row Level Security

### Automation

- n8n

### External Services

- Gmail
- LinkedIn Job Alerts

### Version Control

- Git
- GitHub

---

## Project Structure

```text
AI-Job-Tracker/
│
├── n8n/
│   └── linkedin-job-alert-pipeline.json
│
├── web/
│   ├── public/
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── jobs/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── components/
│   │   │   └── auth/
│   │   │       └── sign-out-button.tsx
│   │   │
│   │   └── lib/
│   │       └── supabase/
│   │           └── client.ts
│   │
│   ├── .env.local
│   ├── package.json
│   ├── package-lock.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── ...
│
├── .gitignore
├── LICENSE
└── README.md
```

> `.env.local` is excluded from GitHub and must never be committed.

---

## Application Routes

### Root

```text
/
```

The root route redirects users to:

```text
/jobs
```

### Login

```text
/login
```

Provides the Supabase email/password login form.

### Jobs Dashboard

```text
/jobs
```

Protected dashboard used to:

- View jobs
- Search jobs
- Filter jobs
- Update application statuses
- Track application dates

If no authenticated Supabase user is found, the user is redirected to:

```text
/login
```

---

## Database

The main Supabase table is:

```text
jobs
```

### Main Columns

| Column | Description |
|---|---|
| `id` | Internal database ID |
| `job_id` | Unique LinkedIn Job ID |
| `title` | Job title |
| `company` | Company name |
| `location` | Job location |
| `job_url` | LinkedIn job URL |
| `source` | Source of the job |
| `easy_apply` | Indicates Easy Apply availability |
| `actively_recruiting` | Indicates whether the company is actively recruiting |
| `email_subject` | LinkedIn alert email subject |
| `received_at` | Date the LinkedIn alert was received |
| `match_score` | Calculated relevance score |
| `match_level` | High, Medium, Low, or Unscored |
| `filter_reason` | Explanation of the relevance score |
| `status` | Application status |
| `applied_at` | Date the application was first marked Applied |
| `created_at` | Database creation timestamp |
| `updated_at` | Last update timestamp |

---

## Supabase SQL Setup

The Supabase database was configured through the following SQL stages:

```text
01_create_jobs_table
02_add_job_matching_columns
03_add_jobs_read_policy
04_add_job_status_tracking
05_mark_legacy_jobs_unscored
06_add_application_tracking
07_secure_authenticated_jobs_access
```

### 01_create_jobs_table

Creates the main:

```text
jobs
```

table and its initial fields.

### 02_add_job_matching_columns

Adds:

```text
match_score
match_level
filter_reason
```

for relevance scoring.

### 03_add_jobs_read_policy

Initially enabled browser-side reading during MVP development.

This public policy was later replaced by the authenticated security configuration in step `07`.

### 04_add_job_status_tracking

Adds application status validation and allows the dashboard to update job statuses.

Supported statuses are:

```text
new
saved
applied
rejected
```

### 05_mark_legacy_jobs_unscored

Marks jobs inserted before relevance scoring was enabled as:

```text
unscored
```

instead of incorrectly displaying them as Medium matches.

### 06_add_application_tracking

Adds:

```text
applied_at
```

for recording when an application is first marked as Applied.

### 07_secure_authenticated_jobs_access

Secures the `jobs` table for authenticated dashboard access.

This configuration:

- Keeps Row Level Security enabled
- Removes anonymous read access
- Removes anonymous update access
- Grants job read access to authenticated users
- Allows authenticated users to update `status`
- Allows authenticated users to update `applied_at`
- Replaces the earlier public RLS policies with authenticated-user policies

---

## Authentication

The application uses Supabase Authentication.

The current MVP uses:

```text
Email + Password
```

A user signs in through:

```text
/login
```

After successful authentication:

```text
/login
   ↓
Supabase Authentication
   ↓
/jobs
```

The jobs route checks the currently authenticated Supabase user before displaying the dashboard.

If authentication is missing:

```text
/jobs
   ↓
Authentication check
   ↓
No user
   ↓
/login
```

---

## Current Access Model

The project is currently operated as a:

```text
Single-user private dashboard
```

Only one Supabase user account is intended to be provisioned for the current MVP.

The database policies currently allow access based on the Supabase `authenticated` role.

Therefore, if additional Supabase users are created in the future, per-user ownership policies should also be introduced before treating the application as a multi-user system.

---

## Sign Out

The dashboard contains a:

```text
Sign Out
```

button.

The sign-out process is:

```text
Dashboard
   ↓
Sign Out
   ↓
Supabase session removed
   ↓
/login
```

After signing out, attempting to access `/jobs` again redirects the user to the login page.

---

## n8n Workflow

The automation workflow contains the following nodes:

```text
Gmail Trigger
      ↓
Get a message
      ↓
Extract LinkedIn Jobs
      ↓
Score Job Relevance
      ↓
Keep Medium & High Matches
      ↓
Skip Previously Seen Jobs
      ↓
Create a row
```

---

## Gmail Trigger

The workflow monitors Gmail for LinkedIn Job Alert emails from:

```text
jobalerts-noreply@linkedin.com
```

The Gmail Trigger starts the workflow when matching messages are detected.

---

## Get a Message

This node retrieves the complete LinkedIn Job Alert email so that its HTML content can be processed.

---

## Extract LinkedIn Jobs

The extraction node parses each LinkedIn job card and extracts:

- Job ID
- Job title
- Company
- Location
- Job URL
- Easy Apply availability
- Actively Recruiting indicator
- Email subject
- Received date

The node also removes accidental duplicates found within the same email.

---

## Score Job Relevance

Each extracted job is evaluated using rule-based relevance scoring.

The workflow considers:

- Role relevance
- Data/AI/ML terminology
- Internship level
- Entry level
- Seniority
- Related technical skills
- LinkedIn alert context
- Easy Apply availability

The resulting values include:

```text
match_score
match_level
filter_reason
```

---

## Keep Medium & High Matches

Only jobs where:

```text
match_score >= 50
```

continue through the workflow.

This prevents Low matches from being stored in the main job tracker.

---

## Duplicate Prevention

The node:

```text
Skip Previously Seen Jobs
```

uses:

```text
job_id
```

to prevent previously processed jobs from continuing to Supabase.

The database also applies a unique constraint to `job_id` as an additional safety layer.

---

## Supabase Insertion

The final n8n node:

```text
Create a row
```

stores relevant jobs in the Supabase:

```text
jobs
```

table.

---

## n8n Workflow Export

A sanitized version of the n8n workflow is stored in:

```text
n8n/linkedin-job-alert-pipeline.json
```

The public GitHub workflow does not contain:

- Gmail OAuth secrets
- Supabase secret keys
- Passwords
- Private pinned email execution data

Users importing the workflow must configure their own:

- Gmail OAuth credential
- Supabase credential

---

## Environment Variables

Create:

```text
web/.env.local
```

Add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

The frontend uses only the Supabase publishable key.

Do not place a Supabase backend secret or service-role key inside frontend environment variables.

---

## Sensitive Information

Never commit:

```text
.env
.env.local
Supabase secret keys
Supabase service-role keys
Google OAuth client secrets
Database passwords
API secrets
Authentication passwords
```

---

## Local Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
```

Move into the project:

```bash
cd AI-Job-Tracker
```

---

### 2. Install Frontend Dependencies

```bash
cd web
npm install
```

---

### 3. Configure Environment Variables

Create:

```text
web/.env.local
```

Add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

---

### 4. Configure Supabase

Create the required `jobs` table and database policies using the SQL setup described above.

Also create the Supabase user account that will access the private dashboard.

---

### 5. Start the Next.js Application

Inside:

```text
web/
```

run:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The root route redirects to:

```text
http://localhost:3000/jobs
```

If you are not logged in, the application redirects to:

```text
http://localhost:3000/login
```

---

## Running n8n Locally

Start n8n:

```bash
npx n8n
```

Open:

```text
http://localhost:5678
```

Import:

```text
n8n/linkedin-job-alert-pipeline.json
```

Configure your own:

- Gmail OAuth credential
- Supabase credential

Then publish the workflow.

---

## Local Automation Limitation

The current n8n workflow runs locally.

Therefore:

```text
Computer ON
+
n8n running
        ↓
LinkedIn alerts continue to be processed
```

If the computer is turned off or the n8n process is stopped:

```text
n8n stops
        ↓
New emails are not automatically processed
```

Existing jobs already stored in Supabase remain available through the dashboard.

Cloud-hosting n8n is planned as a future improvement.

---

## Production Checks

Before deployment, run:

```bash
npm run lint
```

Then:

```bash
npm run build
```

The application should successfully build the following routes:

```text
/
/jobs
/login
```

---

## Dashboard

The dashboard allows the authenticated user to:

- View automatically collected jobs
- Search job opportunities
- Filter by match level
- Filter by application status
- View relevance scores
- View scoring explanations
- View Easy Apply information
- View actively recruiting information
- Open LinkedIn job listings
- Save interesting jobs
- Mark jobs as Applied
- Mark jobs as Rejected
- Track application dates
- View application statistics
- Sign out securely

---

## Application Status Workflow

The dashboard supports:

```text
New
 ↓
Saved
 ↓
Applied
 ↓
Rejected
```

The user does not need to follow this exact order.

For example:

```text
New → Applied
```

is also supported.

When a job is changed to:

```text
Applied
```

for the first time, the current timestamp is stored in:

```text
applied_at
```

Changing the job to another status later does not remove the original application date.

---

## Security

Sensitive credentials are excluded from source control.

### Browser Application

The frontend uses:

```text
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

This key is intended for browser-side Supabase access and relies on Row Level Security for data protection.

### Anonymous Access

```text
anon
  ↓
No job read access
  ↓
No job update access
```

### Authenticated Access

```text
authenticated
      ↓
Read jobs
      ↓
Update status
      ↓
Update applied_at
```

### Route Protection

```text
/jobs
  ↓
Check Supabase user
  ↓
Authenticated?
  ├── Yes → Dashboard
  └── No  → /login
```

### n8n Credentials

Backend automation credentials are stored inside n8n and are not included in the GitHub workflow export.

---

## Current MVP Status

The current MVP supports the complete workflow:

```text
LinkedIn
   ↓
Gmail
   ↓
n8n
   ↓
Job Extraction
   ↓
Relevance Scoring
   ↓
Relevance Filtering
   ↓
Duplicate Prevention
   ↓
Supabase
   ↓
Authentication
   ↓
Next.js Dashboard
   ↓
Application Tracking
```

### Completed

- LinkedIn job-alert integration
- Gmail trigger
- LinkedIn job extraction
- Rule-based job scoring
- Match-level classification
- Relevance filtering
- Duplicate prevention
- Supabase database storage
- Next.js dashboard
- Search functionality
- Match-level filters
- Application-status filters
- Application status tracking
- Application date tracking
- Dashboard statistics
- Responsive dashboard UI
- Supabase email/password authentication
- Protected `/jobs` route
- Login page
- Sign-out functionality
- Authenticated-only database access
- Secured Supabase RLS policies
- Sanitized n8n workflow export
- Production lint validation
- Production build validation

---

## Future Improvements

Potential future development includes:

- AI-powered resume-to-job matching
- Automatic CV selection
- Resume tailoring
- Cover-letter generation
- Job-description analysis
- Skill-gap analysis
- AI-powered job recommendations
- Application-email detection
- Interview invitation detection
- Interview tracking
- Google Calendar integration
- Recruiter-response tracking
- Job analytics
- International eligibility detection
- Company-quality verification
- Salary analysis
- Notification system
- Per-user job ownership
- Multiple-user support
- Role-based access control
- Cloud-hosted n8n automation
- 24/7 job collection
- Public production deployment

---

## Development Branches

The project uses:

```text
main
develop
```

### `main`

Contains the stable version of the application.

### `develop`

Used for ongoing development before stable features are merged into `main`.

---

## Git Workflow

Typical development workflow:

```text
develop
   ↓
Implement / Test
   ↓
Commit
   ↓
Push
   ↓
Merge
   ↓
main
```

---

## License

This project is licensed under the terms provided in the:

```text
LICENSE
```

file.

---

## Author

Developed as an automation and job-management project focused on simplifying the process of discovering, evaluating, securing, and tracking relevant internship and entry-level technology opportunities.