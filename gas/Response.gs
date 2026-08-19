/**
 * Response utility for consistent JSON responses.
 *
 * Success: { success: true,  message, data, error: null }
 * Error:   { success: false, message, data: null, error }
 */
const Response = {
  success: (data, message = 'Success') => {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message,
        data: data === undefined ? null : data,
        error: null,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  },

  error: (message, error = 'Bad Request', statusCode = 400) => {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message,
        data: null,
        error,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  },
};