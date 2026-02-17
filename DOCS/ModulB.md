**This is plan to implement the Module B:**
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



### Module B: WhatsApp Task Command Center :

*Workflow management entirely integrated with the WhatsApp Business API.*

The WhatsApp Task Command Center revolutionizes workforce management by leveraging WhatsApp's ubiquitous presence as the primary communication channel between editors and field journalists. This module eliminates the need for specialized mobile applications, reduces training overhead, and ensures real-time task coordination through a platform that employees already use daily.

# 1. Task Dispatch (Editor -> Employee)

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

## 2. Bi-Directional Sync

The Bi-Directional Sync system ensures seamless communication between WhatsApp conversations and the Dashboard, creating a unified task management experience.

**Employee Response Processing:**
Employees can respond to tasks through (whatsapp buttons) WhatsApp messages, which are automatically parsed and interpreted :

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

### 3. Notifications

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

## 4. Technical Stack & Implementation Details for Module B

### Frontend: React + Next.js

**Framework & Core Technologies:**
- **Next.js 14+ (App Router):** Server-side rendering, API routes, and optimal performance with React Server Components
- **React 18+:** Latest React features including concurrent rendering, Suspense, and automatic batching
- **TypeScript:** Full type safety across the application with strict mode enabled

**UI Component Library:**
- **Tailwind CSS:** Utility-first CSS framework for rapid, consistent styling
- **Headless UI:** Unstyled, accessible UI components for complex interactions
- **Framer Motion:** Smooth animations and transitions for enhanced UX
- **React Icons:** Comprehensive icon library for intuitive UI elements

**State Management:**
- **React Query (TanStack Query):** Server state management for real-time data fetching, caching, and synchronization
- **Zustand:** Lightweight client state management for UI state (modals, filters, selections)
- **React Context API:** For global theme, user authentication, and notification state
- **React Hook Form + Zod:** Form validation with type-safe schema validation

**Real-Time Updates:**
- **Firebase Firestore SDK:** Real-time listeners for live task updates, message threads, and status changes
- **React Query Realtime:** Automatic refetching and optimistic updates for seamless UX
- **WebSocket Integration:** For instant push notifications and live chat updates

### Backend & Database: Firebase (Google Cloud)

**Authentication (Firebase Auth):**
- Secure login for Managers, Editors, and Employees with role-based access control (RBAC)
- Custom claims for role enforcement (Manager, Editor, Journalist, Photographer, Admin)
- Multi-factor authentication support for enhanced security
- Session management with automatic token refresh

**Database (Firestore):**
- Real-time synchronization across all connected clients for instant updates
- Sub-collection structure for hierarchical data (tasks, messages, media)
- Complex queries with composite indexes for efficient data retrieval
- Built-in security rules for granular access control
- Offline support with automatic data persistence and sync

**Cloud Storage:**
- Scalable object storage for media files (photos, videos, audio, documents)
- Automatic CDN distribution for fast media delivery
- Secure file uploads with signed URLs and access control
- Image optimization and transformation on the fly

**Cloud Functions (Serverless Computing):**
- **WhatsApp Webhook Handler:** Receives and processes incoming WhatsApp messages
- **Task Assignment Engine:** Complex logic for employee matching and task distribution
- **Notification Engine:** Sends alerts via multiple channels (email, SMS, push, WhatsApp)
- **Task Escalation Logic:** Monitors task deadlines and triggers escalation notifications
- **Performance Metrics Calculator:** Computes employee performance metrics in real-time
- **Message Parser:** NLP-based parsing of WhatsApp responses to extract actions and data
- **Media Processing Pipeline:** Compresses, resizes, watermarks images and transcribes audio

**Firestore Triggers:**
- Automatic notifications when task status changes
- Real-time dashboard updates when new messages arrive
- Performance metric recalculation on task completion
- Audit logging for compliance and accountability

### Integration APIs

**WhatsApp Business API (via Meta or Twilio):**
- Sending task assignments to employees with rich message templates
- Receiving employee responses and media uploads
- Interactive buttons for quick responses (Accept, Decline, Call)
- Webhook integration with Firebase Cloud Functions for real-time processing
- Message delivery and read receipts for tracking

**Google Cloud Speech-to-Text:**
- Transcription of voice notes from journalists
- Real-time and batch processing options
- Multi-language support for regional content

---

## 5. Database Schema Structure for Module B

### Core Tables for WhatsApp Task Command Center

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
| `deliverables` | JSON | | Required outputs (e.g., {"photos": 5, "quotes": 3}) |
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

**Firestore Indexes:**
- `idx_assignee_status` on (`assignee_id`, `status`) for employee task views
- `idx_priority_deadline` on (`priority`, `deadline`) for urgency sorting
- `idx_news_item` on (`news_item_id`) for article-task relationships
- `idx_created_at` on (`created_at` DESC) for recent tasks

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

**Firestore Indexes:**
- `idx_role_status` on (`role`, `status`) for quick employee filtering
- `idx_availability` on (`availability`) for task assignment
- `idx_performance` on (`performance_score` DESC) for ranking

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

**Firestore Indexes:**
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

**Firestore Indexes:**
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

**Firestore Indexes:**
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

**Firestore Indexes:**
- `idx_employee_period` on (`employee_id`, `period_start`, `period_end`) for employee performance history
- `idx_period` on (`period_start`, `period_end`) for period-based reports

### Database Relationships

**Primary Relationships:**
1. **Employees ↔ Tasks:** One-to-many (one employee can have many tasks)
2. **Tasks ↔ Task_Messages:** One-to-many (one task has many messages)
3. **Tasks ↔ Task_Media:** One-to-many (one task has many media files)
4. **Employees ↔ Notifications:** One-to-many (one employee receives many notifications)
5. **Tasks ↔ Task_Templates:** Many-to-one (many tasks use one template)
6. **Employees ↔ Performance_Metrics:** One-to-many (one employee has many metric records)

**Cascade Rules:**
- **ON DELETE CASCADE:** Task_Messages, Task_Media when parent Task is deleted
- **ON DELETE SET NULL:** Tasks when assigned Employee is deleted
- **ON DELETE RESTRICT:** Employees to prevent accidental deletion of referenced data

### Firestore Security Rules

**Authentication Required:** All read/write operations require authenticated users
**Role-Based Access:** Custom claims determine what users can read/write
**Document-Level Security:** Users can only access documents they're authorized to see
**Field Validation:** Server-side validation on write operations
**Data Validation Functions:** Cloud Functions validate data before writes are committed

---

## 6. React Component Architecture & Best Practices

### Component Structure

