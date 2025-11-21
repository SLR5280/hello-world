// Calendar File Generator (ICS format)
class CalendarGenerator {
    static generateICS(events) {
        if (!events || events.length === 0) {
            throw new Error('No events to export');
        }

        // ICS file header
        let ics = 'BEGIN:VCALENDAR\n';
        ics += 'VERSION:2.0\n';
        ics += 'PRODID:-//Legal Calendar Automation//EN\n';
        ics += 'CALSCALE:GREGORIAN\n';
        ics += 'METHOD:PUBLISH\n';
        ics += 'X-WR-CALNAME:Legal Deadlines\n';
        ics += 'X-WR-TIMEZONE:America/New_York\n';

        // Add each event
        events.forEach(event => {
            ics += this.createEvent(event);
        });

        // Close calendar
        ics += 'END:VCALENDAR\n';

        return ics;
    }

    static createEvent(event) {
        const now = new Date();
        const uid = this.generateUID();

        // Parse date
        const eventDate = new Date(event.date);

        // Create date strings
        let dtstart, dtend;

        if (event.time) {
            // Event has a specific time
            const [hours, minutes] = event.time.split(':');
            eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            dtstart = this.formatDateTime(eventDate);

            // Default 1-hour duration
            const endDate = new Date(eventDate);
            endDate.setHours(endDate.getHours() + 1);
            dtend = this.formatDateTime(endDate);
        } else {
            // All-day event
            dtstart = this.formatDate(eventDate);

            const endDate = new Date(eventDate);
            endDate.setDate(endDate.getDate() + 1);
            dtend = this.formatDate(endDate);
        }

        // Build event
        let icsEvent = 'BEGIN:VEVENT\n';
        icsEvent += `UID:${uid}\n`;
        icsEvent += `DTSTAMP:${this.formatDateTime(now)}\n`;

        if (event.time) {
            icsEvent += `DTSTART:${dtstart}\n`;
            icsEvent += `DTEND:${dtend}\n`;
        } else {
            icsEvent += `DTSTART;VALUE=DATE:${dtstart}\n`;
            icsEvent += `DTEND;VALUE=DATE:${dtend}\n`;
        }

        icsEvent += `SUMMARY:${this.escapeText(event.title)}\n`;

        if (event.description) {
            icsEvent += `DESCRIPTION:${this.escapeText(event.description)}\n`;
        }

        // Add alarm (reminder) 1 day before
        icsEvent += 'BEGIN:VALARM\n';
        icsEvent += 'TRIGGER:-P1D\n';
        icsEvent += 'ACTION:DISPLAY\n';
        icsEvent += `DESCRIPTION:Reminder: ${this.escapeText(event.title)}\n`;
        icsEvent += 'END:VALARM\n';

        // Add second alarm 1 week before for important deadlines
        icsEvent += 'BEGIN:VALARM\n';
        icsEvent += 'TRIGGER:-P7D\n';
        icsEvent += 'ACTION:DISPLAY\n';
        icsEvent += `DESCRIPTION:Upcoming: ${this.escapeText(event.title)}\n`;
        icsEvent += 'END:VALARM\n';

        icsEvent += 'STATUS:CONFIRMED\n';
        icsEvent += 'SEQUENCE:0\n';
        icsEvent += 'END:VEVENT\n';

        return icsEvent;
    }

    static formatDate(date) {
        // Format: YYYYMMDD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}${month}${day}`;
    }

    static formatDateTime(date) {
        // Format: YYYYMMDDTHHMMSSZ (UTC)
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');

        return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
    }

    static generateUID() {
        // Generate a unique identifier
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `${timestamp}-${random}@legalcalendar.app`;
    }

    static escapeText(text) {
        if (!text) return '';

        return text
            .replace(/\\/g, '\\\\')   // Escape backslashes
            .replace(/;/g, '\\;')     // Escape semicolons
            .replace(/,/g, '\\,')     // Escape commas
            .replace(/\n/g, '\\n')    // Escape newlines
            .substring(0, 500);        // Limit length
    }

    static generateGoogleCalendarURL(event) {
        // Generate a Google Calendar URL for adding a single event
        const baseURL = 'https://calendar.google.com/calendar/render';
        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: event.title,
            dates: this.getGoogleDates(event),
            details: event.description || '',
            sf: 'true',
            output: 'xml'
        });

        return `${baseURL}?${params.toString()}`;
    }

    static getGoogleDates(event) {
        // Format dates for Google Calendar URL
        const startDate = new Date(event.date);

        if (event.time) {
            const [hours, minutes] = event.time.split(':');
            startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const endDate = new Date(startDate);
            endDate.setHours(endDate.getHours() + 1);

            return `${this.formatDateTime(startDate)}/${this.formatDateTime(endDate)}`;
        } else {
            // All-day event
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);

            return `${this.formatDate(startDate)}/${this.formatDate(endDate)}`;
        }
    }
}
