/**
 * Error handling utilities for network requests and server responses
 * Classifies errors as retryable or non-retryable
 */

export function isRetryableError(error: any): boolean {
    // Network errors (no response) - always retry
    if (!error.response) {
        return true;
    }
    
    const status = error.response.status;
    
    // 5xx server errors - retry
    if (status >= 500 && status < 600) {
        return true;
    }
    
    // 4xx client errors - DON'T retry (bad request, validation errors, etc.)
    if (status >= 400 && status < 500) {
        return false;
    }
    
    // Other errors - retry by default
    return true;
}

export function getErrorMessage(error: any): string {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    if (error.response?.data?.error) {
        return error.response.data.error;
    }
    if (error.message) {
        return error.message;
    }
    return 'Unknown error';
}

export function isNetworkError(error: any): boolean {
    return !error.response || error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED';
}

export function getHttpStatusCode(error: any): number | null {
    return error.response?.status || null;
}

export function isClientError(error: any): boolean {
    const status = getHttpStatusCode(error);
    return status !== null && status >= 400 && status < 500;
}

export function isServerError(error: any): boolean {
    const status = getHttpStatusCode(error);
    return status !== null && status >= 500 && status < 600;
}