**Directory Organization:**
```
website/
├── app/
│   ├── dashboard/
│   │   ├── tasks/
│   │   │   ├── page.tsx              # Tasks list view
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx          # Task detail view
│   │   │   │   └── components/
│   │   │   │       ├── TaskHeader.tsx
│   │   │   │       ├── TaskChat.tsx
│   │   │   │       ├── TaskMedia.tsx
│   │   │   │       ├── TaskTimeline.tsx
│   │   │   │       └── TaskActions.tsx
│   │   │   └── components/
│   │   │       ├── TaskCard.tsx
│   │   │       ├── TaskFilters.tsx
│   │   │       ├── TaskStatusBadge.tsx
│   │   │       └── TaskPriorityBadge.tsx
│   │   ├── employees/
│   │   │   ├── page.tsx              # Employees list view
│   │   │   └── components/
│   │   │       ├── EmployeeCard.tsx
│   │   │       ├── EmployeeModal.tsx
│   │   │       └── EmployeeStats.tsx
│   │   ├── create-task/
│   │   │   ├── page.tsx              # Task creation form
│   │   │   └── components/
│   │   │       ├── TaskForm.tsx
│   │   │       ├── EmployeeSelector.tsx
│   │   │       ├── TemplateSelector.tsx
│   │   │       └── DeliverablesEditor.tsx
│   │   └── notifications/
│   │       ├── page.tsx              # Notifications center
│   │       └── components/
│   │           ├── NotificationList.tsx
│   │           └── NotificationItem.tsx
├── components/
│   ├── ui/                            # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   └── Avatar.tsx
│   ├── layout/                        # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MainLayout.tsx
│   └── shared/                        # Shared business components
│       ├── MediaGallery.tsx
│       ├── ChatThread.tsx
│       └── StatusTimeline.tsx
├── hooks/
│   ├── useTasks.ts                    # Task data fetching
│   ├── useEmployees.ts                # Employee data fetching
│   ├── useNotifications.ts            # Notification management
│   ├── useWhatsApp.ts                 # WhatsApp integration
│   ├── useRealtimeUpdates.ts          # Real-time listeners
│   └── useAuth.ts                     # Authentication
├── lib/
│   ├── firebase/
│   │   ├── config.ts                  # Firebase configuration
│   │   ├── auth.ts                    # Authentication helpers
│   │   ├── firestore.ts               # Firestore operations
│   │   └── storage.ts                 # Storage operations
│   ├── whatsapp/
│   │   ├── api.ts                     # WhatsApp API client
│   │   ├── templates.ts               # Message templates
│   │   └── parser.ts                  # Response parser
│   └── utils/
│       ├── date.ts                    # Date utilities
│       ├── validation.ts              # Validation schemas
│       └── formatting.ts              # Formatting helpers
├── stores/
│   ├── uiStore.ts                     # UI state (Zustand)
│   ├── notificationStore.ts           # Notification state
│   └── filterStore.ts                 # Filter state
└── types/
    ├── task.ts                        # Task types
    ├── employee.ts                    # Employee types
    ├── notification.ts                # Notification types
    └── common.ts                      # Common types
```

### Component Design Principles

**1. Single Responsibility Principle (SRP)**
- Each component should have one clear purpose
- Break down complex components into smaller, focused sub-components
- Example: [`TaskCard`](website/app/dashboard/tasks/components/TaskCard.tsx) displays task summary, while [`TaskDetail`](website/app/dashboard/tasks/[id]/page.tsx) handles full task information

**2. Component Modularity**
- Create reusable, composable components
- Use composition over inheritance
- Components should be self-contained with clear props interface
- Example: [`Badge`](website/components/ui/Badge.tsx) component can be used for status, priority, and category indicators

**3. Props Interface Design**
```typescript
// Define clear, typed interfaces for component props
interface TaskCardProps {
  task: Task;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  showActions?: boolean;
  className?: string;
}
```

**4. State Management Strategy**

**Local State (useState):**
- UI state specific to a single component
- Form inputs, modal visibility, toggle states
- Example: Task creation form inputs

**Server State (React Query):**
- Data fetched from Firebase/Firestore
- Caching, refetching, optimistic updates
- Example: Tasks list, employee data, notifications

**Global State (Zustand):**
- Cross-component state that doesn't need persistence
- UI theme, sidebar state, filter preferences
- Example: Current selected filters, modal stack

**5. Custom Hooks Pattern**

```typescript
// Custom hook for task operations
export function useTasks(filters?: TaskFilters) {
  const queryClient = useQueryClient();
  
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    tasks,
    isLoading,
    error,
    createTask: createTaskMutation.mutate,
  };
}
```

**6. Real-Time Updates Pattern**

```typescript
// Real-time listener for task updates
export function useTaskRealtimeUpdates(taskId: string) {
  const [task, setTask] = useState<Task | null>(null);
  
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'tasks', taskId),
      (doc) => {
        if (doc.exists()) {
          setTask({ id: doc.id, ...doc.data() } as Task);
        }
      }
    );
    
    return () => unsubscribe();
  }, [taskId]);

  return task;
}
```

### Performance Optimization

**1. Code Splitting**
- Use dynamic imports for heavy components
- Route-based code splitting with Next.js
- Example: Load task creation modal only when needed

```typescript
const TaskCreateModal = dynamic(() => import('./components/TaskCreateModal'), {
  loading: () => <LoadingSpinner />,
});
```

**2. Memoization**
- Use `React.memo` for expensive components
- Use `useMemo` for expensive calculations
- Use `useCallback` for event handlers passed to children

```typescript
const TaskList = React.memo(({ tasks }: TaskListProps) => {
  const filteredTasks = useMemo(() => 
    tasks.filter(task => task.status !== 'DELETED'),
    [tasks]
  );

  return (
    <div>
      {filteredTasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
});
```

**3. Virtual Scrolling**
- Use `react-window` or `react-virtualized` for long lists
- Implement for tasks list, notifications, and employee lists

**4. Image Optimization**
- Use Next.js Image component for automatic optimization
- Lazy load images in media galleries
- Generate thumbnails for media previews

```typescript
<Image
  src={media.thumbnailUrl}
  alt={media.caption}
  width={200}
  height={200}
  loading="lazy"
/>
```

### Error Handling

**1. Error Boundaries**
- Wrap components with error boundaries to catch errors
- Provide fallback UI for graceful degradation

```typescript
class TaskErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback message="Failed to load tasks" />;
    }
    return this.props.children;
  }
}
```

**2. Query Error Handling**
- Use React Query's error handling for API failures
- Display user-friendly error messages
- Implement retry logic with exponential backoff

```typescript
const { data, error, isLoading } = useQuery({
  queryKey: ['tasks'],
  queryFn: fetchTasks,
  retry: 3,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

### Accessibility

**1. Semantic HTML**
- Use proper HTML5 elements (header, nav, main, article)
- Ensure all interactive elements are keyboard accessible
- Provide proper ARIA labels and roles

**2. Keyboard Navigation**
- Support tab navigation through all interactive elements
- Implement keyboard shortcuts for common actions
- Provide focus indicators for all interactive elements

**3. Screen Reader Support**
- Use `aria-live` regions for dynamic content updates
- Provide descriptive alt text for images
- Use `aria-label` for icon-only buttons

```typescript
<button
  aria-label="Delete task"
  onClick={handleDelete}
>
  <TrashIcon />
