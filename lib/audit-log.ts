/**
 * Audit logging for sensitive operations
 * For production, send logs to external service (Datadog, LogRocket, etc.)
 */

export type AuditEventType =
    | 'AUTH_SIGN_IN'
    | 'AUTH_SIGN_OUT'
    | 'AUTH_LINK_IDENTITY'
    | 'DATA_MIGRATION'
    | 'VIDEO_UPLOAD'
    | 'VIDEO_DELETE'
    | 'LINK_DELETE'
    | 'FOLDER_DELETE'
    | 'RATE_LIMIT_EXCEEDED'
    | 'SECURITY_VIOLATION';

export interface AuditLogEntry {
    timestamp: string;
    eventType: AuditEventType;
    userId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Log an audit event
 * Currently logs to console, but should be sent to external service in production
 */
export function logAuditEvent(
    eventType: AuditEventType,
    userId?: string,
    metadata?: Record<string, unknown>
): void {
    const entry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        eventType,
        userId,
        metadata,
    };

    // Log to console (production should use external service)
    console.log('[AUDIT]', JSON.stringify(entry));

    // TODO: Send to external audit logging service
    // Examples:
    // - Datadog: datadogLogs.logger.info(JSON.stringify(entry));
    // - LogRocket: LogRocket.track(eventType, entry);
    // - Custom API: fetch('/api/audit-log', { method: 'POST', body: JSON.stringify(entry) });
}

/**
 * Log security violation
 */
export function logSecurityViolation(
    userId: string | undefined,
    violation: string,
    metadata?: Record<string, unknown>
): void {
    logAuditEvent('SECURITY_VIOLATION', userId, {
        violation,
        ...metadata,
    });
}

/**
 * Log rate limit exceeded
 */
export function logRateLimitExceeded(
    userId: string,
    action: string,
    metadata?: Record<string, unknown>
): void {
    logAuditEvent('RATE_LIMIT_EXCEEDED', userId, {
        action,
        ...metadata,
    });
}
