// Date and Event Extraction Logic
class DateExtractor {
    static async extractEvents(text) {
        const events = [];

        // Common legal deadlines patterns
        const patterns = [
            // Pattern 1: "Deadline: [description] - [date]"
            /(?:deadline|due date|date)[:\s]*([^\n\r]+?)[\s-]+([A-Z][a-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/gi,

            // Pattern 2: "[Date] - [description]"
            /([A-Z][a-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})[\s:-]+([^\n\r.;]+)/gi,

            // Pattern 3: "By [date], [action]"
            /by\s+([A-Z][a-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})[,\s]+([^\n\r.;]+)/gi,

            // Pattern 4: "On or before [date], [action]"
            /(?:on or before|no later than)\s+([A-Z][a-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})[,\s]+([^\n\r.;]+)/gi,
        ];

        // Legal deadline keywords to look for
        const legalKeywords = [
            'discovery', 'motion', 'brief', 'response', 'reply', 'disclosure',
            'deposition', 'trial', 'hearing', 'conference', 'answer', 'complaint',
            'amendment', 'jury', 'pretrial', 'settlement', 'mediation', 'arbitration',
            'interrogatories', 'production', 'admissions', 'witness', 'expert',
            'statement', 'summary judgment', 'dispositive motion', 'filing'
        ];

        // Extract dates and events using patterns
        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                let date, description;

                // Determine which group is the date and which is the description
                if (this.isDateString(match[1])) {
                    date = match[1];
                    description = match[2];
                } else if (this.isDateString(match[2])) {
                    date = match[2];
                    description = match[1];
                } else {
                    continue;
                }

                // Clean up description
                description = this.cleanDescription(description);

                // Skip if description is too short or doesn't look relevant
                if (description.length < 10 || !this.isRelevantDescription(description, legalKeywords)) {
                    continue;
                }

                // Parse the date
                const parsedDate = this.parseDate(date);
                if (!parsedDate) continue;

                // Create event object
                events.push({
                    title: this.generateTitle(description),
                    date: parsedDate,
                    time: '',
                    description: description
                });
            }
        });

        // Remove duplicates
        const uniqueEvents = this.removeDuplicates(events);

        // Sort by date
        uniqueEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

        // If no events found, try a more aggressive extraction
        if (uniqueEvents.length === 0) {
            return this.fallbackExtraction(text);
        }

        return uniqueEvents;
    }

    static isDateString(str) {
        // Check if string looks like a date
        const datePatterns = [
            /^[A-Z][a-z]+\s+\d{1,2},?\s+\d{4}$/,  // January 15, 2024
            /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,        // 1/15/2024
            /^\d{4}-\d{2}-\d{2}$/                  // 2024-01-15
        ];

        return datePatterns.some(pattern => pattern.test(str.trim()));
    }

    static parseDate(dateStr) {
        try {
            // Clean the date string
            dateStr = dateStr.trim();

            // Try parsing different date formats
            let date;

            // Format: "January 15, 2024" or "January 15 2024"
            if (/^[A-Z][a-z]+\s+\d{1,2},?\s+\d{4}$/.test(dateStr)) {
                date = new Date(dateStr);
            }
            // Format: "1/15/2024" or "01/15/24"
            else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(dateStr)) {
                const parts = dateStr.split('/');
                const month = parseInt(parts[0]) - 1;
                const day = parseInt(parts[1]);
                let year = parseInt(parts[2]);

                // Handle 2-digit years
                if (year < 100) {
                    year += 2000;
                }

                date = new Date(year, month, day);
            }
            // Format: "2024-01-15"
            else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                date = new Date(dateStr);
            }

            if (date && !isNaN(date.getTime())) {
                // Format as YYYY-MM-DD for HTML date input
                return date.toISOString().split('T')[0];
            }
        } catch (error) {
            console.error('Error parsing date:', dateStr, error);
        }

        return null;
    }

    static cleanDescription(description) {
        return description
            .trim()
            .replace(/\s+/g, ' ')           // Normalize whitespace
            .replace(/^[:\-,\s]+/, '')      // Remove leading punctuation
            .replace(/[:\-,\s]+$/, '')      // Remove trailing punctuation
            .replace(/\.$/, '')             // Remove trailing period
            .slice(0, 500);                 // Limit length
    }

    static isRelevantDescription(description, keywords) {
        const lowerDesc = description.toLowerCase();

        // Check if it contains any legal keywords
        return keywords.some(keyword => lowerDesc.includes(keyword)) ||
               // Or if it contains action words
               /(file|submit|serve|disclose|complete|provide|exchange|designate)/i.test(description);
    }

    static generateTitle(description) {
        // Try to create a short title from the description
        let title = description.split(/[,;.]/)[0].trim();

        // Capitalize first letter
        title = title.charAt(0).toUpperCase() + title.slice(1);

        // Limit length
        if (title.length > 80) {
            title = title.substring(0, 77) + '...';
        }

        return title;
    }

    static removeDuplicates(events) {
        const seen = new Set();
        return events.filter(event => {
            const key = `${event.date}-${event.title}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    static fallbackExtraction(text) {
        // More aggressive extraction for difficult documents
        const events = [];
        const lines = text.split('\n');

        // Look for any dates in the text
        const dateRegex = /([A-Z][a-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/g;

        lines.forEach(line => {
            const matches = line.match(dateRegex);
            if (matches) {
                matches.forEach(dateStr => {
                    const parsedDate = this.parseDate(dateStr);
                    if (parsedDate) {
                        // Use the surrounding text as description
                        const description = line.replace(dateStr, '').trim();
                        if (description.length > 10) {
                            events.push({
                                title: this.generateTitle(description),
                                date: parsedDate,
                                time: '',
                                description: description
                            });
                        }
                    }
                });
            }
        });

        return this.removeDuplicates(events);
    }
}
