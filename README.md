# Sponsy Bot

AI-powered sponsorship outreach automation platform designed to help college events, hackathons, communities, and organizations discover potential sponsors, research companies, personalize outreach, and manage follow-ups from a single platform.

## Overview

Finding sponsors usually involves repetitive work:

* Finding relevant companies
* Researching each company
* Finding the right contact
* Writing personalized emails
* Sending and tracking outreach
* Managing replies
* Following up with interested sponsors

**Sponsy Bot** aims to automate this workflow while keeping humans in control of important decisions such as approving research and sending emails.

## Core Workflow

```text
Event / Campaign Details
          ↓
Sponsor Discovery
          ↓
Company Research
          ↓
AI Relevance Analysis
          ↓
Contact Discovery
          ↓
Personalized Email Generation
          ↓
Human Approval
          ↓
Email Sending
          ↓
Reply & Outreach Monitoring
          ↓
Automated Follow-ups
```

## Key Features

### 1. AI-Powered Sponsor Research

Automatically research potential sponsors and collect useful information about:

* Company
* Industry
* Products and services
* Recent initiatives
* Potential sponsorship opportunities
* Relevant public contact information
* Source URLs

AI-generated research is stored along with its sources so that users can verify the information before using it.

### 2. Sponsor Relevance Classification

Analyse researched companies and determine how relevant they are to a particular event or campaign.

Example factors:

* Industry relevance
* Target audience overlap
* Product relevance
* Potential sponsorship contribution
* Previous community or event involvement

Companies can then be categorized into different priority levels.

### 3. Contact Discovery

Identify appropriate publicly available contact channels for sponsorship outreach, such as:

* Partnerships
* Sponsorships
* Developer relations
* Marketing
* Community teams

The system should avoid blindly generating or guessing email addresses.

### 4. AI-Personalized Email Generation

Generate personalized sponsorship emails using:

* Event information
* Company research
* Contact information
* Sponsorship requirements
* Previous communication

The goal is to generate emails that are specific to each company instead of sending the same template to everyone.

### 5. Human Approval

AI-generated emails are **not automatically sent**.

Users can:

* Review the generated email
* Edit the content
* Regenerate it
* Approve it
* Reject it

Only approved emails can be sent.

### 6. Gmail Integration

Connect a Gmail account to:

* Send approved outreach emails
* Maintain conversation threads
* Detect replies
* Track sent messages
* Manage follow-ups

### 7. Outreach Tracking

Track useful outreach events such as:

* Email sent
* Reply received
* Bounce detected
* Follow-up scheduled
* Follow-up sent
* Meeting/proposal interest

Optional open and click tracking may be implemented with appropriate disclosure, while recognizing that these signals are not guaranteed to represent human activity.

### 8. Automated Follow-ups

Automatically identify contacts that have not responded and schedule follow-ups.

The system can enforce limits such as:

```text
Initial Email
     ↓
Wait
     ↓
Follow-up #1
     ↓
Wait
     ↓
Follow-up #2
     ↓
Stop
```

Follow-ups should not be triggered solely because an email appears to have been opened or clicked.

### 9. Campaign Management

Create and manage separate sponsorship campaigns.

Example:

```text
Campaign: SVNIT Hackathon 2026

Target Sponsors: 100
Research Completed: 73
Emails Sent: 42
Replies: 11
Interested: 6
Meetings: 3
```

### 10. Analytics Dashboard

Provide an overview of the outreach pipeline.

Possible metrics:

* Companies researched
* Qualified sponsors
* Emails sent
* Replies received
* Response rate
* Follow-ups sent
* Interested sponsors
* Meetings
* Sponsorship conversions

The main focus should be on meaningful outcomes rather than vanity metrics such as email opens.

## Tech Stack

### Frontend & Backend

* Next.js
* TypeScript
* Tailwind CSS

### Database

* Supabase
* PostgreSQL

### AI

* Gemini
* LangGraph

### Web Research

* Tavily

### Email

* Gmail API

### Authentication

* Supabase Auth

## Architecture

```text
                    ┌───────────────────┐
                    │     Next.js       │
                    │ Frontend + APIs   │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼────────────────┐
              │               │                │
              ▼               ▼                ▼
       ┌────────────┐  ┌─────────────┐  ┌─────────────┐
       │  Supabase  │  │ AI Workflow │  │ Gmail API   │
       │ PostgreSQL │  │ LangGraph   │  │             │
       └────────────┘  └──────┬──────┘  └─────────────┘
                               │
                        ┌──────┴──────┐
                        ▼             ▼
                    Gemini         Tavily
```

## Database Structure

The initial database can contain entities such as:

```text
User
 │
 └── Campaign
       │
       ├── Company
       │     └── Contact
       │
       ├── Research
       │
       ├── Email
       │     └── EmailEvent
       │
       └── FollowUp
```

### Example entities

**Company**

```text
id
name
website
industry
description
research_status
created_at
```

**Contact**

```text
id
company_id
name
email
role
source
verified
```

**Email**

```text
id
campaign_id
contact_id
gmail_message_id
subject
body
status
sent_at
```

**EmailEvent**

```text
id
email_id
event_type
occurred_at
metadata
```

**FollowUp**

```text
id
email_id
scheduled_at
sent_at
status
sequence_number
```

## Project Goals

Sponsy Bot is being built around three main principles:

### Automate repetitive work

Reduce the amount of manual research and repetitive outreach required from organizers.

### Personalize instead of spam

Use company-specific research to create meaningful and relevant communication.

### Keep humans in control

AI assists with research, classification and drafting, while users remain responsible for approving outreach.

## Getting Started

### Prerequisites

Make sure you have:

* Node.js
* npm
* A Supabase project
* Gemini API key
* Tavily API key
* Google Cloud project with Gmail API enabled

### Installation

Clone the repository:

```bash
git clone <repository-url>
cd sponsy-bot
```

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env.local
```

Add the required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

GEMINI_API_KEY=
TAVILY_API_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Development Roadmap

* [ ] Project setup
* [ ] Authentication
* [ ] Campaign management
* [ ] Sponsor discovery
* [ ] AI company research
* [ ] Sponsor relevance classification
* [ ] Contact management
* [ ] AI email generation
* [ ] Human approval workflow
* [ ] Gmail integration
* [ ] Reply detection
* [ ] Follow-up automation
* [ ] Outreach analytics
* [ ] Final dashboard
* [ ] Deployment

## Important Considerations

### AI-generated information

AI research should always be treated as potentially imperfect. Important company information should be verified before it is used for outreach.

### Email tracking

Open and click tracking can be affected by email clients, privacy features, image proxies and automated scanners. These signals should therefore be treated as estimates rather than definitive proof of human activity.

### Privacy

Only collect information necessary for the outreach workflow and handle authentication credentials and email data securely.

## Project Status

🚧 **Currently in development**

Sponsy Bot is being developed as an AI-powered sponsorship outreach platform with a focus on practical automation, personalized communication and human-controlled outreach.

## License

This project is currently intended for educational and hackathon development.
