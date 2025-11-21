// Calendar API Integration (Google Calendar & Outlook Calendar)
class CalendarAPI {
    // Google Calendar Integration
    static async connectGoogle(clientId, events) {
        if (!clientId) {
            throw new Error('Google Client ID is required. Please configure it in settings.');
        }

        try {
            // Load Google API client library dynamically
            await this.loadGoogleAPI();

            // Initialize Google API client
            await gapi.client.init({
                apiKey: '', // API key can be optional with OAuth
                clientId: clientId,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
                scope: 'https://www.googleapis.com/auth/calendar.events'
            });

            // Sign in user
            const authInstance = gapi.auth2.getAuthInstance();
            if (!authInstance.isSignedIn.get()) {
                await authInstance.signIn();
            }

            // Add each event to Google Calendar
            for (const event of events) {
                await this.addGoogleEvent(event);
            }

            return true;

        } catch (error) {
            console.error('Google Calendar error:', error);
            throw new Error('Failed to connect to Google Calendar: ' + error.message);
        }
    }

    static async addGoogleEvent(event) {
        const startDateTime = this.getGoogleDateTime(event.date, event.time);
        const endDateTime = this.getGoogleEndDateTime(event.date, event.time);

        const googleEvent = {
            summary: event.title,
            description: event.description || '',
            start: event.time ? {
                dateTime: startDateTime,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            } : {
                date: event.date
            },
            end: event.time ? {
                dateTime: endDateTime,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            } : {
                date: this.addDays(event.date, 1)
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },  // 1 day before
                    { method: 'popup', minutes: 24 * 60 },  // 1 day before
                    { method: 'email', minutes: 7 * 24 * 60 }  // 1 week before
                ]
            }
        };

        const request = gapi.client.calendar.events.insert({
            calendarId: 'primary',
            resource: googleEvent
        });

        return await request;
    }

    static getGoogleDateTime(date, time) {
        if (!time) return date;

        const dateTime = new Date(date + 'T' + time);
        return dateTime.toISOString();
    }

    static getGoogleEndDateTime(date, time) {
        if (!time) {
            return this.addDays(date, 1);
        }

        const dateTime = new Date(date + 'T' + time);
        dateTime.setHours(dateTime.getHours() + 1); // 1 hour duration
        return dateTime.toISOString();
    }

    static addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result.toISOString().split('T')[0];
    }

    static loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (typeof gapi !== 'undefined') {
                resolve();
                return;
            }

            // Load Google API script
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                gapi.load('client:auth2', resolve);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Microsoft Outlook Calendar Integration
    static async connectOutlook(clientId, events) {
        if (!clientId) {
            throw new Error('Outlook Application ID is required. Please configure it in settings.');
        }

        try {
            // Load Microsoft Graph API
            await this.loadMSAL();

            // Configure MSAL
            const msalConfig = {
                auth: {
                    clientId: clientId,
                    authority: 'https://login.microsoftonline.com/common',
                    redirectUri: window.location.origin
                }
            };

            const msalInstance = new msal.PublicClientApplication(msalConfig);

            // Login request
            const loginRequest = {
                scopes: ['Calendars.ReadWrite']
            };

            // Sign in
            let tokenResponse;
            try {
                tokenResponse = await msalInstance.loginPopup(loginRequest);
            } catch (error) {
                console.error('Outlook login error:', error);
                throw new Error('Failed to sign in to Outlook');
            }

            // Add each event to Outlook Calendar
            for (const event of events) {
                await this.addOutlookEvent(tokenResponse.accessToken, event);
            }

            return true;

        } catch (error) {
            console.error('Outlook Calendar error:', error);
            throw new Error('Failed to connect to Outlook Calendar: ' + error.message);
        }
    }

    static async addOutlookEvent(accessToken, event) {
        const startDateTime = this.getOutlookDateTime(event.date, event.time);
        const endDateTime = this.getOutlookEndDateTime(event.date, event.time);

        const outlookEvent = {
            subject: event.title,
            body: {
                contentType: 'Text',
                content: event.description || ''
            },
            start: {
                dateTime: startDateTime,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            end: {
                dateTime: endDateTime,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            isAllDay: !event.time,
            reminderMinutesBeforeStart: 1440  // 1 day before
        };

        const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(outlookEvent)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to create event');
        }

        return await response.json();
    }

    static getOutlookDateTime(date, time) {
        if (!time) {
            return date + 'T00:00:00';
        }
        return date + 'T' + time + ':00';
    }

    static getOutlookEndDateTime(date, time) {
        if (!time) {
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            return endDate.toISOString().split('T')[0] + 'T00:00:00';
        }

        const dateTime = new Date(date + 'T' + time);
        dateTime.setHours(dateTime.getHours() + 1);
        return dateTime.toISOString().split('.')[0];
    }

    static loadMSAL() {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (typeof msal !== 'undefined') {
                resolve();
                return;
            }

            // Load MSAL script
            const script = document.createElement('script');
            script.src = 'https://alcdn.msauth.net/browser/2.30.0/js/msal-browser.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Alternative: Open Google Calendar with pre-filled event (no OAuth required)
    static openGoogleCalendarLink(event) {
        const url = CalendarGenerator.generateGoogleCalendarURL(event);
        window.open(url, '_blank');
    }

    // Alternative: Generate Outlook calendar link
    static openOutlookCalendarLink(event) {
        const baseURL = 'https://outlook.live.com/calendar/0/deeplink/compose';
        const params = new URLSearchParams({
            path: '/calendar/action/compose',
            rru: 'addevent',
            subject: event.title,
            body: event.description || '',
            startdt: this.getOutlookDateTime(event.date, event.time),
            enddt: this.getOutlookEndDateTime(event.date, event.time),
            allday: event.time ? 'false' : 'true'
        });

        window.open(`${baseURL}?${params.toString()}`, '_blank');
    }
}
