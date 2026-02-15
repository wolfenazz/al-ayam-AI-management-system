# Al-Ayyam AI Platform: Technical Documentation (v1.0)



## 1. Executive Summary

The Al-Ayyam AI Platform is a next-generation news management ecosystem designed to bridge the gap between automated content intelligence and human editorial workflows. The system leverages **Generative AI** for real-time news aggregation and synthesis while utilizing **WhatsApp Integration** as the primary interface for distributed workforce management.

**Core Mission:** To automate the news cycle from discovery to publication draft, while streamlining employee task management through familiar instant messaging channels.

---

## 2. System Architecture Overview

The platform operates on a **Google Cloud-Powered Architecture**, utilizing **Next.js** for the frontend dashboard and **Firebase** for all backend services including real-time synchronization, database storage, authentication, and serverless computing. This unified Firebase approach simplifies infrastructure management while providing scalable, real-time capabilities essential for news operations and workforce coordination.

### High-Level Data Flow

1. **Ingestion:** Scrapers/APIs monitor target news sites and push data to Firebase Firestore.
2. **Processing:** AI Engine (running on Firebase Cloud Functions or Google Cloud Run) analyzes, summarizes, and rewrites content.
3. **Review:** Editor Dashboard (Next.js) displays "Ready to Post" content with real-time updates via Firestore.
4. **Assignment:** Tasks are pushed to Employees via WhatsApp API, with all task data stored in Firestore.
5. **Feedback:** Employee updates on WhatsApp sync back to Firestore, triggering real-time Dashboard updates.
6. **Analytics:** Firebase Analytics and Cloud Functions generate performance insights and reports.
---

## 3. Core Modules

### Module A: The AI News Engine (Automated Aggregation)

*Automated gathering, synthesis, and drafting of news content.*

The AI News Engine serves as the backbone of the Al-Ayyam Platform's content intelligence system. It operates as a continuous, automated pipeline that transforms raw news data from multiple sources into publication-ready drafts. This module eliminates manual research time while maintaining editorial quality through human oversight at critical decision points.

#### 1. Ingestion Layer

The Ingestion Layer is responsible for continuously monitoring and collecting news content from predefined sources. It operates as a 24/7 automated system that ensures no breaking news is missed.

**Target Sources Configuration:**
- **RSS Feeds:** Primary news outlets provide RSS feeds that are polled at configurable intervals (e.g., every 5-15 minutes)
- **News APIs:** Direct integration with news aggregators (e.g., NewsAPI, GDELT , or anylocal providers) for broader coverage
- **Web Scrapers:** Custom Python scripts for sources without RSS/API access, using libraries like BeautifulSoup or Scrapy
- **Social Media Monitoring:** (Optional) integration with Twitter/X API for trending topics and breaking news alerts
- **Source Categorization:** Sources are tagged by region (bahrain), topic (politics, sports, business), and priority level


**Real-Time Detection Mechanisms:**
- **Polling (Cron Jobs):** Scheduled tasks that check sources at regular intervals. This is reliable but may have slight delays (important)
- **Webhooks:** Preferred method when available - sources push notifications immediately when new content is published
- **Change Detection:** System compares article URLs/titles against a database of already-processed items to avoid duplicates
- **Priority Queue:** Breaking news sources are checked more frequently than general news sources

**Data Capture:**
- Full article text and metadata (author, publication date, source URL)
- Images and multimedia content
- Structured data when available (JSON-LD, schema.org markup)
- Initial categorization tags based on source and content analysis

#### 2. Generative AI Processing

Once an article is detected and ingested, it enters the AI Processing Pipeline where a sophisticated Large Language Model (LLM) transforms raw content into professional news reports. This multi-stage process ensures accuracy, journalistic quality, and adherence to Al-Ayyam's editorial standards.

**Stage 1: Content Analysis & Fact Extraction**
The AI first analyzes the raw article to extract structured information:
- **Entity Recognition:** Identifies and extracts key entities including:
  - People (politicians, celebrities, experts, witnesses)
  - Organizations (companies, government bodies, NGOs)
  - Locations (cities, countries, venues, landmarks)
  - Dates and times (event dates, deadlines, historical references)
- **Event Detection:** Determines the core event being reported (e.g., election, disaster, product launch)
- **Key Facts Extraction:** Pulls out statistics, quotes, and specific details that form the news value
- **Source Credibility Assessment:** Evaluates the reliability of the original source based on historical accuracy

**Stage 2: Contextual Understanding**
The AI enriches the extracted facts with additional context:
- **Historical Context:** References previous related events or background information
- **Geographic Context:** Provides location-specific details and regional significance
- **Stakeholder Analysis:** Identifies who is affected and their potential reactions
- **Trend Analysis:** Determines if this is part of a larger pattern or trend

**Stage 3: Sentiment & Tone Analysis**
Understanding the emotional and editorial angle of the news:
- **Sentiment Classification:** Positive, negative, neutral, or mixed sentiment
- **Tone Detection:** Objective, opinionated, urgent, celebratory, etc.
- **Bias Detection:** Identifies potential bias in the original source
- **Impact Assessment:** Determines the likely impact on different audiences

**Stage 4: Draft Generation**
The AI creates a comprehensive, professional news article:
- **Headline Generation:** Creates engaging, accurate headlines following journalistic conventions
- **Lead Paragraph:** Writes a compelling summary that answers the 5 Ws (Who, What, When, Where, Why)
- **Body Structure:** Organizes content with clear paragraphs, logical flow, and proper transitions
- **Quote Integration:** Preserves and properly attributes quotes from the original source
- **Editorial Voice:** Maintains Al-Ayyam's house style and journalistic standards
- **Length Optimization:** Adapts article length based on importance and category
- **SEO Optimization:** Includes relevant keywords for search engine visibility

