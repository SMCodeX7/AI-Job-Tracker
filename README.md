# AI Job Tracker

An automated job tracking system that collects LinkedIn job alerts from Gmail, processes and scores job opportunities using n8n, stores relevant jobs in Supabase, and displays them through a Next.js dashboard.

---

## Overview

AI Job Tracker automates the process of discovering and managing relevant job opportunities.

The system monitors LinkedIn job-alert emails, extracts individual job listings, calculates a relevance score based on predefined career preferences, filters unsuitable jobs, removes duplicates, stores suitable opportunities in Supabase, and provides a dashboard for managing job applications.

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
- Supabase also maintains a unique `job_id` constraint

### Job Dashboard

- Displays jobs stored in Supabase
- Search by:
  - Job title
  - Company
  - Location
- Filter by match level
- Filter by application status
- Responsive dashboard layout
- Direct LinkedIn job links

### Application Tracking

Jobs can be tracked using the following statuses:

- New
- Saved
- Applied
- Rejected

When a job is changed to `Applied`, the system automatically records the application date.

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

---

## Match Scoring

Jobs are scored based on their relevance to Data Science, Artificial Intelligence, Machine Learning, Analytics, and related entry-level career opportunities.

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

### Career-Level Priority

Additional points are given to:

- Internship
- Intern
- Co-op
- Trainee
- Junior
- Entry-Level
- Graduate
- Associate

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

### Match Levels

| Score | Match Level |
|------:|-------------|
| 75–100 | High |
| 50–74 | Medium |
| 0–49 | Low |

Only **Medium** and **High** matches continue to Supabase.

Legacy jobs that were inserted before relevance scoring was introduced are displayed as:

```text
Unscored
```

---

## Technology Stack

### Frontend

- Next.js
- TypeScript
- React
- Tailwind CSS

### Database

- Supabase
- PostgreSQL

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
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   │
│   │   └── lib/
│   │       └── supabase/
│   │           └── client.ts
│   │
│   ├── .env.local
│   ├── package.json
│   └── ...
│
├── .gitignore
├── LICENSE
└── README.md
```

> `.env.local` is excluded from GitHub and must never contain credentials that are committed to source control.

---

## Database

The main database table is:

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
| `received_at` | Date the alert email was received |
| `match_score` | Calculated relevance score |
| `match_level` | High, Medium, Low, or Unscored |
| `filter_reason` | Explanation of the relevance score |
| `status` | Application status |
| `applied_at` | Date the application was submitted |
| `created_at` | Database creation timestamp |
| `updated_at` | Last update timestamp |

---

## Supabase SQL Setup

The database was configured using the following SQL steps:

```text
01_create_jobs_table
02_add_job_matching_columns
03_add_jobs_read_policy
04_add_job_status_tracking
05_mark_legacy_jobs_unscored
06_add_application_tracking
```

### SQL Responsibilities

#### 01_create_jobs_table

Creates the main `jobs` table.

#### 02_add_job_matching_columns

Adds:

```text
match_score
match_level
filter_reason
```

#### 03_add_jobs_read_policy

Adds the required Supabase read permissions for the dashboard.

#### 04_add_job_status_tracking

Adds application-status validation and frontend update permission.

#### 05_mark_legacy_jobs_unscored

Marks jobs inserted before relevance scoring as:

```text
unscored
```

#### 06_add_application_tracking

Adds:

```text
applied_at
```

for storing the application date.

---

## n8n Workflow

The n8n automation contains the following nodes:

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

### Gmail Trigger

Monitors Gmail for emails from:

```text
jobalerts-noreply@linkedin.com
```

### Get a Message

Retrieves the full LinkedIn alert email.

### Extract LinkedIn Jobs

Extracts:

- Job ID
- Job title
- Company
- Location
- Job URL
- Easy Apply availability
- Actively Recruiting indicator
- Email subject
- Received date

### Score Job Relevance

Calculates a relevance score for each job.

### Keep Medium & High Matches

Only allows jobs with:

```text
match_score >= 50
```

to continue.

### Skip Previously Seen Jobs

Prevents jobs that were previously processed from being inserted again.

### Create a Row

Stores new relevant jobs in Supabase.

---

## n8n Workflow Export

A sanitized version of the n8n workflow is included in:

```text
n8n/linkedin-job-alert-pipeline.json
```

The GitHub version does not contain private execution data or secret credentials.

After importing the workflow into another n8n environment, the user must configure their own:

- Gmail OAuth credential
- Supabase credential

---

## Environment Variables

Create the following file:

```text
web/.env.local
```

Add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Do not commit `.env.local`.

Never expose:

```text
Supabase secret keys
Supabase service-role keys
Google OAuth client secrets
Database passwords
API secrets
```

---

## Local Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
```

Open the project:

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

### 3. Configure Supabase Environment Variables

Create:

```text
web/.env.local
```

Add your Supabase project URL and publishable key.

---

### 4. Start the Next.js Application

Inside the `web` directory:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Running n8n Locally

Start n8n using:

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

Then connect:

- Gmail OAuth credential
- Supabase credential

Publish the workflow.

The local n8n process must remain running for automatic Gmail-triggered processing to continue.

---

## Dashboard

The dashboard allows the user to:

- View automatically collected jobs
- Search job opportunities
- Filter by match level
- Filter by application status
- View relevance scores
- View scoring reasons
- Open LinkedIn job listings
- Save interesting jobs
- Mark jobs as applied
- Mark jobs as rejected
- Track application dates
- View job and application statistics

---

## Application Status Workflow

```text
New
 ↓
Saved
 ↓
Applied
 ↓
Rejected
```

The user is not required to follow this exact order.

For example:

```text
New → Applied
```

is also supported.

When a job is changed to:

```text
Applied
```

the application timestamp is automatically stored in:

```text
applied_at
```

---

## Security

Sensitive credentials are excluded from source control.

The following files or values must never be committed:

```text
.env
.env.local
Supabase secret keys
Supabase service-role keys
Google OAuth secrets
Database passwords
API secrets
```

The n8n workflow stored in this repository is sanitized before being uploaded to GitHub.

The frontend uses only the Supabase publishable key.

Backend automation uses protected credentials configured directly inside n8n.

---

## Current MVP Status

The current MVP supports the complete pipeline:

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
Next.js Dashboard
   ↓
Application Tracking
```

### Completed

- LinkedIn job-alert integration
- Gmail trigger
- Job extraction
- Job scoring
- Match-level filtering
- Duplicate prevention
- Supabase storage
- Next.js dashboard
- Job searching
- Job filtering
- Application status tracking
- Applied-date tracking
- Dashboard statistics
- Responsive dashboard UI

---

## Future Improvements

Potential future development includes:

- AI-powered resume-to-job matching
- Automatic CV selection
- Resume tailoring
- Cover-letter generation
- Job-description analysis
- Skill-gap analysis
- AI job recommendations
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
- Authentication
- Multiple user support
- Cloud-hosted n8n automation
- Public deployment

---

## Development Branches

Development can be managed using:

```text
main
develop
```

The `develop` branch is used for ongoing development before stable changes are merged into `main`.

---

## License

This project is licensed under the terms provided in the `LICENSE` file.

---

## Author

Developed as an automation and job-management project focused on simplifying the process of discovering, evaluating, and tracking relevant internship and entry-level technology opportunities.