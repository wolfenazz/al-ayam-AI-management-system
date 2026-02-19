// ─── Types ─────────────────────────────────────────────────────────

export type ParsedAction =
    | { type: 'ACCEPT'; taskId: string }
    | { type: 'DECLINE'; taskId: string; reason?: string }
    | { type: 'STARTED'; taskId: string }
    | { type: 'ON_WAY'; taskId: string }
    | { type: 'ARRIVED'; taskId: string }
    | { type: 'DONE'; taskId: string }
    | { type: 'DELAY'; taskId: string; minutes?: number }
    | { type: 'ISSUE'; taskId: string; description?: string }
    | { type: 'EXTEND'; taskId: string; minutes?: number }
    | { type: 'REASSIGN'; taskId: string }
    | { type: 'CANCEL'; taskId: string }
    | { type: 'CALL_REQUEST'; taskId: string }
    | { type: 'PROGRESS_UPDATE'; taskId: string; status: string }
    | { type: 'UNKNOWN'; rawText: string };

export interface ParsedMessage {
    parsedAction: ParsedAction;
    originalText: string;
    confidence: 'high' | 'medium' | 'low';
    extractedData?: {
        location?: { lat: number; lng: number; address?: string };
        contactInfo?: { name?: string; phone?: string };
        budgetRequest?: { amount: number; description: string };
        mediaUrls?: string[];
    };
}

// ─── Button Response Parser ────────────────────────────────────────

export function parseButtonResponse(buttonId: string): ParsedAction | null {
    const parts = buttonId.split('_');
    if (parts.length < 2) return null;

    const action = parts[0];
    const taskId = parts.slice(1).join('_');

    switch (action) {
        case 'accept':
            return { type: 'ACCEPT', taskId };
        case 'decline':
            return { type: 'DECLINE', taskId };
        case 'started':
            return { type: 'STARTED', taskId };
        case 'onway':
            return { type: 'ON_WAY', taskId };
        case 'arrived':
            return { type: 'ARRIVED', taskId };
        case 'done':
            return { type: 'DONE', taskId };
        case 'delay':
            return { type: 'DELAY', taskId };
        case 'issue':
            return { type: 'ISSUE', taskId };
        case 'extend':
            return { type: 'EXTEND', taskId };
        case 'reassign':
            return { type: 'REASSIGN', taskId };
        case 'cancel':
            return { type: 'CANCEL', taskId };
        case 'call':
            return { type: 'CALL_REQUEST', taskId };
        default:
            return null;
    }
}

// ─── Text Message Parser ───────────────────────────────────────────

const ACCEPTANCE_KEYWORDS = [
    'accept', 'accepted', 'confirm', 'confirmed', 'yes', 'sure', 'okay', 'ok',
    'on it', 'will do', 'got it', 'understood', 'roger', '👍', '✅', '✓'
];

const DECLINE_KEYWORDS = [
    'decline', 'declined', 'reject', 'rejected', 'no', 'cannot', 'can\'t',
    'won\'t', 'unable', 'not available', 'busy', '❌', '🙅'
];

const STARTED_KEYWORDS = [
    'started', 'beginning', 'begin', 'working on', 'on it now',
    'in progress', 'underway', 'commencing'
];

const ON_WAY_KEYWORDS = [
    'on my way', 'on the way', 'heading there', 'leaving now',
    'en route', 'coming', 'departing'
];

const ARRIVED_KEYWORDS = [
    'arrived', 'here', 'at the location', 'at venue', 'reached',
    'on site', 'on location'
];

const DONE_KEYWORDS = [
    'done', 'finished', 'completed', 'complete', 'wrapped up',
    'all done', 'task complete', 'submitted', '✅', '🎉'
];

const DELAY_KEYWORDS = [
    'running late', 'will be late', 'delayed', 'behind schedule',
    'need more time', 'taking longer', 'stuck', 'held up'
];

const ISSUE_KEYWORDS = [
    'issue', 'problem', 'trouble', 'blocked', 'can\'t access',
    'security won\'t', 'denied entry', 'emergency', 'urgent help'
];

function matchKeywords(text: string, keywords: string[]): boolean {
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

function extractTaskId(text: string): string | null {
    const patterns = [
        /#([A-Z0-9]{8})/i,
        /task[:\s]*#?([A-Z0-9]{8})/i,
        /TSK[-_]?(\d{4}[-_]?\d{4})/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return match[1];
        }
    }

    return null;
}