**Stage 5: Multi-Source Synthesis (Deduplication & Enhancement)**
When multiple sources report on the same event:
- **Event Matching:** Uses entity matching and similarity algorithms to identify duplicate coverage
- **Source Ranking:** Prioritizes more credible or detailed sources
- **Information Merging:** Combines unique facts from each source into a single comprehensive report
- **Conflict Resolution:** Identifies and flags conflicting information for human review
- **Attribution Management:** Properly credits all contributing sources
- **Perspective Integration:** Includes different viewpoints when available from various sources

**Quality Assurance Checks:**
- Factual consistency verification
- Grammar and style checking
- Plagiarism detection against existing database
- Compliance with journalistic ethics guidelines

#### 3. The "Ready to Post" Pipeline

After AI processing, articles enter the editorial review workflow where human editors make final decisions before publication. This pipeline balances automation efficiency with editorial control.

**Draft State Management:**
- **Status Tracking:** Each article maintains a status throughout its lifecycle:
  - `INGESTED`: Raw content captured from source
  - `PROCESSING`: AI analysis in progress
  - `PENDING_APPROVAL`: AI draft complete, awaiting human review
  - `UNDER_REVIEW`: Editor actively reviewing the article
  - `READY_TO_POST`: Approved and scheduled for publication
  - `PUBLISHED`: Live on the website/platform
  - `REJECTED`: Article declined for publication
  - `NEEDS_REVISION`: Returned to AI for regeneration with specific feedback
- **Version Control:** Maintains history of all edits and changes
- **Metadata Preservation:** All AI-generated metadata (sentiment, entities, sources) is retained for analytics

**News Manager Dashboard Interface:**
The Next.js Dashboard provides a comprehensive editorial workspace with the following features:

**Article Comparison View:**
- **Side-by-Side Display:** Original source text on left, AI-generated draft on right
- **Difference Highlighting:** Visual indicators showing changes, additions, and deletions
- **Source Attribution:** Links to original sources with credibility scores
- **AI Confidence Score:** Displays the AI's confidence level in its generated content
- **Fact-Check Flags:** Highlights statements that may need verification

**Editorial Actions:**
- **One-Click Publish:** Immediately publish the AI draft as-is
- **Request Human Edit:** Assign to a journalist for manual refinement
- **Edit Directly:** Inline editing capabilities for quick corrections
- **Request AI Revision:** Provide feedback to regenerate specific sections
- **Schedule Publication:** Set date/time for automatic publishing
- **Reject with Reason:** Document why article was declined

**Collaboration Features:**
- **Comments & Annotations:** Add notes for other editors or the AI system
- **Assignment Workflow:** Assign articles to specific journalists or editors
- **Approval Chains:** Multi-level approval for sensitive or high-impact stories
- **Task Integration:** Automatically creates WhatsApp tasks for assigned journalists

**Quality Metrics Display:**
- Readability score
- SEO score
- Estimated reading time
- Article length
- Number of sources used
- AI processing time

**Batch Operations:**
- Bulk approve multiple articles
- Bulk reject based on criteria
- Bulk assign to specific journalists
- Export articles for external publishing platforms



### Module B: WhatsApp Task Command Center

*Workflow management entirely integrated with the WhatsApp Business API.*

The WhatsApp Task Command Center revolutionizes workforce management by leveraging WhatsApp's ubiquitous presence as the primary communication channel between editors and field journalists. This module eliminates the need for specialized mobile applications, reduces training overhead, and ensures real-time task coordination through a platform that employees already use daily.

#### 1. Task Dispatch (Editor -> Employee)

The Task Dispatch system enables editors to create, assign, and monitor tasks directly from the Next.js Dashboard, with automatic delivery to employees' WhatsApp accounts.

**Dashboard Task Creation Interface:**
- **Article-Based Tasks:** Editors can select AI-generated articles from the "Ready to Post" queue and assign them to journalists for field reporting, verification, or additional coverage
- **Custom Tasks:** Create standalone assignments for specific events, interviews, or investigative pieces
- **Task Templates:** Pre-defined task types with customizable fields:
  - Breaking News Coverage
  - Press Conference Attendance
  - Interview Requests
  - Photo/Video Assignments
  - Fact-Checking Missions
  - Follow-up Stories

**Task Assignment Workflow:**
1. **Task Definition:** Editor fills in task details including:
   - Title and description
   - Priority level (Urgent, High, Normal, Low)
   - Deadline and time constraints
   - Location (if applicable)
   - Required deliverables (photos, video, quotes, article) (optional)
   - Budget or expense allocation (optional)
   - Reference materials (links to AI drafts, background info) (optional)

2. **Employee Selection:**
   - **Role-Based Filtering:** View only journalists, photographers, or editors based on task requirements
   - **Availability Status:** Shows who is currently available vs. on assignment
   - **Skill Matching:** Recommends employees with relevant expertise or past performance
   - **Geographic Proximity:** For field assignments, suggests nearest available journalists
   - **Workload Balancing:** Displays current task count to prevent over-assignment

3. **WhatsApp Message Generation:**
   - **Dynamic Template System:** Creates professional, formatted messages based on task type
   - **Personalization:** Includes employee name and relevant context
   - **Rich Media Support:** Can attach documents, maps, images, or reference materials
   - **Interactive Elements:** Includes quick-reply buttons for immediate response

**WhatsApp Message Examples:**

*Breaking News Assignment:*
```
🚨 URGENT ASSIGNMENT

📍 Location: Bahrain International Airport
📰 Story: Emergency landing of flight BA-452
⏰ Deadline: 45 minutes from now

Required:
- On-scene photos (minimum 5)
- Passenger interviews (2-3 quotes)
- Official statement from airport authority

Reply:
👍 ACCEPT - I'm on my way
❌ DECLINE - Not available
📞 CALL - Need more details

Task ID: #TSK-2024-0142
```

