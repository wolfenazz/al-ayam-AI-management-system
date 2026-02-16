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