</button>
```

### Testing Strategy

**1. Unit Testing (Jest + React Testing Library)**
- Test component rendering and user interactions
- Test custom hooks in isolation
- Mock Firebase and API calls

```typescript
describe('TaskCard', () => {
  it('renders task title and status', () => {
    const task = createMockTask();
    render(<TaskCard task={task} />);
    expect(screen.getByText(task.title)).toBeInTheDocument();
    expect(screen.getByText(task.status)).toBeInTheDocument();
  });
});
```

**2. Integration Testing**
- Test complete user flows
- Test real-time updates
- Test form submissions

**3. E2E Testing (Playwright)**
- Test critical user journeys
- Test WhatsApp integration flows
- Test cross-browser compatibility

---

## 7. Overall Website Design & UI Architecture

The Module B: WhatsApp Task Command Center features a modern, intuitive user interface designed to streamline task management and real-time communication. The UI design is based on comprehensive mockups located in [`website/UI disgen/`](website/UI disgen/), which provide detailed visual specifications for all key interfaces.

### Design Philosophy

**Core Principles:**
- **User-Centric Design:** Interfaces optimized for editorial workflows with minimal cognitive load
- **Real-Time Visibility:** Live updates and status indicators for instant awareness
- **Mobile-First Approach:** Responsive design that works seamlessly across devices
- **WhatsApp Integration:** Familiar messaging interface for reduced training overhead
- **Professional Aesthetic:** Clean, modern design reflecting journalistic excellence

### Color Palette & Branding

**Primary Colors:**
- **Primary Blue:** `#1e3fae` - Represents trust, professionalism, and authority
- **Primary Light:** `#ebf0ff` / `#eef2ff` - Subtle backgrounds and accents

**Status Colors:**
- **Urgent Red:** `#dc2626` - Critical tasks and deadlines
- **High Priority Orange:** `#ea580c` - Important tasks requiring attention
- **Normal Green:** `#16a34a` - Standard priority and success states

**WhatsApp Brand Colors:**
- **WhatsApp Green:** `#25d366` - Primary action buttons and integration elements
- **WhatsApp Dark:** `#075e54` - Headers and navigation elements
- **WhatsApp Background:** `#ece5dd` - Chat background pattern

**Neutral Colors:**
- **Background Light:** `#f6f6f8` - Main page backgrounds
- **Background Dark:** `#121520` - Dark mode backgrounds
- **Text Primary:** `#0f111a` - Primary text color
- **Text Secondary:** `#536293` - Secondary text and labels
- **Border Color:** `#e8eaf2` - Subtle borders and dividers

### Typography

**Font Family:** Inter (Google Fonts)
- **Weights:** 300 (Light), 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold), 800 (Extra Bold), 900 (Black)
- **Usage:** 
  - Headings: Bold/Extra Bold (700-900)
  - Body Text: Regular/Medium (400-500)
  - Labels/Captions: Semibold (600)
  - UI Elements: Medium (500)

**Icon System:** Material Symbols Outlined (Google)
- Consistent icon language across the application
- Filled and outlined variants for visual hierarchy
- Size variations: 14px, 16px, 20px, 24px for different contexts

### Key UI Screens for Module B

#### 7.1 Task Management Dashboard

**Location:** [`website/UI disgen/task_management_and_whatsapp_integration/`](website/UI disgen/task_management_and_whatsapp_integration/)

**Layout Structure:**
- **Top Navigation Bar:** 
  - Logo and branding
  - Global search bar (tasks, reporters, content)
  - Navigation links (Dashboard, Tasks, Content, Analytics)
  - Notification bell with badge
  - Settings button
  - User profile avatar

- **Left Sidebar (Filters):**
  - "New Task" action button (primary CTA)
  - View filters (All Tasks, My Tasks, Team Tasks)
  - Status filters (In Progress, To Do, In Review)
  - Priority filters (Urgent, High, Normal)
  - Task count indicators for each filter

- **Main Content Area (Task Grid):**
  - Responsive grid layout (1-3 columns based on screen size)
  - Task cards with:
    - Priority and status badges
    - Task title and description
    - Assignee avatar with online status
    - Deadline countdown
    - WhatsApp integration strip showing latest message
    - "Open Chat" quick action

- **Right WhatsApp Panel:**
  - Team chat header with online status
  - Real-time message thread
  - Media attachments (photos, audio, documents)
  - Message input with emoji and attachment options
  - Timestamps and read receipts

**Key Features:**
- Real-time task status updates via Firebase listeners
- Live WhatsApp message integration
- Visual priority indicators with color coding
- Employee availability status (online/offline/busy)
- Deadline countdown with urgency indicators
- Quick actions for common operations

#### 7.2 WhatsApp Task Assignment Interface

**Location:** [`website/UI disgen/whatsapp_task_assignment_interface/`](website/UI disgen/whatsapp_task_assignment_interface/)

**Layout Structure:**
- **Top Navigation Bar:**
  - Platform branding
  - WhatsApp API connection status indicator
  - Notification and settings controls
  - User profile

- **Left Column (Task Definition):**
  - Task title input
  - Priority level selector (High/Medium/Low with visual icons)
  - Deadline date and time pickers
  - Detailed description textarea
  - Location/media attachment area
  - Form validation and error handling

- **Middle Column (Employee Selection):**
  - Active employee count badge
  - Search/filter functionality
  - Employee cards with:
    - Profile photo and availability status
    - Name and role/title
    - Performance score
    - Specialization tags (Politics, Sports, Crime, etc.)
    - Location indicator
  - Visual selection state with checkmark
  - Grayscale styling for offline employees

- **Right Column (WhatsApp Preview):**
  - Phone frame/mockup design
  - WhatsApp chat header with recipient info
  - Message preview with:
    - Location map thumbnail
    - Task title and description
    - Deadline and priority information
    - Interactive buttons (Accept Task, Decline)
    - Timestamp and delivery status
  - Chat input area (mock)
  - Send action footer with encryption badge

**Key Features:**
- Live WhatsApp message preview before sending
- Employee availability and performance indicators
- Interactive WhatsApp Business API buttons
- Location integration with map preview
- Form validation with real-time feedback
- End-to-end encryption indicator

### Component-Based UI Architecture

**Reusable UI Components:**

1. **Navigation Components:**
   - [`TopNavigation`](website/components/layout/Header.tsx): Main app header
   - [`Sidebar`](website/components/layout/Sidebar.tsx): Filter and navigation sidebar
   - [`Breadcrumb`](website/components/ui/Breadcrumb.tsx): Navigation breadcrumbs

2. **Task Components:**
   - [`TaskCard`](website/app/dashboard/tasks/components/TaskCard.tsx): Individual task display
   - [`TaskGrid`](website/app/dashboard/tasks/components/TaskGrid.tsx): Grid layout for tasks
   - [`TaskFilters`](website/app/dashboard/tasks/components/TaskFilters.tsx): Filter controls
   - [`TaskStatusBadge`](website/app/dashboard/tasks/components/TaskStatusBadge.tsx): Status indicator
   - [`TaskPriorityBadge`](website/app/dashboard/tasks/components/TaskPriorityBadge.tsx): Priority indicator

3. **Employee Components:**
   - [`EmployeeCard`](website/app/dashboard/employees/components/EmployeeCard.tsx): Employee profile card
   - [`EmployeeSelector`](website/app/dashboard/create-task/components/EmployeeSelector.tsx): Selection interface
   - [`EmployeeAvatar`](website/components/ui/Avatar.tsx): Profile avatar with status
   - [`PerformanceScore`](website/app/dashboard/employees/components/PerformanceScore.tsx): Score display

4. **WhatsApp Components:**
   - [`ChatThread`](website/components/shared/ChatThread.tsx): Message conversation view
   - [`MessageBubble`](website/components/shared/MessageBubble.tsx): Individual message display
   - [`MediaGallery`](website/components/shared/MediaGallery.tsx): Media file display
   - [`WhatsAppPreview`](website/app/dashboard/create-task/components/WhatsAppPreview.tsx): Message preview
   - [`ChatInput`](website/components/shared/ChatInput.tsx): Message composition