*Press Conference Coverage:*
```
📢 PRESS CONFERENCE

🏛️ Event: Ministry of Health COVID-19 Update
📍 Venue: Crown Plaza Hotel, Ballroom A
📅 Date: Tomorrow, 10:00 AM
🎤 Speaker: Dr. Ahmed Al-Mansoori

Coverage Requirements:
- Full speech notes
- Key statistics
- Minister quotes
- Q&A highlights

Budget: BD 50 (transport + refreshments)

Reply CONFIRM to accept this assignment.
Task ID: #TSK-2024-0143
```

**Message Delivery & Confirmation:**
- **Delivery Receipts:** System confirms when WhatsApp message is successfully delivered
- **Read Receipts:** Tracks when employee opens the message
- **Retry Logic:** Automatically resends if delivery fails (with configurable retry intervals)
- **Fallback Channels:** If WhatsApp is unavailable, can send SMS or email notification
- **Message Logging:** All communications are archived for compliance and reference

#### 2. Bi-Directional Sync

The Bi-Directional Sync system ensures seamless communication between WhatsApp conversations and the Dashboard, creating a unified task management experience.

**Employee Response Processing:**
Employees can respond to tasks through natural WhatsApp messages, which are automatically parsed and interpreted:

**Status Updates via Keywords:**
- **Acceptance Responses:** "CONFIRM", "ACCEPT", "YES", "👍", "On it" → Updates task status to `ACCEPTED`
- **Decline Responses:** "DECLINE", "NO", "❌", "Can't make it" → Updates task status to `DECLINED` and triggers reassignment workflow
- **Progress Updates:** "On my way", "Arrived", "Started", "Working on it" → Updates task status to `IN_PROGRESS` with timestamp
- **Completion Responses:** "Done", "Finished", "Complete", "✅" → Updates task status to `COMPLETED` and triggers completion notification
- **Delay Requests:** "Running late", "Need more time", "Will be 30 mins" → Updates estimated completion time and alerts manager

**Natural Language Processing:**
The system uses NLP to understand context and extract information from free-form messages:
- **Location Updates:** "I'm at the venue" → Updates GPS coordinates if location sharing is enabled
- **Contact Information:** "Spoke to Mr. Ahmed at 555-1234" → Extracts and stores contact details
- **Budget Requests:** "Need BD 20 for parking" → Creates expense request for manager approval
- **Obstacle Reporting:** "Security won't let me in" → Flags issue and alerts manager for intervention

**Media Upload Integration:**
Field journalists can send photos, videos, voice notes, and documents directly through WhatsApp:

**Automatic Media Processing:** 

## need to be Discussed - **important**

- **Photo Uploads:** Images sent via WhatsApp are automatically:
  - Uploaded to Firebase Storage
  - Compressed and optimized for web
  - Tagged with metadata (timestamp, location if available)
  - Linked to the specific Task ID
  - Watermarked with Al-Ayyam branding (optional)
  - Added to the Dashboard media gallery for the task

- **Video Uploads:** Video clips are:
  - Uploaded to Firebase Storage
  - Transcoded to web-friendly formats
  - Generated with thumbnail previews
  - Stored with duration and resolution metadata
  - Made available for editors to review

- **Voice Notes:** Audio messages are:
  - Uploaded to Firebase Storage
  - Transcribed using speech-to-text AI
  - Stored as both audio file and text transcript
  - Searchable within the task context

- **Documents:** PDFs, Word docs, and other files are:
  - Uploaded to Firebase Storage
  - Virus-scanned for security
  - Text-extracted for searchability
  - Made available for download from Dashboard

**Real-Time Dashboard Updates:**
- **Live Chat View:** Managers can see the WhatsApp conversation thread in the Dashboard
- **Media Gallery:** All uploaded media appears in a dedicated gallery panel
- **Status Indicators:** Visual indicators show task status, employee location, and time elapsed
- **Activity Timeline:** Chronological log of all communications and status changes
- **Collaborative Notes:** Managers can add internal notes visible only to editorial staff

**Offline Support:**
- **Message Queuing:** If employee is offline, messages are queued and delivered when they reconnect
- **Cached Updates:** Dashboard shows last known status with "Last sync" timestamp
- **Conflict Resolution:** If multiple updates arrive simultaneously, system uses timestamps to determine final state

#### 3. Notifications

The Notification System ensures managers and employees stay informed about task status changes, deadlines, and important events.

**Escalation & Alert System:**
Proactive notifications prevent tasks from falling through the cracks:

**Task Acceptance Escalation:**
- **First Reminder:** If task not accepted within 15 minutes, send gentle reminder to employee
- **Second Reminder:** If not accepted within 30 minutes, send urgent reminder with manager notification
- **Escalation Alert:** If not accepted within 1 hour, alert manager with option to reassign
- **Auto-Reassignment:** If not accepted within configurable time (e.g., 2 hours), automatically offer to other available employees

**Deadline Monitoring:**
- **Approaching Deadline:** Notify employee when 50%, 25%, and 10% of time remains
- **Overdue Alerts:** Immediate notification when deadline passes without completion
- **Manager Escalation:** If task is 30+ minutes overdue, alert manager with employee status
- **Critical Escalation:** If task is 1+ hour overdue and marked "Urgent", send SMS and email to manager

**Progress Milestone Notifications:**
- **Task Accepted:** Manager receives notification when employee confirms assignment
- **In Progress:** Notified when employee starts working on task
- **Media Uploaded:** Alert when photos/videos are submitted
- **Completion Request:** Notified when employee marks task as "Done" (requires manager review)

**Completion & Review Notifications:**
- **Task Completion:** Dashboard notification when employee submits final deliverables
- **Quality Flags:** Alerts if submitted content doesn't meet requirements (e.g., insufficient photos)
- **Approval Required:** Notification when manager needs to review and approve completed work
- **Publication Ready:** Alert when task is approved and ready for publishing

