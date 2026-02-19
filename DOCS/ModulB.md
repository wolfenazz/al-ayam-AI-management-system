# Module B: WhatsApp Task Command Center - Development Roadmap

## 1. Overview

Module B enables WhatsApp-based task management for newsroom workforce coordination. It bridges the gap between editorial dashboards and field journalists using WhatsApp Business API.

**Status:** Phase 4 (Weeks 8-10) - In Progress  
**Last Updated:** February 19, 2026

---

## 2. Implementation Roadmap

### Phase 1: Foundation ✅ COMPLETE
- [x] Database schema design
- [x] Firebase project setup
- [x] Basic UI components
- [x] Authentication system

### Phase 2: Core Features ✅ COMPLETE
- [x] Task management (CRUD)
- [x] Employee management
- [x] Dashboard interface
- [x] Validation system
- [x] Audit logging

### Phase 3: WhatsApp Integration Setup ✅ COMPLETE
- [x] WhatsApp API client (`lib/whatsapp/api.ts`)
- [x] Message templates (`lib/whatsapp/templates.ts`)
- [x] Message parser (`lib/whatsapp/parser.ts`)
- [x] Webhook handler (`app/api/webhooks/whatsapp/route.ts`)
- [x] React hooks for WhatsApp (`hooks/useWhatsApp.ts`)

### Phase 4: WhatsApp Integration (Current - Weeks 8-10)

#### Week 8: Core Connection ✅ DONE
- [x] **WhatsApp Settings Page**
  - Meta Cloud API configuration form
  - Fields: API Token, Phone Number ID, Business Account ID, Webhook Secret
  - Real-time connection testing
  - Firestore persistence
  
- [x] **TaskChat Integration**
  - Send messages via WhatsApp API
  - Toggle switch for WhatsApp delivery
  - Shows assignee info and status
  - Toast notifications for delivery status

#### Week 9: Bi-Directional Sync (IN PROGRESS)
- [x] **Real-Time Message Sync**
  - `useWhatsAppRealtime` hook with Firestore listeners
  - Live updates without page refresh
  - Updated `WhatsAppPanel` to use real messages
  - Removed mock data generation

- [ ] **Button Response Handling** ⏳ PENDING
  - Process Accept/Decline/Done buttons
  - Auto-update task status
  - Send confirmation messages
  - Create manager notifications

- [ ] **Progress Updates** ⏳ PENDING
  - Status buttons (Started, On Way, Arrived, Issue)
  - Update task timeline
  - Manager notifications

#### Week 10: Media Handling (PLANNED)
- [ ] **Media Upload**
  - Download media from WhatsApp
  - Upload to Firebase Storage
  - Create Task_Media records

- [ ] **Media Gallery**
  - Display uploaded media
  - Image preview, video/audio player
  - Document download
  - Approval workflow

---

## 3. Quick Reference: What's Implemented

### ✅ Ready for Use

| Feature | Location | Status |
|---------|----------|--------|
| WhatsApp Settings | `/dashboard/settings/integrations` | ✅ Live |
| Send Messages | TaskChat component | ✅ Live |
| Real-Time Sync | `useWhatsAppRealtime` hook | ✅ Live |
| Message Templates | `lib/whatsapp/templates.ts` | ✅ Live |
| Webhook Handler | `app/api/webhooks/whatsapp/route.ts` | ✅ Live |
| Message Parser | `lib/whatsapp/parser.ts` | ✅ Live |

### 🚧 In Development

| Feature | ETA | Priority |
|---------|-----|----------|
| Button Responses | Week 9 | High |
| Auto Status Updates | Week 9 | High |
| Media Upload | Week 10 | Medium |
| Media Gallery | Week 10 | Medium |

---

## 4. Technical Architecture

### Stack
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Firebase (Firestore, Auth, Storage)
- **WhatsApp:** Meta Cloud API (v18.0)

### Key Files

```
website/
├── app/dashboard/settings/components/
│   └── WhatsAppIntegrationSettings.tsx   ✅
├── app/dashboard/tasks/[id]/components/
│   └── TaskChat.tsx                      ✅
├── components/shared/
│   └── WhatsAppPanel.tsx                 ✅
├── app/api/webhooks/whatsapp/
│   └── route.ts                          ✅
├── hooks/
│   ├── useWhatsApp.ts                    ✅
│   └── useWhatsAppRealtime.ts            ✅
├── lib/whatsapp/
│   ├── api.ts                            ✅
│   ├── templates.ts                      ✅
│   └── parser.ts                         ✅
└── types/
    ├── task.ts                           ✅
    ├── message.ts                        ✅
    └── employee.ts                       ✅
```

---

## 5. Database Schema (Simplified)

### Tasks Collection
```typescript
{
  id: string,
  title: string,
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED',
  assignee_id: string,
  whatsapp_thread_id: string,
  // ... other fields
}
```

### Task_Messages Collection
```typescript
{
  id: string,
  task_id: string,
  sender_id: string,
  content: string,
  direction: 'INBOUND' | 'OUTBOUND',
  status: 'SENT' | 'DELIVERED' | 'READ',
  whatsapp_message_id: string,
  sent_at: timestamp
}
```

### Task_Media Collection (Week 10)
```typescript
{
  id: string,
  task_id: string,
  file_url: string,
  media_type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT',
  uploaded_at: timestamp
}
```

---

## 6. WhatsApp API Configuration

### Required Credentials
1. **API Access Token** - From Meta Developer Dashboard
2. **Phone Number ID** - From WhatsApp > API Setup
3. **Webhook Verify Token** - Custom secret for webhook validation
4. **Business Account ID** (optional) - WABA identifier

### Webhook URL
```
https://your-domain.com/api/webhooks/whatsapp
```

### Setup Steps
1. Create app at [developers.facebook.com](https://developers.facebook.com)
2. Add WhatsApp product
3. Get Phone Number ID from API Setup
4. Generate Permanent Access Token (not temporary!)
5. Configure webhook URL and verify token
6. Subscribe to events: `messages`, `message_status_updates`

---

## 7. Message Flow

### Sending (Dashboard → WhatsApp)
1. Manager types message in TaskChat
2. Message saved to Firestore (Task_Messages)
3. If WhatsApp enabled → Send via Meta API
4. Update message status (SENT → DELIVERED → READ)

### Receiving (WhatsApp → Dashboard)
1. Employee sends message on WhatsApp
2. Meta sends webhook to `/api/webhooks/whatsapp`
3. Webhook parses message, saves to Firestore
4. Firestore listener updates UI in real-time

---

## 8. Status Legend

- ✅ **Complete** - Fully implemented and tested
- 🚧 **In Progress** - Currently being worked on
- ⏳ **Pending** - Planned but not started
- ❌ **Not Started** - Future phase

---

## 9. Next Actions

### Immediate (Week 9)
1. Enhance webhook to handle button responses
2. Auto-update task status on button clicks
3. Create manager notification system

### Next (Week 10)
1. Implement media download from WhatsApp
2. Create MediaGallery component
3. Build media approval workflow

---

*For detailed technical specifications, see individual component documentation.*