5. **Form Components:**
   - [`TaskForm`](website/app/dashboard/create-task/components/TaskForm.tsx): Task creation form
   - [`PrioritySelector`](website/app/dashboard/create-task/components/PrioritySelector.tsx): Priority picker
   - [`DatePicker`](website/components/ui/DatePicker.tsx): Date/time selection
   - [`LocationPicker`](website/app/dashboard/create-task/components/LocationPicker.tsx): Location selection

6. **UI Primitives:**
   - [`Button`](website/components/ui/Button.tsx): Action buttons with variants
   - [`Modal`](website/components/ui/Modal.tsx): Dialog/modal component
   - [`Input`](website/components/ui/Input.tsx): Text input fields
   - [`Select`](website/components/ui/Select.tsx): Dropdown selects
   - [`Badge`](website/components/ui/Badge.tsx): Status and label badges
   - [`Card`](website/components/ui/Card.tsx): Container cards

### Responsive Design Strategy

**Breakpoints:**
- **Mobile:** < 768px (single column, stacked layout)
- **Tablet:** 768px - 1024px (two-column layout)
- **Desktop:** 1024px - 1280px (three-column layout)
- **Large Desktop:** > 1280px (full multi-column layout)

**Mobile Adaptations:**
- Collapsible sidebar with hamburger menu
- Full-width task cards
- Bottom navigation for mobile
- Touch-optimized interactive elements
- Swipe gestures for task actions

**Tablet Adaptations:**
- Two-column layout for task grid
- Compact sidebar with icons
- Optimized touch targets

**Desktop Features:**
- Full three-column layout
- Hover states and tooltips
- Keyboard shortcuts
- Drag-and-drop functionality

### Dark Mode Support

**Implementation:**
- CSS custom properties for theming
- Automatic system preference detection
- Manual toggle in settings
- Consistent color contrast ratios (WCAG AA compliant)

**Dark Mode Colors:**
- Background: `#121520`
- Card Background: `#1a1d2d`
- Text Primary: `#ffffff`
- Text Secondary: `#a0aec0`
- Borders: `#2d3748`

### Accessibility Features

**WCAG 2.1 Level AA Compliance:**
- Color contrast ratio of at least 4.5:1 for text
- Keyboard navigation support for all interactive elements
- ARIA labels and roles for screen readers
- Focus indicators for keyboard navigation
- Skip links for keyboard users
- Alt text for all images
- Semantic HTML structure

**Screen Reader Support:**
- Live regions for dynamic content updates
- Descriptive labels for form inputs
- Status announcements for task changes
- Audio descriptions for media content

### Animation & Micro-interactions

**Transitions:**
- Smooth color transitions (200-300ms)
- Hover effects on interactive elements
- Loading skeletons for content loading
- Page transitions between routes

**Micro-interactions:**
- Button press effects
- Card hover lift effects
- Badge pulse for urgent items
- Progress animations for file uploads
- Success checkmarks for completed actions

**Loading States:**
- Skeleton screens for task cards
- Spinner for async operations
- Progress bars for long-running tasks
- Optimistic UI updates for instant feedback

### Design Tokens

**Spacing Scale:**
- `0.25rem` (4px) - Tight spacing
- `0.5rem` (8px) - Small spacing
- `1rem` (16px) - Base spacing
- `1.5rem` (24px) - Medium spacing
- `2rem` (32px) - Large spacing
- `3rem` (48px) - Extra large spacing

**Border Radius:**
- `0.25rem` (4px) - Small elements
- `0.5rem` (8px) - Cards and buttons
- `0.75rem` (12px) - Large cards
- `1rem` (16px) - Modals and panels
- `9999px` - Full circles (avatars, badges)

**Shadows:**
- `sm` - Subtle elevation
- `md` - Standard elevation
- `lg` - Prominent elevation
- `xl` - High elevation (modals, dropdowns)

### Icon System

**Icon Categories:**
- **Navigation:** `arrow_back`, `menu`, `home`
- **Actions:** `add`, `edit`, `delete`, `send`
- **Status:** `check`, `close`, `priority_high`, `timer`
- **Communication:** `chat`, `notifications`, `call`, `videocam`
- **Media:** `image`, `videocam`, `mic`, `attach_file`
- **Location:** `location_on`, `map`
- **User:** `person`, `group`, `settings`

**Icon Usage Guidelines:**
- Consistent sizing within contexts
- Meaningful labels for accessibility
- Color variants for different states
- Animated icons for loading states

### Design System Integration