**Communication Notifications:**
- **New Messages:** Real-time alerts for incoming WhatsApp messages from employees
- **Mentions:** Notifications when employee mentions manager in message
- **File Uploads:** Alerts when new media is uploaded to task
- **Status Changes:** Notifications for any task status updates

**Notification Channels:**
- **In-App Notifications:** Real-time popups and badge indicators in Dashboard
- **Email Notifications:** Digest emails for non-urgent updates (configurable frequency)
- **SMS Alerts:** Critical notifications for urgent tasks and escalations
- **Push Notifications:** Browser push notifications for real-time updates
- **WhatsApp Notifications:** Can send WhatsApp messages to managers for critical alerts

**Notification Preferences:**
- **Role-Based Configuration:** Different notification settings for editors vs. managers
- **Task Priority Rules:** Urgent tasks trigger more aggressive notifications
- **Quiet Hours:** Configurable "do not disturb" periods (except for critical alerts)
- **Digest Mode:** Option to receive batched notifications instead of real-time
- **Custom Rules:** Managers can set personalized notification triggers

**Notification Analytics:**
- **Response Time Tracking:** Measures how quickly managers respond to notifications
- **Escalation Rate:** Tracks how often tasks require escalation
- **Channel Effectiveness:** Analytics on which notification channels are most effective
- **Optimization Suggestions:** System recommends notification settings based on usage patterns

---

## 4. Technical Stack & Implementation Details

### Frontend: React + Next.js

* **Framework:** Next.js 14+ (App Router) for server-side rendering and optimal performance.
* **UI Library:** Tailwind CSS or Material UI for a professional dashboard aesthetic with responsive design.
* **State Management:** React Query (TanStack Query) for managing real-time data fetching and caching.
* **Real-time Updates:** Firebase Firestore SDK for live data synchronization between Dashboard and mobile operations.

### Backend & Database: Firebase (Google Cloud)

The entire backend infrastructure is built on Firebase, providing a unified, scalable platform with built-in security and real-time capabilities.

* **Authentication (Firebase Auth):**
  * Secure login for Managers, Editors, and Employees
  * Role-based access control (RBAC) with custom claims
  * Multi-factor authentication support
  * OAuth integration (Google, Microsoft) for enterprise users
  * Session management and token refresh

* **Database (Firestore):**
  * NoSQL document database for all application data
  * Real-time synchronization across all connected clients
  * Automatic offline support with data persistence
  * Sub-collection structure for hierarchical data (tasks, messages, media)
  * Complex queries with indexing support
  * Built-in security rules for data access control
  * Used for all data including tasks, news items, employees, messages, and analytics

* **Cloud Storage:**
  * Scalable object storage for media files (photos, videos, audio, documents)
  * Automatic CDN distribution for fast media delivery
  * Image optimization and transformation on the fly
  * Secure file uploads with signed URLs
  * Organized storage buckets for different media types
  * Automatic backup and disaster recovery

* **Cloud Functions (Serverless Computing):**
  * **WhatsApp Webhook Handler:** Receives and processes incoming WhatsApp messages
  * **News Scraper Triggers:** Scheduled functions for polling news sources
  * **AI Processing Pipeline:** Orchestrates LLM calls for news generation
  * **Notification Engine:** Sends alerts via multiple channels (email, SMS, push)
  * **Task Escalation Logic:** Monitors task deadlines and triggers escalations
  * **Performance Metrics Calculator:** Computes employee performance metrics
  * **Data Archival:** Moves old data to cold storage
  * **Media Processing:** Compresses, resizes, and watermarks images
  * **Speech-to-Text:** Transcribes voice notes using Google Cloud Speech API

* **Cloud Firestore Triggers:**
  * Automatic notifications when task status changes
  * Real-time dashboard updates when new data arrives
  * Performance metric recalculation on task completion
  * Audit logging for compliance

* **Firebase Hosting:**
  * Global CDN for Next.js application deployment
  * Automatic SSL certificates
  * Preview deployments for testing
  * Custom domain configuration

* **Firebase Analytics:**
  * User behavior tracking and engagement metrics
  * Custom event tracking for news operations
  * Funnel analysis for task completion rates
  * Real-time user and event streaming

* **Firebase Cloud Messaging (FCM):**
  * Push notifications to Dashboard users
  * Mobile app notifications (if mobile app is developed)
  - Topic-based messaging for broadcast alerts

* **Google Cloud Run (Optional for Heavy Processing):**
  * Containerized applications for intensive AI processing
  * Scalable compute for large-scale news scraping
  * Custom ML model deployment
  - Integrates seamlessly with Firebase ecosystem

### Integration APIs

* **WhatsApp Business API (via Meta or Twilio):**
  * Sending task assignments to employees
  * Receiving employee responses and media
  * Message templates for structured communication
  - Webhook integration with Firebase Cloud Functions

* **OpenAI API / Anthropic Claude / Google Vertex AI:**
  * News summarization and content generation
  * Sentiment analysis and tone detection
  * Entity extraction and fact verification
  - Multi-source article synthesis

* **Google Cloud Speech-to-Text:**
  * Transcription of voice notes from journalists
  - Real-time and batch processing options

* **Google Cloud Translation API:**
  * Multi-language content support
  - Automatic translation for regional news

### Development & Deployment Tools

* **Firebase CLI:** Command-line tools for deployment and management
* **Google Cloud Console:** Web-based interface for monitoring and configuration
* **Cloud Build:** Continuous integration and deployment pipeline
* **Cloud Monitoring:** Application performance monitoring and alerting
* **Cloud Logging:** Centralized logging for debugging and analysis
* **Error Reporting:** Automatic error tracking and notification

---

## 5. Database Schema Structure (Conceptual)

To support the comprehensive tracking, reporting, and workflow management described in Modules A and B, the database utilizes Firebase Firestore's NoSQL document database model. This schema is designed to support real-time operations, historical reporting, analytics, and seamless scalability within the Firebase ecosystem.

### Database Architecture Overview