function extractTimeEstimate(text: string): number | undefined {
    const patterns = [
        /(\d+)\s*(?:minutes?|mins?|m)/i,
        /(\d+)\s*(?:hours?|hrs?|h)/i,
        /(\d+)\s*(?:days?|d)/i,
        /(?:in|within|about)\s*(\d+)/i,
    ];

    for (let i = 0; i < patterns.length; i++) {
        const match = text.match(patterns[i]);
        if (match) {
            const value = parseInt(match[1], 10);
            if (i === 0) return value;
            if (i === 1) return value * 60;
            if (i === 2) return value * 60 * 24;
            return value;
        }
    }

    return undefined;
}

function extractBudgetRequest(text: string): { amount: number; description: string } | undefined {
    const patterns = [
        /need\s*(?:BD|BHD)?\s*(\d+(?:\.\d{2})?)\s*(?:BD|BHD)?\s*(?:for\s+(.+))?/i,
        /(?:budget|expense|cost)[:\s]*(\d+(?:\.\d{2})?)\s*(?:for\s+(.+))?/i,
        /(\d+(?:\.\d{2})?)\s*(?:BD|BHD)\s*(?:for\s+(.+))?/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return {
                amount: parseFloat(match[1]),
                description: match[2]?.trim() || 'Expense request',
            };
        }
    }

    return undefined;
}