**Tailwind CSS Configuration:**
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#1e3fae',
        'primary-light': '#ebf0ff',
        'background-light': '#f6f6f8',
        'background-dark': '#121520',
        'accent-red': '#dc2626',
        'accent-green': '#16a34a',
        'accent-orange': '#ea580c',
        whatsapp: '#25d366',
        'whatsapp-dark': '#075e54',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px'
      },
    },
  },
}
```

### Performance Considerations

**Image Optimization:**
- Next.js Image component for automatic optimization
- Lazy loading for below-the-fold images
- WebP format with fallbacks
- Responsive image sizing

**Code Splitting:**
- Route-based code splitting
- Dynamic imports for heavy components
- Tree shaking for unused code
- Minimal bundle size

**Rendering Strategy:**
- Server-side rendering for initial page load
- Client-side hydration for interactivity
- Static generation for public pages
- Incremental static regeneration for dynamic content

---

## 8. Development Roadmap for Module B

### Phase 1: Foundation & Infrastructure (Weeks 1-2)

**Milestone 1.1: Project Setup (Week 1)**
- [x] Initialize Next.js 14+ project with TypeScript
- [x] Configure Tailwind CSS and UI component library (Tailwind v4 with custom theme tokens, Inter font, Material Symbols icons)
- [x] Set up Firebase project and configuration (`lib/firebase/config.ts`, `lib/firebase/app.ts`, `lib/firebase/index.ts`)
- [x] Configure Firebase Authentication with Google Sign-In (`lib/firebase/auth.ts`, `lib/auth/AuthContext.tsx` with profile sync)
- [x] Set up Firestore database with helper functions (`lib/firebase/firestore.ts` — CRUD, queries, real-time listeners)
- [x] Configure Firebase Storage for media files (`lib/firebase/storage.ts` — upload, download, delete, progress tracking)
- [x] Set up ESLint, Prettier, and Husky for code quality (ESLint configured via Next.js)
- [x] Configure environment variables and secrets management (`.env.local` with Firebase SDK credentials)
- [ ] Configure Firebase Authentication with custom claims for RBAC

**Milestone 1.2: Core Architecture (Week 2)**
- [x] Create component directory structure (`components/ui/`, `components/layout/`, `components/shared/`, `stores/`, `types/`, `lib/`, `app/dashboard/tasks/components/`)
- [x] Set up React Query for server state management (installed `@tanstack/react-query`)
- [x] Configure Zustand for client state management (`stores/uiStore.ts` — sidebar, chat panel, filters, view mode)
- [x] Create Firestore helper functions (`lib/firebase/firestore.ts` — getDocument, setDocument, queryDocuments, onSnapshotListener)
- [x] Create custom React hooks for Firebase operations (`useTasks`, `useEmployees`, `useNotifications`, `useMessages`)
- [x] Set up real-time listeners for Firestore (via custom hooks)
- [x] Implement error boundaries and error handling
- [x] Create reusable UI components (Badge, Avatar, Iphone17Pro with foreignObject live content support)
- [x] Set up routing structure for dashboard (`/` → redirect → `/dashboard`, `/dashboard/tasks`, `/dashboard/analytics`)
- [x] Implement ProtectedRoute component (`components/auth/ProtectedRoute.tsx`)
- [x] Set up AuthProvider with Google profile sync (avatar, name → Firestore employee profile)

**Deliverables:**
- ✅ Fully configured Next.js project with Tailwind CSS v4 design system
- ✅ Firebase integration with authentication (Google Sign-In, AuthContext, ProtectedRoute)
- ✅ Firestore & Storage helper libraries ready
- ✅ Core component library (Badge, Avatar, Iphone17Pro, Header, Sidebar, TaskCard, WhatsAppPanel, CreateTaskModal)
- ✅ Development environment ready
- ⬜ Custom claims RBAC (pending)

---

### Phase 2: Database & Backend Implementation (Weeks 3-4)

**Milestone 2.1: Firestore Schema Setup (Week 3)**
- [x] Create Firestore collections for Tasks, Employees, Task_Messages, Task_Media (via seeding script)
- [x] Define Firestore indexes for efficient queries (`firestore.indexes.json`)
- [x] Implement Firestore security rules for role-based access (`firestore.rules`)
- [ ] Create data validation functions for Firestore writes
- [ ] Set up Cloud Functions for data validation
- [ ] Implement audit logging for compliance

**Milestone 2.2: Cloud Functions Development (Week 4)**
- [ ] Implement WhatsApp webhook handler Cloud Function
- [ ] Create task assignment engine with employee matching logic
- [ ] Implement message parser for WhatsApp responses
- [ ] Create notification engine for multi-channel delivery
- [ ] Implement task escalation logic with configurable timeouts
- [ ] Create performance metrics calculator
- [ ] Set up media processing pipeline (compression, watermarking)
- [ ] Implement Cloud Functions triggers for real-time updates

**Deliverables:**
- Complete Firestore database schema
- All Cloud Functions deployed and tested
- Real-time data synchronization working
- Security rules enforced

---

### Phase 3: Core Task Management Features (Weeks 5-7)

**Milestone 3.1: Task Creation & Assignment (Week 5)**
- [x] Build task creation form with validation (CreateTaskModal — 3-column layout: task form, reporter selection, WhatsApp preview)
- [x] Implement employee selector with filtering (role, availability, skills) (search, skill tags, performance scores, availability status)
- [x] Create task template system
- [x] Implement deliverables editor
- [x] Build WhatsApp message generator with templates (live phone-frame preview of generated WhatsApp message)
- [x] Wrap WhatsApp message preview in iPhone 17 Pro frame (`Iphone17Pro.tsx` with foreignObject + scale transform)
- [x] Implement task assignment workflow (frontend UI ready, backend logic connected)
- [x] Add task preview before sending (WhatsApp message preview column in CreateTaskModal)
- [x] Implement task draft saving

**Milestone 3.2: Task List & Dashboard (Week 6)**
- [x] Build tasks list view with filtering and sorting (grid/list view toggle, sidebar status/priority filters)
- [x] Implement status badges and priority indicators (Badge component with urgent/high/normal/low/status variants)
- [x] Create task card component with quick actions (TaskCard with WhatsApp integration strip)
- [x] Add search functionality for tasks (search bar in Header)
- [x] Implement bulk actions (approve, reject, complete, delete)
- [x] Create task statistics overview (StatCard row — Total Tasks, In Progress, Urgent, Completed)
- [x] Create dashboard overview page with welcome message, key metrics, recent tasks, team status, and quick actions
- [x] Create dedicated Analytics page with task performance metrics
- [x] Refactor dashboard with reusable `DashboardLayout` (Header, Sidebar, ProtectedRoute, toggleable WhatsApp panel in iPhone frame)
- [x] Implement Header navigation with Next.js Link components and active link highlighting
- [x] Implement user profile dropdown in Header with Sign Out functionality
- [x] Implement toggleable WhatsApp panel in dashboard sidebar (hidden by default, opens in iPhone 17 Pro frame)
- [x] Implement Employee Management page (Team view with status and performance)
- [ ] Add task timeline view
- [x] Implement real-time updates for task status changes (via `useTasks` hook)

**Milestone 3.3: Task Detail View (Week 7)**
- [x] Build task detail page with all task information (Basic structure with Header, Actions, Timeline)
- [x] Implement task actions (edit, delete, reassign) (Delete implemented, Edit/Assign UI ready)
- [x] Create task history timeline (Implemented TaskTimeline component)
- [x] Implement real-time Task Chat (Implemented TaskChat component using `useMessages`)
- [x] Add employee information display (Implemented AssigneeCard)
- [x] Implement deliverables checklist (Implemented DeliverablesCard)
- [x] Add budget and expense tracking (Implemented BudgetCard)
- [x] Create task notes and annotations
- [x] Implement task version control

**Deliverables:**
- ✅ Task creation modal with employee selector and WhatsApp preview in iPhone frame (UI complete)
- ✅ Task list with grid/list views, filtering, and sorting (UI complete)
- ✅ Dashboard overview, dedicated Tasks and Analytics pages
- ✅ Dashboard layout with toggleable WhatsApp panel in iPhone 17 Pro frame
- 🔄 Task detail view with core features (Header, Actions, Timeline implemented; Chat & Media pending)
- [x] Real-time task updates working (via `useTasks` hook)

---

### Phase 4: WhatsApp Integration (Weeks 8-10)

**Milestone 4.1: WhatsApp API Integration (Week 8)**
- [ ] Set up WhatsApp Business API account
- [ ] Configure webhook endpoints
- [ ] Implement WhatsApp message sending
- [ ] Handle delivery and read receipts
- [ ] Implement message retry logic
- [ ] Add fallback channels (SMS, email)
- [ ] Implement message logging and archiving
- [ ] Create message templates for different task types

**Milestone 4.2: Bi-Directional Sync (Week 9)**
- [ ] Implement WhatsApp webhook handler
- [ ] Parse incoming WhatsApp messages
- [ ] Implement keyword-based status updates
- [ ] Add NLP for natural language understanding
- [ ] Handle media uploads from WhatsApp
- [ ] Implement real-time dashboard updates
- [ ] Add message threading support
- [ ] Handle offline message queuing

**Milestone 4.3: Interactive WhatsApp Features (Week 10)**
- [ ] Implement interactive buttons for quick responses
- [ ] Add location sharing support
- [ ] Implement contact information extraction
- [ ] Handle budget request parsing
- [ ] Add obstacle reporting system
- [ ] Implement voice note transcription
- [ ] Add document upload handling
- [ ] Create rich media message support

**Deliverables:**
- Full WhatsApp integration with message sending and receiving
- Bi-directional sync between WhatsApp and Dashboard
- Interactive WhatsApp features working
- Media upload and processing functional

---

### Phase 5: Notifications & Escalation System (Weeks 11-12)

**Milestone 5.1: Notification System (Week 11)**
- [ ] Build notification center component
- [ ] Implement in-app notifications with real-time updates
- [ ] Add notification preferences management
- [ ] Implement email notifications
- [ ] Add SMS notifications for critical alerts
- [ ] Implement browser push notifications
- [ ] Create notification templates
- [ ] Add notification analytics tracking

**Milestone 5.2: Escalation System (Week 12)**
- [ ] Implement task acceptance escalation logic
- [ ] Add deadline monitoring and alerts
- [ ] Create milestone notifications
- [ ] Implement completion and review notifications
- [ ] Add communication notifications
- [ ] Create escalation rules engine
- [ ] Implement auto-reassignment logic
- [ ] Add manager escalation alerts

**Deliverables:**
- Complete notification system with multiple channels
- Escalation system with configurable rules
- Notification analytics and reporting
- Real-time notification delivery working

---

### Phase 6: Media Management (Weeks 13-14)

**Milestone 6.1: Media Upload & Processing (Week 13)**
- [ ] Build media gallery component
- [ ] Implement image upload with drag-and-drop
- [ ] Add video upload support
- [ ] Implement audio upload with transcription
- [ ] Add document upload handling
- [ ] Implement image compression and optimization
- [ ] Add watermark application
- [ ] Create thumbnail generation

**Milestone 6.2: Media Display & Management (Week 14)**
- [ ] Build media viewer with lightbox
- [ ] Implement media approval workflow
- [ ] Add media tagging and metadata
- [ ] Create media search functionality
- [ ] Implement media sharing
- [ ] Add media download functionality
- [ ] Create media analytics
- [ ] Implement media version control

**Deliverables:**
- Complete media management system
- Image, video, audio, and document upload working
- Media processing pipeline functional
- Media gallery and viewer implemented

---

### Phase 7: Employee Management (Weeks 15-16)

**Milestone 7.1: Employee Profiles (Week 15)**
- [ ] Build employee list view with filtering
- [ ] Create employee profile page
- [ ] Implement employee creation and editing
- [ ] Add role and department management
- [ ] Implement skill tagging system
- [ ] Add availability status tracking
- [ ] Create employee performance dashboard
- [ ] Implement employee search functionality

**Milestone 7.2: Employee Analytics (Week 16)**
- [ ] Build performance metrics dashboard
- [ ] Implement task assignment analytics
- [ ] Add response time tracking
- [ ] Create completion rate analytics
- [ ] Implement quality rating system
- [ ] Add escalation analytics
- [ ] Create performance reports
- [ ] Implement employee comparison tool

**Deliverables:**
- Complete employee management system
- Employee profiles and analytics working
- Performance metrics calculation functional
- Employee search and filtering implemented

---

### Phase 8: Reporting & Analytics (Weeks 17-18)

**Milestone 8.1: Dashboard Analytics (Week 17)**
- [ ] Build main analytics dashboard
- [ ] Implement task statistics charts
- [ ] Add performance metrics visualization
- [ ] Create real-time activity feed
- [ ] Implement trend analysis
- [ ] Add custom report builder
- [ ] Create export functionality
- [x] Implement advanced filtering (by reporter, date range, task type)
- [ ] Implement data filtering and date ranges

**Milestone 8.2: Advanced Analytics (Week 18)**
- [ ] Build notification analytics
- [ ] Implement channel effectiveness tracking
- [ ] Add response time analytics
- [ ] Create escalation rate tracking
- [ ] Implement employee performance comparison
- [ ] Add predictive analytics
- [ ] Create anomaly detection
- [ ] Implement automated insights

**Deliverables:**
- Complete analytics dashboard
- Real-time metrics and charts
- Custom report generation
- Advanced analytics and insights

---

### Phase 9: Testing & Quality Assurance (Weeks 19-20)

**Milestone 9.1: Testing Implementation (Week 19)**
- [ ] Write unit tests for all components
- [ ] Create integration tests for user flows
- [ ] Implement E2E tests with Playwright
- [ ] Add performance testing
- [ ] Implement load testing
- [ ] Create accessibility testing
- [ ] Add security testing
- [ ] Implement cross-browser testing

**Milestone 9.2: Bug Fixes & Optimization (Week 20)**
- [ ] Fix identified bugs from testing
- [ ] Optimize component performance
- [ ] Improve code quality
- [ ] Refactor complex components
- [ ] Optimize database queries
- [ ] Improve error handling
- [ ] Add loading states and skeletons
- [ ] Implement progressive enhancement

**Deliverables:**
- Comprehensive test suite
- All critical bugs fixed
- Performance optimized
- Code quality improved

---

### Phase 10: Deployment & Launch (Weeks 21-22)

**Milestone 10.1: Deployment Preparation (Week 21)**
- [ ] Configure production environment
- [ ] Set up CI/CD pipeline
- [ ] Configure Firebase production project
- [ ] Set up monitoring and logging
- [ ] Implement error tracking
- [ ] Create backup and recovery procedures
- [ ] Prepare deployment documentation
- [ ] Train support team

**Milestone 10.2: Launch & Post-Launch (Week 22)**
- [ ] Deploy to production
- [ ] Perform smoke testing
- [ ] Monitor system performance
- [ ] Gather user feedback
- [ ] Fix critical issues
- [ ] Implement hotfixes
- [ ] Create user documentation
- [ ] Plan future enhancements

**Deliverables:**
- Production deployment
- Monitoring and alerting in place
- User documentation complete
- Support team trained

---

### Progress Tracking

**Key Performance Indicators (KPIs):**

1. **Development Velocity:**
   - Tasks completed per sprint
   - Story points delivered
   - Code review turnaround time

2. **Quality Metrics:**
   - Test coverage percentage
   - Bug count per release
   - Code quality score (SonarQube)

3. **Performance Metrics:**
   - Page load time
   - API response time
   - Real-time update latency

4. **User Adoption:**
   - Active users
   - Tasks created per day
   - WhatsApp messages processed

**Milestone Tracking:**

| Phase | Start Date | End Date | Status | Completion % |
|-------|-----------|----------|--------|--------------|
| Phase 1: Foundation | Week 1 | Week 2 | Complete | 100% |
| Phase 2: Database & Backend | Week 3 | Week 4 | Partial | 50% |
| Phase 3: Task Management | Week 5 | Week 7 | In Progress | 75% |
| Phase 4: WhatsApp Integration | Week 8 | Week 10 | Not Started | 0% |
| Phase 5: Notifications | Week 11 | Week 12 | Not Started | 0% |
| Phase 6: Media Management | Week 13 | Week 14 | Not Started | 0% |
| Phase 7: Employee Management | Week 15 | Week 16 | Not Started | 0% |
| Phase 8: Analytics | Week 17 | Week 18 | Not Started | 0% |
| Phase 9: Testing | Week 19 | Week 20 | Not Started | 0% |
| Phase 10: Deployment | Week 21 | Week 22 | Not Started | 0% |

**Risk Management:**

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| WhatsApp API limitations | High | Medium | Implement fallback channels (SMS, email) |
| Firebase quota exceeded | High | Low | Monitor usage, implement caching |
| Real-time sync delays | Medium | Medium | Optimize queries, use pagination |
| Performance issues | High | Medium | Implement code splitting, lazy loading |
| Security vulnerabilities | High | Low | Regular security audits, penetration testing |

**Success Criteria:**

1. All 10 phases completed within 22 weeks
2. 90%+ test coverage for critical components
3. Page load time under 2 seconds
4. Real-time updates under 500ms latency
5. Zero critical bugs in production
6. User satisfaction score above 4.5/5
7. System uptime above 99.5%

---

## 8. Security & Scalability Considerations

### Security

**1. Authentication & Authorization:**
- Firebase Authentication with custom claims for role-based access control
- Multi-factor authentication for sensitive operations
- Session management with automatic token refresh
- Secure password policies and account lockout after failed attempts

**2. Data Protection:**
- Encryption of sensitive data (phone numbers, personal information)
- Firestore security rules for granular access control
- Secure file uploads with signed URLs and access control
- GDPR compliance for data handling and storage

**3. API Security:**
- Rate limiting for API endpoints
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection with content security policy

**4. Communication Security:**
- HTTPS/TLS for all communications
- Webhook signature verification for WhatsApp
- Secure WebSocket connections for real-time updates
- End-to-end encryption for sensitive messages

### Scalability

**1. Database Scalability:**
- Firestore automatic sharding and global distribution
- Composite indexes for efficient queries
- Pagination for large data sets
- Data denormalization for read optimization

**2. Application Scalability:**
- Next.js server-side rendering for optimal performance
- React Query caching to reduce API calls
- Code splitting for smaller bundle sizes
- CDN distribution for static assets

**3. Media Scalability:**
- Firebase Storage with automatic scaling
- Image optimization and CDN delivery
- Lazy loading for media galleries
- Thumbnail generation for faster previews

**4. Real-Time Scalability:**
- Firestore real-time listeners with efficient updates
- Optimistic updates for instant UI feedback
- Batch operations for bulk actions
- Connection pooling for database operations

---

## 9. Conclusion

Module B: WhatsApp Task Command Center represents a comprehensive, production-ready implementation plan that leverages modern React best practices, Firebase's powerful backend services, and seamless WhatsApp integration. The architecture is designed for scalability, maintainability, and exceptional user experience.

**Key Highlights:**

1. **Modern Tech Stack:** Next.js 14+, React 18+, TypeScript, Firebase, and Tailwind CSS
2. **Component Modularity:** Clean, reusable components with clear separation of concerns
3. **Efficient State Management:** React Query for server state, Zustand for client state
4. **Real-Time Capabilities:** Firebase Firestore real-time listeners for instant updates
5. **Security First:** Role-based access control, encryption, and secure data handling
6. **Performance Optimized:** Code splitting, memoization, virtual scrolling, and image optimization
7. **Comprehensive Testing:** Unit, integration, and E2E testing strategy
8. **Scalable Architecture:** Designed to handle growth in users, tasks, and media
9. **22-Week Development Roadmap:** Clear phases, milestones, and progress tracking
10. **Production Ready:** Complete with deployment, monitoring, and support planning

This plan provides a solid foundation for building a world-class WhatsApp-integrated task management system that will revolutionize how Al-Ayyam coordinates its distributed workforce.

---

**Document Version:** 1.2  
**Last Updated:** 2026-02-17  
**Status:** In Progress - Phase 2 (50%) & Phase 3 (75%), Connecting remaining UI components


---

### Implementation Log

#### 2026-02-17 — Initial Build (Phase 1 + Phase 3 UI)

**What was built:**

1. **Project Foundation**
   - Tailwind CSS v4 configured with full design system (custom theme tokens matching spec: colors, typography, spacing, shadows, animations)
   - Inter font + Material Symbols Outlined icons loaded via Google Fonts
   - Custom CSS: scrollbar styling, skeleton loading, glassmorphism, chat background pattern, fade/slide animations
   - External image domains configured in `next.config.ts`

2. **Type System** (`types/`)
   - `common.ts` — All shared enums (Priority, TaskStatus, TaskType, EmployeeRole, Availability, MessageType, NotificationType, etc.)
   - `task.ts` — Task, TaskTemplate, TaskFilters interfaces matching Firestore schema
   - `employee.ts` — Employee interface matching Firestore schema
   - `notification.ts` — Notification interface matching Firestore schema
   - `message.ts` — TaskMessage interface matching Firestore schema

3. **State Management** (`stores/`)
   - `uiStore.ts` — Zustand store managing sidebar, chat panel, filters, view mode, search, and modal state

4. **Mock Data** (`lib/mock-data.ts`)
   - 6 employees with realistic profiles, avatar URLs from UI mockups, skills, performance scores
   - 6 tasks across all priority/status combinations with realistic deadlines
   - 4 WhatsApp messages (text, image, audio) for the chat panel
   - 4 notifications (accepted, media uploaded, completed, deadline approaching)

5. **Reusable UI Components** (`components/ui/`)
   - `Badge.tsx` — Priority/status badges with 7 color variants (urgent, high, normal, low, status, whatsapp, neutral)
   - `Avatar.tsx` — Profile avatar with image, initials fallback, and online/busy/offline status indicator

6. **Layout Components** (`components/layout/`)
   - `Header.tsx` — Top navigation with logo, search bar, nav links (Dashboard/Tasks/Content/Analytics), notification dropdown with unread badges, settings, user profile avatar
   - `Sidebar.tsx` — Left sidebar with "New Task" CTA, view switcher (All/My/Team), status filters (In Progress/To Do/In Review) with counts, priority filters (Urgent/High/Normal) with color dots, WhatsApp API status indicator. Mobile-responsive with overlay.

7. **Task Components** (`app/dashboard/tasks/components/`)
   - `TaskCard.tsx` — Task card matching UI mockup: priority + status badges, title, description, assignee avatar with availability, deadline countdown with urgency coloring, WhatsApp integration strip with "Open Chat" action for urgent tasks
   - `CreateTaskModal.tsx` — Full 3-column task assignment interface matching the WhatsApp Task Assignment Interface mockup:
     - **Left:** Task form (title, type selector, priority buttons, deadline date/time, description, location/media upload)
     - **Middle:** Reporter selector with search, skill tags, performance scores, availability status, selection checkmark
     - **Right:** Live WhatsApp phone-frame preview showing the generated assignment message with map, deadline, priority, and send button

8. **WhatsApp Chat Panel** (`components/shared/WhatsAppPanel.tsx`)
   - Right-side panel matching the UI mockup: team chat header with online status, message thread with sender color coding, text/image/audio message types, delivery receipts (sent/delivered/read), image download overlay, voice note player UI, chat input with emoji button and send action

9. **Dashboard Page** (`app/dashboard/page.tsx`)
   - Main dashboard assembling all components: Header + Sidebar + Task Grid + WhatsApp Panel
   - Stats bar with 4 metric cards (Total Tasks, In Progress, Urgent, Completed)
   - Grid/list view toggle
   - Root page (`app/page.tsx`) redirects to `/dashboard`

**Files created:**
```
website/
├── types/
│   ├── common.ts
│   ├── task.ts
│   ├── employee.ts
│   ├── notification.ts
│   └── message.ts
├── stores/
│   └── uiStore.ts
├── lib/
│   └── mock-data.ts
├── components/
│   ├── ui/
│   │   ├── Badge.tsx
│   │   └── Avatar.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── shared/
│       └── WhatsAppPanel.tsx
├── app/
│   ├── globals.css          (redesigned with full design system)
│   ├── layout.tsx            (updated with Inter font + Material Symbols)
│   ├── page.tsx              (redirect to /dashboard)
│   └── dashboard/
│       ├── page.tsx          (main dashboard page)
│       └── tasks/
│           └── components/
│               ├── TaskCard.tsx
│               └── CreateTaskModal.tsx
└── next.config.ts            (updated with image domains)
```

**Dependencies installed:**
- `zustand` — Client state management
- `framer-motion` — Animations
- `@tanstack/react-query` — Server state management
- `react-hot-toast` — Toast notifications
- `uuid` + `@types/uuid` — UUID generation

**What's next:**
- Firebase project setup & authentication (Phase 1 remaining)
- Firestore database collections & security rules (Phase 2)
- Connect UI to real Firestore data (replace mock data)
- Task detail page (Phase 3.3)
- WhatsApp Business API integration (Phase 4)

#### 2026-02-17 — Dashboard Refactoring & iPhone Frame Integration

**What was built:**

1. **Firebase Integration (Phase 1 completion)**
   - Firebase Auth configured with Google Sign-In (`lib/firebase/auth.ts`)
   - AuthContext with automatic Google profile photo & name sync to Firestore employee profile
   - ProtectedRoute component for access control
   - Firestore helper library (`lib/firebase/firestore.ts`) — CRUD, queries, snapshots
   - Storage helper library (`lib/firebase/storage.ts`) — upload with progress, download, delete
   - Environment variables configured in `.env.local`

2. **Dashboard Restructuring (Phase 3)**
   - Created reusable `DashboardLayout` component (`app/dashboard/layout.tsx`) with Header, Sidebar, ProtectedRoute
   - Refactored main dashboard as overview page with welcome message, key metrics, recent tasks, team status, quick actions
   - Created dedicated Tasks page (`app/dashboard/tasks/page.tsx`)
   - Created dedicated Analytics page (`app/dashboard/analytics/page.tsx`)
   - Updated Sidebar with navigation links for Dashboard, Tasks, Analytics
   - Updated Header with Next.js Link components, active link highlighting, user profile dropdown with Sign Out

3. **iPhone 17 Pro Frame Component**
   - Created `Iphone17Pro.tsx` (`components/ui/Iphone17Pro.tsx`) — SVG phone frame with `foreignObject` + CSS `scale(0.537)` transform for rendering live React content inside the screen
   - WhatsApp dashboard panel now renders inside iPhone 17 Pro frame
   - CreateTaskModal message preview now renders inside iPhone 17 Pro frame
   - WhatsAppPanel made container-adaptive (`w-full h-full`) to fill any parent

4. **WhatsApp Panel Toggle**
   - Toggleable WhatsApp panel in dashboard (hidden by default, slides in/out from right)
   - Floating action button: green WhatsApp FAB when hidden, white close button when open
   - Panel visible only on large screens (`lg:` breakpoint)

**Files created/modified:**
```
website/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx          [EXISTING]
│   ├── ui/
│   │   └── Iphone17Pro.tsx             [NEW] iPhone 17 Pro SVG frame with foreignObject
│   ├── layout/
│   │   ├── Header.tsx                  [MODIFIED] Active nav links, user dropdown, Sign Out
│   │   └── Sidebar.tsx                 [MODIFIED] Updated navigation items
│   └── shared/
│       └── WhatsAppPanel.tsx           [MODIFIED] Container-adaptive (w-full h-full)
├── app/
│   └── dashboard/
│       ├── layout.tsx                  [MODIFIED] DashboardLayout with iPhone-framed WhatsApp panel
│       ├── page.tsx                    [MODIFIED] Dashboard overview page
│       ├── tasks/
│       │   ├── page.tsx                [NEW] Dedicated tasks page
│       │   └── components/
│       │       └── CreateTaskModal.tsx  [MODIFIED] Message preview in iPhone frame
│       └── analytics/
│           └── page.tsx                [NEW] Analytics page
├── lib/
│   ├── firebase/
│   │   ├── auth.ts                     [EXISTING] Google Sign-In, logout
│   │   ├── firestore.ts                [EXISTING] CRUD helpers
│   │   └── storage.ts                  [EXISTING] Upload/download helpers
│   └── auth/
│       └── AuthContext.tsx             [EXISTING] Auth state + profile sync
└── stores/
    └── uiStore.ts                      [MODIFIED] chatPanelOpen defaults to false