**Firebase-Only Storage Strategy:**
- **Firebase Firestore:** Primary database for all application data including:
  - Real-time data for live operations, chat threads, and task status updates
  - Dashboard synchronization across all connected clients
  - Historical data for reporting and analytics
  - Employee performance logs and metrics
  - All structured data with automatic indexing and querying
- **Firebase Storage:** Media files (photos, videos, audio, documents) with:
  - Global CDN distribution for fast delivery
  - Automatic scaling and backup
  - Secure file uploads with signed URLs
  - Image optimization and transformation
- **Firebase Cloud Functions:** Serverless compute for:
  - Data processing and transformation
  - Automated analytics calculations
  - Background jobs for data archival and cleanup
  - Real-time triggers for data synchronization

**Firestore Data Model:**
- **Document-Based:** Each entity (Employee, Task, News Item) is a document
- **Collection Structure:** Documents are organized in collections (e.g., `employees`, `tasks`, `news_items`)
- **Sub-Collections:** Hierarchical data using sub-collections (e.g., `tasks/{taskId}/messages`)
- **Real-Time Listeners:** Clients subscribe to document/collection changes for instant updates
- **Offline Support:** Automatic data caching and synchronization when offline
- **Security Rules:** Granular access control at document and collection level

### Core Tables

#### Table: `Employees`

Manages employee profiles, credentials, and performance metrics.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | PK | Unique Employee ID |
| `name` | String(255) | NOT NULL | Full Name |
| `email` | String(255) | UNIQUE | Email address for login |
| `whatsapp_uid` | String(255) | UNIQUE, ENCRYPTED | Encrypted WhatsApp Number |
| `phone_number` | String(20) | ENCRYPTED | Backup contact number |
| `role` | Enum | NOT NULL | Journalist, Editor, Photographer, Manager, Admin |
| `department` | String(100) | | News, Sports, Business, Politics, etc. |
| `status` | Enum | NOT NULL | ACTIVE, ON_LEAVE, INACTIVE |
| `availability` | Enum | NOT NULL | AVAILABLE, BUSY, OFF_DUTY |
| `current_location` | JSON | | GPS coordinates for field assignments |
| `skills` | JSON | | Array of specialized skills (e.g., ["interviews", "sports_coverage"]) |
| `performance_score` | Float(0-100) | | Calculated metric based on task completion rate and quality |
| `response_time_avg` | Integer (seconds) | | Average time to accept tasks |
| `total_tasks_completed` | Integer | | Lifetime task count |
| `created_at` | Timestamp | NOT NULL | Account creation date |
| `last_active` | Timestamp | | Last login/activity timestamp |
| `manager_id` | UUID | FK to Employees | Direct supervisor reference |

**Indexes:**
- `idx_role_status` on (`role`, `status`) for quick employee filtering
- `idx_availability` on (`availability`) for task assignment
- `idx_performance` on (`performance_score` DESC) for ranking

#### Table: `Tasks`

Central task management table tracking all assignments from creation to completion.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | PK | Unique Task ID |
| `title` | String(255) | NOT NULL | Task title/headline |
| `description` | Text | | Detailed task instructions |
| `type` | Enum | NOT NULL | BREAKING_NEWS, PRESS_CONF, INTERVIEW, PHOTO_ASSIGN, VIDEO_ASSIGN, FACT_CHECK, FOLLOW_UP, CUSTOM |
| `priority` | Enum | NOT NULL | URGENT, HIGH, NORMAL, LOW |
| `status` | Enum | NOT NULL | DRAFT, SENT, READ, ACCEPTED, IN_PROGRESS, REVIEW, COMPLETED, REJECTED, OVERDUE, CANCELLED |
| `assignee_id` | UUID | FK to Employees | Assigned employee |
| `creator_id` | UUID | FK to Employees | Manager who created the task |
| `news_item_id` | UUID | FK to News_Items | Linked article (if applicable) |
| `whatsapp_thread_id` | String(255) | UNIQUE | Link to specific WhatsApp conversation |
| `location` | JSON | | Geographic coordinates and address |
| `deadline` | Timestamp | | Task completion deadline |
| `estimated_duration` | Integer (minutes) | | Expected time to complete |
| `budget` | Decimal(10,2) | | Allocated budget for expenses |
| `deliverables` | JSON | | Required outputs (e.g., ["photos": 5, "quotes": 3]) |
| `created_at` | Timestamp | NOT NULL | Task creation timestamp |
| `sent_at` | Timestamp | | When WhatsApp message was sent |
| `read_at` | Timestamp | | When employee opened the message |
| `accepted_at` | Timestamp | | When employee confirmed acceptance |
| `started_at` | Timestamp | | When employee began working |
| `completed_at` | Timestamp | | When task was marked complete |
| `reviewed_at` | Timestamp | | When manager reviewed submission |
| `response_time` | Integer (seconds) | | Time between sent and accepted |
| `completion_time` | Integer (seconds) | | Time between started and completed |
| `quality_rating` | Integer(1-5) | | Manager's quality assessment |
| `escalation_count` | Integer | | Number of escalation alerts triggered |
| `last_reminder_sent` | Timestamp | | Last reminder notification sent |

**Indexes:**
- `idx_assignee_status` on (`assignee_id`, `status`) for employee task views
- `idx_priority_deadline` on (`priority`, `deadline`) for urgency sorting
- `idx_news_item` on (`news_item_id`) for article-task relationships
- `idx_created_at` on (`created_at` DESC) for recent tasks

#### Table: `News_Items`

