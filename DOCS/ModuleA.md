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
