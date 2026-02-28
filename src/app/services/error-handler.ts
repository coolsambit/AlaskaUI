export class ErrorHandler {
  static getErrorMessage(err: any): string {
    if (err?.status === 401) {
      return 'You do not have access to this resource. Please sign in with a valid account.';
    } else if (err?.status === 403) {
      return 'Access denied. You do not have permission to perform this action.';
    } else {
      const body = err?.error;
      if (typeof body === 'string') {
        return body;
      } else if (body?.message) {
        return body.message;
      } else if (body?.error) {
        return typeof body.error === 'string' ? body.error : JSON.stringify(body.error);
      } else if (err?.status === 0) {
        return 'Could not reach the server. Please check your network connection.';
      } else if (err?.status) {
        return `Server returned status ${err.status}: ${err.statusText || 'Unknown error'}`;
      } else if (err?.message) {
        return err.message;
      } else {
        return 'An unexpected error occurred.';
      }
    }
  }
}