Stores all news articles from ingestion through publication.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | PK | Unique News Item ID |
| `headline` | String(500) | NOT NULL | Article headline |
| `slug` | String(255) | UNIQUE | URL-friendly identifier |
| `source_url` | String(1000) | | Origin of the news |
| `source_id` | UUID | FK to News_Sources | Original news source |
| `category` | Enum | NOT NULL | POLITICS, SPORTS, BUSINESS, TECHNOLOGY, ENTERTAINMENT, HEALTH, WORLD, LOCAL |
| `region` | String(100) | | Geographic region (e.g., "Bahrain", "Middle East") |
| `status` | Enum | NOT NULL | INGESTED, PROCESSING, PENDING_APPROVAL, UNDER_REVIEW, READY_TO_POST, PUBLISHED, REJECTED, NEEDS_REVISION |
| `raw_content` | Text | | Original scraped text |
| `ai_generated_content` | Text | | AI-generated draft |
| `final_content` | Text | | Human-edited final version |
| `summary` | Text | | Brief summary for previews |
| `sentiment` | Enum | POSITIVE, NEGATIVE, NEUTRAL, MIXED | Sentiment analysis result |
| `tone` | Enum | OBJECTIVE, OPINIONATED, URGENT, CELEBRATORY | Detected tone |
| `ai_confidence_score` | Float(0-1) | | AI's confidence in generated content |
| `author` | String(255) | | Original article author |
| `publication_date` | Timestamp | | Original publication date |
| `ingested_at` | Timestamp | NOT NULL | When article was first captured |
| `processed_at` | Timestamp | | When AI processing completed |
| `reviewed_by` | UUID | FK to Employees | Editor who reviewed |
| `published_at` | Timestamp | | When article went live |
| `reading_time` | Integer (minutes) | | Estimated reading time |
| `view_count` | Integer | | Number of views after publication |
| `share_count` | Integer | | Social media shares |
| `seo_score` | Float(0-100) | | SEO optimization score |
| `readability_score` | Float(0-100) | | Readability assessment |
| `is_breaking` | Boolean | DEFAULT FALSE | Flag for breaking news |
| `is_featured` | Boolean | DEFAULT FALSE | Flag for featured content |
| `tags` | JSON | | Array of topic tags |
| `entities` | JSON | | Extracted entities (people, orgs, locations) |
| `sources_used` | JSON | | List of source articles merged |
| `version` | Integer | DEFAULT 1 | Content version number |

**Indexes:**
- `idx_status_category` on (`status`, `category`) for dashboard filtering
- `idx_published_at` on (`published_at` DESC) for chronological display
- `idx_slug` on (`slug`) for URL routing
- `idx_is_breaking` on (`is_breaking`, `published_at`) for breaking news feed

#### Table: `News_Sources`

Configuration and metadata for all news sources being monitored.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | PK | Unique Source ID |
| `name` | String(255) | NOT NULL | Source name (e.g., "BNA", "Al-Wasat") |
| `url` | String(1000) | NOT NULL | Source website URL |
| `rss_feed_url` | String(1000) | | RSS feed URL (if available) |
| `api_endpoint` | String(1000) | | API endpoint (if available) |
| `type` | Enum | NOT NULL | RSS, API, SCRAPER, SOCIAL_MEDIA |
| `category` | String(100) | | Primary content category |
| `region` | String(100) | | Geographic focus |
| `language` | String(10) | DEFAULT "en" | Content language |
| `priority` | Enum | NOT NULL | CRITICAL, HIGH, NORMAL, LOW |
| `polling_interval` | Integer (minutes) | DEFAULT 15 | How often to check this source |
| `credibility_score` | Float(0-100) | | Historical accuracy rating |
| `is_active` | Boolean | DEFAULT TRUE | Whether source is currently monitored |
| `last_checked` | Timestamp | | Last successful poll |
| `last_article_date` | Timestamp | | Most recent article found |
| `total_articles_ingested` | Integer | | Lifetime article count |
| `error_count` | Integer | | Number of failed attempts |
| `last_error` | Text | | Last error message |
| `created_at` | Timestamp | NOT NULL | Source registration date |

**Indexes:**
- `idx_is_active_priority` on (`is_active`, `priority`) for polling queue
- `idx_type` on (`type`) for source type filtering

#### Table: `Task_Messages`

Stores all WhatsApp messages exchanged between managers and employees for tasks.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | PK | Unique Message ID |
| `task_id` | UUID | FK to Tasks | Associated task |
| `sender_id` | UUID | FK to Employees | Who sent the message |
| `message_type` | Enum | NOT NULL | TEXT, IMAGE, VIDEO, AUDIO, DOCUMENT, LOCATION, SYSTEM |
| `content` | Text | | Message text content |
| `media_url` | String(1000) | | URL to uploaded media file |
| `media_type` | String(50) | | MIME type of media |
| `media_size` | Integer (bytes) | | Size of media file |
| `location` | JSON | | GPS coordinates if location message |
| `whatsapp_message_id` | String(255) | UNIQUE | Original WhatsApp message ID |
| `direction` | Enum | NOT NULL | OUTBOUND (to employee), INBOUND (from employee) |
| `status` | Enum | SENT, DELIVERED, READ, FAILED | Message delivery status |
| `sent_at` | Timestamp | NOT NULL | When message was sent |
| `delivered_at` | Timestamp | | When message was delivered |
| `read_at` | Timestamp | | When message was read |
| `is_system_message` | Boolean | DEFAULT FALSE | Auto-generated system notifications |
| `metadata` | JSON | | Additional message metadata |

**Indexes:**
- `idx_task_id_sent_at` on (`task_id`, `sent_at` DESC) for conversation history
- `idx_sender_id` on (`sender_id`) for user message history

#### Table: `Task_Media`

