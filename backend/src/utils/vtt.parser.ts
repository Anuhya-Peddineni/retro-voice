/**
 * VTT (WebVTT) file parser for extracting text content from subtitle/transcript files.
 * Removes timing information, styling tags, and headers to produce clean text.
 */

export function parseVTT(content: string): string {
    const lines = content.split('\n');
    const textLines: string[] = [];

    let i = 0;

    // Skip the WEBVTT header and any metadata
    if (i < lines.length && lines[i].trim().startsWith('WEBVTT')) {
        i++;
    }

    // Skip NOTE blocks and other metadata
    while (i < lines.length) {
        const trimmedLine = lines[i].trim();
        if (trimmedLine.startsWith('NOTE') || trimmedLine === '') {
            // Skip NOTE lines and empty lines in metadata section
            i++;
            // If it's a NOTE, skip until we hit a blank line
            if (trimmedLine.startsWith('NOTE')) {
                while (i < lines.length && lines[i].trim() !== '') {
                    i++;
                }
                i++; // Skip the blank line after NOTE
            }
        } else if (trimmedLine.includes('-->')) {
            // This is a timing line, skip it and the next content
            i++;
            // Process the actual subtitle text that follows
            while (i < lines.length) {
                const contentLine = lines[i].trim();
                if (contentLine === '') {
                    // End of this subtitle
                    i++;
                    break;
                }
                // Extract text, removing any styling tags
                const cleanedText = cleanVTTText(contentLine);
                if (cleanedText) {
                    textLines.push(cleanedText);
                }
                i++;
            }
        } else if (trimmedLine === '') {
            // Skip empty lines between subtitles
            i++;
        } else {
            // This might be a speaker identifier or cue ID, skip it
            i++;
        }
    }

    return textLines.join('\n').trim();
}

/**
 * Remove VTT styling tags and formatting from text
 */
function cleanVTTText(text: string): string {
    let cleaned = text;

    // Remove speaker tags like <v Speaker Name>
    cleaned = cleaned.replace(/<v\s+[^>]*>/g, '');

    // Remove class/style tags like <c.className>
    cleaned = cleaned.replace(/<c[^>]*>/g, '');

    // Remove closing tags
    cleaned = cleaned.replace(/<\/[^>]*>/g, '');

    // Remove any remaining angle bracket tags
    cleaned = cleaned.replace(/<[^>]*>/g, '');

    // Unescape HTML entities
    cleaned = cleaned
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');

    return cleaned.trim();
}