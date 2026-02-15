# Al-Ayyam AI Management System

A next-generation news management ecosystem that bridges automated content intelligence with human editorial workflows. The system leverages Generative AI for real-time news aggregation and synthesis while utilizing WhatsApp Integration as the primary interface for distributed workforce management.

## - Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [License](#license)
- [Contact](#contact)

## - Overview

The Al-Ayyam AI Platform is designed to automate the news cycle from discovery to publication draft, while streamlining employee task management through familiar instant messaging channels. The platform operates on a Google Cloud-Powered Architecture, utilizing Next.js for the frontend dashboard and Firebase for all backend services.

### Core Mission

To automate the news cycle from discovery to publication draft, while streamlining employee task management through familiar instant messaging channels.

## # Key Features

### - AI News Engine (Automated Aggregation)
- **Automated Content Gathering**: 24/7 monitoring of RSS feeds, news APIs, and web scraping
- **Intelligent Processing**: Multi-stage AI pipeline for fact extraction, sentiment analysis, and content synthesis
- **Multi-Source Consolidation**: Automatic deduplication and merging of duplicate news coverage
- **Professional Draft Generation**: AI-powered article creation following Al-Ayyam editorial standards
- **Real-Time Detection**: Content detection within 5 minutes of publication

### - WhatsApp Task Command Center
- **Bi-Directional Task Management**: Seamless sync between dashboard and WhatsApp conversations
- **Smart Task Dispatch**: Automatic task assignment with formatted WhatsApp messages
- **Natural Language Processing**: Parse employee responses and update task status automatically
- **Media Upload Integration**: Process photos, videos, audio, and documents sent via WhatsApp
- **Notification System**: Automated reminders, escalations, and deadline alerts

### - Dashboard & Analytics
- **Article Review Interface**: Split-view comparison of source content and AI-generated drafts
- **Task Management**: Kanban board and list views for comprehensive task tracking
- **Performance Analytics**: Real-time metrics on response time, completion rate, and news volume
- **Employee Directory**: Manage profiles, availability, and performance metrics
- **Source Configuration**: Monitor and configure news sources with health tracking

## - Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: Tailwind CSS / Material UI
- **State Management**: React Query (TanStack Query)
- **Real-time Updates**: Firebase Firestore SDK

### Backend & Database (Firebase)
- **Authentication**: Firebase Auth with RBAC
- **Database**: Firestore (NoSQL, real-time)
- **Storage**: Firebase Cloud Storage (media files)
- **Serverless**: Firebase Cloud Functions
- **Hosting**: Firebase Hosting with global CDN or Vercel
- **Analytics**: Firebase Analytics
- **Messaging**: Firebase Cloud Messaging (FCM)

### Integration APIs
- **WhatsApp Business API**: Meta/Twilio for task distribution
- **AI/LLM Services**: OpenAI API / Anthropic Claude / Google Vertex AI
- **Speech-to-Text**: Google Cloud Speech API (optional)
- **Translation**: Google Cloud Translation API (optional)

### Development & Deployment
- **CLI**: Firebase CLI
- **Monitoring**: Google Cloud Console, Cloud Monitoring, Cloud Logging
- **CI/CD**: Cloud Build
- **Version Control**: Git

## 📁 Project Structure

```
al-ayam-AI-management-system/
├── DOCS/
│   ├── document.md          # Technical Documentation
│   └── SRS.md             # Software Requirements Specification
├── LICENSE                 # Proprietary License
├── README.md              # This file
└── [Project directories to be created]
    ├── src/               # Next.js application source
    ├── public/            # Static assets
    ├── firebase/          # Firebase configuration and functions
    └── tests/            # Test files
```

## - Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Firebase account with project setup
- WhatsApp Business API access
- OpenAI/Anthropic API access
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd al-ayam-AI-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Firebase**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```

4. **Configure environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   WHATSAPP_API_KEY=your_whatsapp_api_key
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   
   OPENAI_API_KEY=your_openai_api_key
   # or
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

5. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

### Development Phases

The project is organized into four development phases:

- **Phase 1 (Months 1-3)**: Foundation - Basic dashboard, authentication, employee management
- **Phase 2 (Months 4-6)**: Integration - WhatsApp API, real-time sync, media upload
- **Phase 3 (Months 7-9)**: AI Enhancement - News aggregation, AI processing, article generation
- **Phase 4 (Months 10-12)**: Optimization - Analytics, notifications, performance tuning

For detailed implementation steps, see [`DOCS/SRS.md`](DOCS/SRS.md).

## - Documentation

- **[Technical Documentation](DOCS/document.md)** - Comprehensive technical architecture and system design
- **[Software Requirements Specification](DOCS/SRS.md)** - IEEE 29148 compliant requirements document
- **[Database Schema](DOCS/document.md#5-database-schema-structure-conceptual)** - Firestore database structure
- **[API Documentation](DOCS/document.md#4-technical-stack-implementation-details)** - Integration APIs and endpoints

## - License

This project is proprietary software licensed exclusively to Al-Ayyam Company for internal use only.

**Copyright (c) 2026 Al-Ayyam Company**

### Restrictions

- The software is licensed exclusively to Al-Ayyam Company for internal use only
- No personal or commercial use is permitted outside of Al-Ayyam Company
- Unauthorized copying, distribution, modification, reverse engineering, decompilation, or disassembly is strictly prohibited
- The software may not be sublicensed, rented, leased, or loaned to any third party

See the [LICENSE](LICENSE) file for the full license text.


---

**Note**: Devloper : Naseem al-khlifat.