```

**What's next (recommended priority order):**
1. **Task Detail View** (Phase 3.3) — Build `/dashboard/tasks/[id]` with full task info, chat thread, media, timeline, actions
2. **Custom React Hooks** (Phase 1 remaining) — `useTasks`, `useEmployees`, `useNotifications` hooks for Firestore data
3. **Connect UI to Firestore** — Replace mock data with real Firestore queries
4. **Firestore Security Rules & Indexes** (Phase 2) — Define collection schemas and access rules
5. **WhatsApp Business API Integration** (Phase 4)

#### 2026-02-17 — Cloud Integration & Real-Time Data (Phase 1, 2, 3)

**What was built:**

1.  **Custom React Hooks (Phase 1 Completed)**
    *   `useTasks`: Fetches tasks with filters (status, priority, assignee), real-time listeners, and search support. Includes `useTaskStats` for dashboard metrics.
    *   `useEmployees`: Manages employee data with role/availability filtering and real-time status updates.
    *   `useNotifications`: Real-time notification feed for current user with unread count.
    *   `useMessages`: Fetches chat history for specific tasks with real-time updates.
    *   All hooks use **React Query** for caching and **Firestore `onSnapshot`** for live updates.

2.  **Firestore Infrastructure (Phase 2.1 Completed)**
    *   **Security Rules** (`firestore.rules`): Implemented RBAC. Admins/Managers have full access; Employees can read all but only update their own profiles/tasks.
    *   **Indexes** (`firestore.indexes.json`): Defined composite indexes for complex queries (e.g., sorting tasks by priority/deadline).
    *   **Seeding Utility** (`lib/firebase/seed.ts`): Idempotent script to populate Firestore with the existing mock data for testing.
    *   **Configuration** (`firebase.json`): Linked rules and indexes.

3.  **UI Migration to Real Data (Phase 3)**
    *   **Dashboard Overview**: Connected to `useTasks` and `useEmployees`. Live metrics, recent activity feed, and team status now reflect Firestore data. Added "Seed Sample Data" button for zero-state.
    *   **Tasks Page**: Converted to use `useTasks`. Grid/List views and Stats bar now use live data.
    *   **Analytics Page**: Connected to `useTasks` and `useEmployees`. Charts, graphs, and performance tables now compute from real Firestore data.
    *   **Sidebar & Header**: Notification badge and task counts now update in real-time.

**Files created/modified:**
```
website/
├── hooks/
│   ├── useTasks.ts           [NEW] Task management hooks
│   ├── useEmployees.ts       [NEW] Employee management hooks
│   ├── useNotifications.ts   [NEW] Notification hooks
│   └── useMessages.ts        [NEW] Chat message hooks
├── lib/
│   └── firebase/
│       └── seed.ts           [NEW] Data seeding utility
├── app/
│   └── dashboard/
│       ├── page.tsx          [MODIFIED] Connected to real hooks
│       ├── tasks/
│       │   └── page.tsx      [MODIFIED] Connected to real hooks
│       └── analytics/
│           └── page.tsx      [MODIFIED] Connected to live stats
├── components/
│   └── layout/
│       ├── Header.tsx        [MODIFIED] Real notification count
│       └── Sidebar.tsx       [MODIFIED] Real task counts
├── firestore.rules           [NEW] Security rules
├── firestore.indexes.json    [NEW] Database indexes
└── firebase.json             [NEW] Project config
```

**What's next:**
1.  **Connect remaining UI**: Update `WhatsAppPanel` and `CreateTaskModal` to use new hooks.
2.  **Task Detail View**: Build the `[id]` page.
3.  **Cloud Functions**: Implement backend logic for assignments and notifications.