function extractContactInfo(text: string): { name?: string; phone?: string } | undefined {
    const phonePattern = /(?:phone|contact|call|number)[:\s]*([+]?[\d\s-]{8,})/i;
    const namePattern = /(?:spoke to|met with|contacted|talked to)[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i;

    const result: { name?: string; phone?: string } = {};

    const phoneMatch = text.match(phonePattern);
    if (phoneMatch) {
        result.phone = phoneMatch[1].replace(/[\s-]/g, '');
    }

    const nameMatch = text.match(namePattern);
    if (nameMatch) {
        result.name = nameMatch[1];
    }

    return Object.keys(result).length > 0 ? result : undefined;
}

export function parseTextMessage(text: string, taskId?: string): ParsedMessage {
    const trimmedText = text.trim();
    const extractedTaskId = taskId || extractTaskId(trimmedText) || 'unknown';

    let parsedAction: ParsedAction;
    let confidence: 'high' | 'medium' | 'low' = 'high';

    if (matchKeywords(trimmedText, ACCEPTANCE_KEYWORDS)) {
        parsedAction = { type: 'ACCEPT', taskId: extractedTaskId };
    } else if (matchKeywords(trimmedText, DECLINE_KEYWORDS)) {
        parsedAction = { type: 'DECLINE', taskId: extractedTaskId };
    } else if (matchKeywords(trimmedText, DONE_KEYWORDS)) {
        parsedAction = { type: 'DONE', taskId: extractedTaskId };
    } else if (matchKeywords(trimmedText, STARTED_KEYWORDS)) {
        parsedAction = { type: 'STARTED', taskId: extractedTaskId };
    } else if (matchKeywords(trimmedText, ARRIVED_KEYWORDS)) {
        parsedAction = { type: 'ARRIVED', taskId: extractedTaskId };
    } else if (matchKeywords(trimmedText, ON_WAY_KEYWORDS)) {
        parsedAction = { type: 'ON_WAY', taskId: extractedTaskId };
    } else if (matchKeywords(trimmedText, DELAY_KEYWORDS)) {
        const minutes = extractTimeEstimate(trimmedText);
        parsedAction = { type: 'DELAY', taskId: extractedTaskId, minutes };
    } else if (matchKeywords(trimmedText, ISSUE_KEYWORDS)) {
        parsedAction = { type: 'ISSUE', taskId: extractedTaskId, description: trimmedText };
    } else {
        parsedAction = { type: 'UNKNOWN', rawText: trimmedText };
        confidence = 'low';
    }

    const extractedData: ParsedMessage['extractedData'] = {};

    const budgetRequest = extractBudgetRequest(trimmedText);
    if (budgetRequest) {
        extractedData.budgetRequest = budgetRequest;
        confidence = 'medium';
    }

    const contactInfo = extractContactInfo(trimmedText);
    if (contactInfo) {
        extractedData.contactInfo = contactInfo;
    }

    return {
        parsedAction,
        originalText: trimmedText,
        confidence,
        extractedData: Object.keys(extractedData).length > 0 ? extractedData : undefined,
    };
}

// ─── Full Message Parser ───────────────────────────────────────────

export interface WhatsAppIncomingMessage {
    from: string;
    id: string;
    timestamp: string;
    type: 'text' | 'button' | 'location' | 'image' | 'audio' | 'video' | 'document' | 'unknown';
    text?: { body: string };
    button?: { text: string; payload?: string };
    location?: { latitude: number; longitude: number; name?: string; address?: string };
    image?: { id: string; mime_type?: string; caption?: string };
    audio?: { id: string; mime_type?: string };
    video?: { id: string; mime_type?: string; caption?: string };
    document?: { id: string; mime_type?: string; filename?: string; caption?: string };
    context?: { from?: string; id?: string };
}

export interface ParsedWhatsAppMessage {
    senderPhone: string;
    messageId: string;
    timestamp: Date;
    messageType: string;
    parsedAction: ParsedAction | null;
    extractedData: ParsedMessage['extractedData'];
    rawContent: WhatsAppIncomingMessage;
    replyToMessageId?: string;
}

export function parseWhatsAppMessage(message: WhatsAppIncomingMessage): ParsedWhatsAppMessage {
    const parsed: ParsedWhatsAppMessage = {
        senderPhone: message.from,
        messageId: message.id,
        timestamp: new Date(parseInt(message.timestamp) * 1000),
        messageType: message.type,
        parsedAction: null,
        extractedData: {},
        rawContent: message,
        replyToMessageId: message.context?.id,
    };

    switch (message.type) {
        case 'text':
            if (message.text?.body) {
                const textResult = parseTextMessage(message.text.body);
                parsed.parsedAction = textResult.parsedAction;
                parsed.extractedData = textResult.extractedData || {};
            }
            break;

        case 'button':
            if (message.button?.payload) {
                parsed.parsedAction = parseButtonResponse(message.button.payload);
            } else if (message.button?.text) {
                const buttonResult = parseTextMessage(message.button.text);
                parsed.parsedAction = buttonResult.parsedAction;
            }
            break;

        case 'location':
            if (message.location) {
                parsed.extractedData = {
                    location: {
                        lat: message.location.latitude,
                        lng: message.location.longitude,
                        address: message.location.address || message.location.name,
                    },
                };
                parsed.parsedAction = { type: 'ARRIVED', taskId: 'unknown' };
            }
            break;

        case 'image':
        case 'video':
        case 'audio':
        case 'document':
            const mediaId = message[message.type]?.id;
            if (mediaId) {
                parsed.extractedData = {
                    mediaUrls: [mediaId],
                };
            }
            if (message.type !== 'audio') {
                const caption = (message[message.type] as { caption?: string })?.caption;
                if (caption) {
                    const captionResult = parseTextMessage(caption);
                    if (captionResult.parsedAction.type !== 'UNKNOWN') {
                        parsed.parsedAction = captionResult.parsedAction;
                    }
                }
            }
            break;

        default:
            break;
    }

    return parsed;
}

// ─── Utility Functions ─────────────────────────────────────────────

export function isValidTaskStatusTransition(
    currentStatus: string,
    actionType: ParsedAction['type']
): boolean {
    const validTransitions: Record<string, ParsedAction['type'][]> = {
        'SENT': ['ACCEPT', 'DECLINE'],
        'READ': ['ACCEPT', 'DECLINE'],
        'ACCEPTED': ['STARTED', 'ON_WAY', 'DECLINE'],
        'IN_PROGRESS': ['ARRIVED', 'DONE', 'DELAY', 'ISSUE'],
    };

    const allowedActions = validTransitions[currentStatus] || [];
    return allowedActions.includes(actionType);
}

export function getTaskStatusFromAction(action: ParsedAction): string | null {
    switch (action.type) {
        case 'ACCEPT':
            return 'ACCEPTED';
        case 'DECLINE':
            return 'REJECTED';
        case 'STARTED':
        case 'ON_WAY':
        case 'ARRIVED':
            return 'IN_PROGRESS';
        case 'DONE':
            return 'COMPLETED';
        case 'ISSUE':
            return 'REVIEW';
        default:
            return null;
    }
}