Tracks all media files uploaded for tasks (photos, videos, audio, documents).

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | PK | Unique Media ID |
| `task_id` | UUID | FK to Tasks | Associated task |
| `message_id` | UUID | FK to Task_Messages | Message that contained the media |
| `uploader_id` | UUID | FK to Employees | Who uploaded the file |
| `media_type` | Enum | NOT NULL | IMAGE, VIDEO, AUDIO, DOCUMENT |
| `file_name` | String(255) | NOT NULL | Original file name |
| `file_path` | String(1000) | NOT NULL | Storage path (Firebase Storage) |
| `file_url` | String(1000) | NOT NULL | Public CDN URL |
| `file_size` | Integer (bytes) | NOT NULL | File size in bytes |
| `mime_type` | String(100) | NOT NULL | MIME type |
| `width` | Integer | | Image/video width (pixels) |
| `height` | Integer | | Image/video height (pixels) |
| `duration` | Integer (seconds) | | Audio/video duration |
| `thumbnail_url` | String(1000) | | Thumbnail image URL |
| `caption` | Text | | Media caption/description |
| `is_watermarked` | Boolean | DEFAULT FALSE | Whether branding was applied |
| `transcription` | Text | | Text transcription (for audio/video) |
| `uploaded_at` | Timestamp | NOT NULL | Upload timestamp |
| `is_approved` | Boolean | | Manager approval status |

**Indexes:**
- `idx_task_id` on (`task_id`) for task media gallery
- `idx_uploader_id` on (`uploader_id`) for user media history

#### Table: `Notifications`

Manages all system notifications sent to users.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | PK | Unique Notification ID |
| `recipient_id` | UUID | FK to Employees | Notification recipient |
| `type` | Enum | NOT NULL | TASK_ASSIGNED, TASK_ACCEPTED, TASK_COMPLETED, DEADLINE_APPROACHING, OVERDUE, ESCALATION, MEDIA_UPLOADED, SYSTEM |
| `priority` | Enum | NOT NULL | CRITICAL, HIGH, NORMAL, LOW |
| `title` | String(255) | NOT NULL | Notification title |
| `message` | Text | NOT NULL | Notification body |
| `action_url` | String(1000) | | Link to relevant resource |
| `task_id` | UUID | FK to Tasks | Related task (if applicable) |
| `channels` | JSON | | Delivery channels used (e.g., ["dashboard", "email", "sms"]) |
| `status` | Enum | NOT NULL | PENDING, SENT, DELIVERED, READ, FAILED |
| `created_at` | Timestamp | NOT NULL | Notification creation time |
| `sent_at` | Timestamp | | When notification was sent |
| `read_at` | Timestamp | | When user read the notification |
| `expires_at` | Timestamp | | When notification expires |

**Indexes:**
- `idx_recipient_status` on (`recipient_id`, `status`, `created_at` DESC) for user notification inbox
- `idx_priority_status` on (`priority`, `status`) for processing queue

#### Table: `Task_Templates`

Pre-defined task templates for common assignment types.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | PK | Unique Template ID |
| `name` | String(255) | NOT NULL | Template name |
| `type` | Enum | NOT NULL | BREAKING_NEWS, PRESS_CONF, INTERVIEW, PHOTO_ASSIGN, VIDEO_ASSIGN, FACT_CHECK, FOLLOW_UP |
| `description` | Text | | Template description |
| `default_priority` | Enum | NOT NULL | URGENT, HIGH, NORMAL, LOW |
| `default_duration` | Integer (minutes) | | Estimated completion time |
| `required_deliverables` | JSON | | Default deliverables required |
| `message_template` | Text | NOT NULL | WhatsApp message template |
| `is_active` | Boolean | DEFAULT TRUE | Whether template is available |
| `created_by` | UUID | FK to Employees | Template creator |
| `created_at` | Timestamp | NOT NULL | Creation timestamp |
| `usage_count` | Integer | | Number of times used |

#### Table: `Performance_Metrics`

Stores calculated performance metrics for analytics and reporting.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | PK | Unique Metric ID |
| `employee_id` | UUID | FK to Employees | Subject employee |
| `period_start` | Date | NOT NULL | Start of measurement period |
| `period_end` | Date | NOT NULL | End of measurement period |
| `tasks_assigned` | Integer | NOT NULL | Total tasks assigned |
| `tasks_accepted` | Integer | NOT NULL | Tasks employee accepted |
| `tasks_completed` | Integer | NOT NULL | Tasks successfully completed |
| `tasks_rejected` | Integer | NOT NULL | Tasks employee declined |
| `tasks_overdue` | Integer | NOT NULL | Tasks completed after deadline |
| `acceptance_rate` | Float(0-100) | | Percentage of tasks accepted |
| `completion_rate` | Float(0-100) | | Percentage of accepted tasks completed |
| `on_time_rate` | Float(0-100) | | Percentage completed before deadline |
| `avg_response_time` | Integer (seconds) | | Average time to accept tasks |
| `avg_completion_time` | Integer (seconds) | | Average time to complete tasks |
| `avg_quality_rating` | Float(1-5) | | Average quality score |
| `total_media_uploaded` | Integer | | Number of media files submitted |
| `escalation_count` | Integer | | Number of escalations triggered |
| `created_at` | Timestamp | NOT NULL | When metrics were calculated |

**Indexes:**
- `idx_employee_period` on (`employee_id`, `period_start`, `period_end`) for employee performance history
- `idx_period` on (`period_start`, `period_end`) for period-based reports

### Database Relationships

**Primary Relationships:**
1. **Employees ↔ Tasks:** One-to-many (one employee can have many tasks)
2. **Tasks ↔ News_Items:** Many-to-one (multiple tasks can relate to one news item)
3. **Tasks ↔ Task_Messages:** One-to-many (one task has many messages)
4. **Tasks ↔ Task_Media:** One-to-many (one task has many media files)
5. **News_Items ↔ News_Sources:** Many-to-one (many articles from one source)
6. **Employees ↔ Notifications:** One-to-many (one employee receives many notifications)
7. **Tasks ↔ Task_Templates:** Many-to-one (many tasks use one template)
8. **Employees ↔ Performance_Metrics:** One-to-many (one employee has many metric records)

**Cascade Rules:**
- **ON DELETE CASCADE:** Task_Messages, Task_Media when parent Task is deleted
- **ON DELETE SET NULL:** Tasks when assigned Employee is deleted
- **ON DELETE RESTRICT:** News_Items, Employees to prevent accidental deletion of referenced data

