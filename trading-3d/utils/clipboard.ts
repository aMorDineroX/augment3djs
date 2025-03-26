/**
 * Safely copy text to clipboard with fallbacks
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  // Only try clipboard API if it's available
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Clipboard API error:', error);
      return fallbackCopyToClipboard(text);
    }
  } else {
    return fallbackCopyToClipboard(text);
  }
};

/**
 * Fallback method using document.execCommand (deprecated but wider support)
 */
const fallbackCopyToClipboard = (text: string): boolean => {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make the textarea out of viewport
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (error) {
    console.error('Fallback clipboard method failed:', error);
    return false;
  }
};
