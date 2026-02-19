# Firebase Cloud Functions

This directory contains all Firebase Cloud Functions for the Al-Ayyam AI Platform.

## Prerequisites

- Node.js 18 or higher
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project initialized

## Setup

1. **Install dependencies:**
   ```bash
   cd functions
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   # Copy the example config
   cp .runtimeconfig.json.example .runtimeconfig.json
   
   # Edit with your actual values
   firebase functions:config:set whatsapp.access_token="YOUR_TOKEN"
   firebase functions:config:set whatsapp.phone_number_id="YOUR_PHONE_ID"
   firebase functions:config:set whatsapp.webhook_verify_token="YOUR_VERIFY_TOKEN"
   ```

3. **Build the functions:**
   ```bash
   npm run build
   ```

## Available Functions

### WhatsApp Integration
- `whatsappWebhook` - Handles incoming WhatsApp webhook events

### Task Management
- `assignTask` - Assigns a task to an employee with intelligent matching
- `findBestEmployee` - Finds the best employee for a task
- `checkOverdueTasks` - Checks and escalates overdue tasks
- `escalateTask` - Manually escalates a task

### Notifications
- `sendNotification` - Sends multi-channel notifications
- `sendTaskNotification` - Sends task-specific notifications
- `sendEscalationNotification` - Sends escalation alerts

### Analytics
- `calculatePerformanceMetrics` - Calculates employee performance metrics
- `recalculateAllMetrics` - Recalculates all employee metrics

### Media Processing
- `processMedia` - Processes uploaded media files (Storage trigger)
- `transcribeAudio` - Transcribes audio files

### Firestore Triggers
- `onTaskCreate` - Triggered when a task is created
- `onTaskUpdate` - Triggered when a task is updated
- `onMessageCreate` - Triggered when a message is created

### Scheduled Functions
- `scheduledEscalationCheck` - Runs every 5 minutes to check for escalations
- `scheduledMetricsCalculation` - Runs daily at midnight to calculate metrics

## Deployment

### Deploy all functions:
```bash
firebase deploy --only functions
```

### Deploy specific function:
```bash
firebase deploy --only functions:whatsappWebhook
```

### Deploy with debug logging:
```bash
firebase deploy --only functions --debug
```

## Local Development

### Start emulators:
```bash
firebase emulators:start --only functions
```

### Test functions locally:
```bash
# In one terminal
firebase emulators:start --only functions

# In another terminal
curl http://localhost:5001/YOUR_PROJECT/us-central1/healthCheck
```

### Shell mode:
```bash
firebase functions:shell
```

## Logs

### View logs:
```bash
firebase functions:log
```

### View logs for specific function:
```bash
firebase functions:log --only whatsappWebhook
```

### Follow logs:
```bash
firebase functions:log --tail
```

## Environment Configuration

### Set configuration:
```bash
firebase functions:config:set whatsapp.access_token="token"
firebase functions:config:set whatsapp.phone_number_id="id"
firebase functions:config:set deepseek.api_key="key"
```

### Get configuration:
```bash
firebase functions:config:get
```

### Local configuration:
For local development, create `.runtimeconfig.json` in the functions directory:
```json
{
  "whatsapp": {
    "access_token": "your_token",
    "phone_number_id": "your_phone_id"
  }
}
```

## Testing

### Unit tests:
```bash
npm test
```

### Integration tests:
```bash
npm run test:integration
```

## Architecture

```
functions/
├── src/
│   ├── index.ts              # Main entry point
│   ├── config.ts             # Configuration management
│   ├── whatsapp/
│   │   └── webhook.ts        # WhatsApp webhook handler
│   ├── tasks/
│   │   ├── assignment.ts     # Task assignment logic
│   │   └── escalation.ts     # Escalation logic
│   ├── notifications/
│   │   └── engine.ts         # Notification engine
│   ├── analytics/
│   │   └── performance.ts    # Performance metrics
│   ├── media/
│   │   └── processor.ts      # Media processing
│   ├── triggers/
│   │   └── tasks.ts          # Firestore triggers
│   └── scheduled/
│       └── metrics.ts        # Scheduled jobs
├── package.json
└── tsconfig.json
```

## Troubleshooting

### Function deployment fails:
1. Check TypeScript compilation: `npm run build`
2. Verify all dependencies are installed: `npm install`
3. Check Firebase CLI version: `firebase --version`

### Environment variables not working:
1. Verify config is set: `firebase functions:config:get`
2. Redeploy functions after config changes
3. For local dev, ensure `.runtimeconfig.json` exists

### WhatsApp webhook not receiving messages:
1. Verify webhook URL is registered with WhatsApp Business API
2. Check webhook verification token matches
3. Check function logs for errors

## Security

- All functions require authentication (check `context.auth`)
- Role-based access control enforced
- Input validation with Zod schemas
- Audit logging for all operations

## Performance

- Functions are optimized for cold starts
- Use of Firestore batch operations where possible
- Cached calculations for performance metrics
- Efficient queries with composite indexes