### Data Integrity & Validation

**Firestore Security Rules:**
- **Authentication Required:** All read/write operations require authenticated users
- **Role-Based Access:** Custom claims determine what users can read/write
- **Document-Level Security:** Users can only access documents they're authorized to see
- **Field Validation:** Server-side validation on write operations
- **Data Validation Functions:** Cloud Functions validate data before writes are committed

**Business Rules Enforcement:**
1. **Task Status Transitions:** Cloud Functions validate that status changes follow valid workflow (e.g., cannot go from SENT to COMPLETED without ACCEPTED)
2. **Publication Approval:** News items cannot be published without manager approval (enforced via Cloud Functions)
3. **Employee Uniqueness:** Employee WhatsApp UID must be unique (enforced via Firestore unique field constraint or Cloud Function)
4. **Temporal Validation:** Task deadline must be after creation time (validated in Cloud Functions)
5. **Media Approval:** Media files must be virus-scanned and reviewed before being marked as approved

**Cloud Functions Triggers (Real-Time):**
- **onCreate Triggers:**
  - `onTaskCreated`: Send WhatsApp notification, create initial metrics
  - `onNewsItemIngested`: Trigger AI processing pipeline
  - `onEmployeeRegistered`: Initialize performance metrics
  - `onMessageReceived`: Parse WhatsApp messages and update task status

- **onUpdate Triggers:**
  - `onTaskStatusChanged`: Update performance metrics, send notifications, trigger escalations
  - `onNewsItemStatusChanged`: Update dashboard, trigger publication workflow
  - `onEmployeeUpdated`: Recalculate availability and workload
  - `onMediaUploaded`: Process media (compress, watermark, transcribe)

- **onDelete Triggers:**
  - `onTaskDeleted`: Clean up associated messages, media, and notifications
  - `onEmployeeDeleted`: Archive or reassign their tasks
  - `onNewsItemDeleted`: Remove from search indexes and analytics

**Scheduled Cloud Functions (Cron Jobs):**
- **News Polling:** Check RSS feeds and APIs at configured intervals
- **Deadline Monitoring:** Check for approaching deadlines and send reminders
- **Escalation Logic:** Monitor overdue tasks and trigger escalation notifications
- **Performance Metrics Calculation:** Batch calculate metrics for reporting periods
- **Data Archival:** Move old data (90+ days) to archival collections
- **Cleanup Jobs:** Delete temporary files, expired notifications, and cache data
- **Health Checks:** Monitor system health and send alerts for issues

**Cloud Functions for Complex Operations:**
- **`assignTask`:** Complex logic for task assignment including:
  - Employee availability check
  - Workload balancing
  - Geographic proximity matching
  - Skill matching
  - WhatsApp message generation and delivery

- **`calculateMetrics`:** Batch calculation of performance metrics:
  - Task acceptance and completion rates
  - Response time averages
  - Quality rating calculations
  - Escalation frequency tracking

- **`escalateTask`:** Escalation logic with:
  - Configurable timeout thresholds
  - Multi-level notification rules
  - Auto-reassignment options
  - Manager alerting

- **`mergeNewsSources`:** Multi-source article merging with:
  - Entity matching algorithms
  - Source ranking and prioritization
  - Conflict detection and flagging
  - Attribution management

- **`processMedia`:** Media processing pipeline:
  - Image compression and optimization
  - Video transcoding
  - Watermark application
  - Thumbnail generation
  - Speech-to-text transcription

**Firestore Indexes:**
- **Composite Indexes:** For complex queries (e.g., tasks filtered by assignee, status, and deadline)
- **Single Field Indexes:** For sorting and filtering on individual fields
- **Auto-Generated:** Firestore automatically creates indexes for simple queries
- **Custom Indexes:** Defined in `firestore.indexes.json` for complex query patterns

**Data Modeling Best Practices:**
- **Denormalization:** Duplicate data across collections for faster reads (e.g., employee name in task document)
- **Sub-Collections:** Use sub-collections for one-to-many relationships (e.g., `tasks/{taskId}/messages`)
- **Array Fields:** For many-to-many relationships (e.g., `tags` array in news items)
- **Document Size Limits:** Keep documents under 1MB (Firestore limit)
- **Batch Writes:** Use batched writes for atomic multi-document operations
- **Transactions:** Use transactions for operations requiring ACID guarantees across multiple documents

---

## 6. Reporting & Analytics System

An automated engine that queries the `Tasks` table to generate performance insights.

* **Metric: Response Time:** Average time between Task Sent and Employee "Accept" via WhatsApp.
* **Metric: Completion Rate:** Percentage of tasks finished before the deadline.
* **Metric: News Volume:** Number of AI articles generated vs. Manual articles written.
* **Visualization:** Charts within the Next.js dashboard using Recharts or Chart.js.

---

## 7. Security & Scalability

* **Role-Based Access Control (RBAC):** Editors can assign tasks; Administrators can view reports.
* **Data Privacy:** Employee phone numbers are hashed/encrypted. WhatsApp messages are stored securely in compliance with data regulations.
* **Scalability:** The Firebase infrastructure allows the system to ingest thousands of news articles simultaneously without slowing down the Dashboard. Firestore's automatic sharding and global distribution ensure consistent performance as the platform grows.

---

### **Next Steps for Development**

1. **Phase 1 (Core):** Setup Next.js + Firebase. Build the Dashboard UI.
2. **Phase 2 (Integration):** Connect WhatsApp Business API and test bi-directional messaging.
3. **Phase 3 (AI):** Build the Python scraper and connect the LLM for news generation.
4. **Phase 4 (Reporting):** Implement the analytics engine on Firebase with Cloud Functions and Firestore aggregation queries.

### IF need any extra info visit "DOCS\SRS.md" file.
