// Main Application Logic
class LegalCalendarApp {
    constructor() {
        this.currentFile = null;
        this.extractedEvents = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadConfig();
    }

    setupEventListeners() {
        // File upload
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const selectFileBtn = document.getElementById('selectFileBtn');
        const processBtn = document.getElementById('processBtn');

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        // Click to select file
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        selectFileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Process document
        processBtn.addEventListener('click', () => {
            this.processDocument();
        });

        // Add event button
        document.getElementById('addEventBtn').addEventListener('click', () => {
            this.addNewEvent();
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.showExportOptions();
        });

        // Export options
        document.getElementById('downloadIcsBtn').addEventListener('click', () => {
            this.downloadICSFile();
        });

        document.getElementById('googleCalendarBtn').addEventListener('click', () => {
            this.connectGoogleCalendar();
        });

        document.getElementById('outlookCalendarBtn').addEventListener('click', () => {
            this.connectOutlookCalendar();
        });

        // Start over
        document.getElementById('startOverBtn').addEventListener('click', () => {
            this.reset();
        });

        // Modal
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('saveConfigBtn').addEventListener('click', () => {
            this.saveConfig();
        });
    }

    handleFileSelect(file) {
        const allowedTypes = ['application/pdf', 'application/msword',
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                            'text/plain'];

        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
            alert('Please select a valid file (PDF, DOC, DOCX, or TXT)');
            return;
        }

        this.currentFile = file;
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileInfo').style.display = 'block';
    }

    async processDocument() {
        if (!this.currentFile) {
            alert('Please select a file first');
            return;
        }

        // Show processing section
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('processingSection').style.display = 'block';

        try {
            // Update progress: Reading document
            this.updateProgress(20, 'Reading document...');

            let text = '';
            if (this.currentFile.type === 'application/pdf' || this.currentFile.name.endsWith('.pdf')) {
                text = await PDFParser.extractText(this.currentFile);
            } else {
                text = await this.readTextFile(this.currentFile);
            }

            // Update progress: Extracting dates
            this.updateProgress(50, 'Extracting dates and events...');

            // Extract dates and events
            this.extractedEvents = await DateExtractor.extractEvents(text);

            // Update progress: Complete
            this.updateProgress(100, 'Processing complete!');

            // Wait a moment then show results
            setTimeout(() => {
                this.showResults();
            }, 500);

        } catch (error) {
            console.error('Error processing document:', error);
            alert('Error processing document: ' + error.message);
            this.reset();
        }
    }

    readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    updateProgress(percent, status) {
        document.getElementById('progressBar').style.width = percent + '%';
        document.getElementById('statusText').textContent = status;
    }

    showResults() {
        document.getElementById('processingSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';
        this.renderEvents();
    }

    renderEvents() {
        const container = document.getElementById('eventsContainer');
        container.innerHTML = '';

        this.extractedEvents.forEach((event, index) => {
            const eventEl = this.createEventElement(event, index);
            container.appendChild(eventEl);
        });
    }

    createEventElement(event, index) {
        const div = document.createElement('div');
        div.className = 'event-item fade-in';
        div.innerHTML = `
            <div class="event-header">
                <div class="event-number">${index + 1}</div>
                <div class="event-actions">
                    <button class="btn btn-small btn-secondary" onclick="app.deleteEvent(${index})">Delete</button>
                </div>
            </div>
            <div class="event-field">
                <label>Event Title</label>
                <input type="text" value="${event.title}" onchange="app.updateEvent(${index}, 'title', this.value)">
            </div>
            <div class="event-field">
                <label>Date</label>
                <input type="date" value="${event.date}" onchange="app.updateEvent(${index}, 'date', this.value)">
            </div>
            <div class="event-field">
                <label>Time (optional)</label>
                <input type="time" value="${event.time || ''}" onchange="app.updateEvent(${index}, 'time', this.value)">
            </div>
            <div class="event-field">
                <label>Description</label>
                <textarea onchange="app.updateEvent(${index}, 'description', this.value)">${event.description}</textarea>
            </div>
        `;
        return div;
    }

    updateEvent(index, field, value) {
        this.extractedEvents[index][field] = value;
    }

    deleteEvent(index) {
        if (confirm('Are you sure you want to delete this event?')) {
            this.extractedEvents.splice(index, 1);
            this.renderEvents();
        }
    }

    addNewEvent() {
        const newEvent = {
            title: 'New Event',
            date: new Date().toISOString().split('T')[0],
            time: '',
            description: ''
        };
        this.extractedEvents.push(newEvent);
        this.renderEvents();
    }

    showExportOptions() {
        if (this.extractedEvents.length === 0) {
            alert('Please add at least one event before exporting');
            return;
        }

        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('exportSection').style.display = 'block';
    }

    downloadICSFile() {
        try {
            const icsContent = CalendarGenerator.generateICS(this.extractedEvents);
            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'legal-calendar-events.ics';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert('Calendar file downloaded successfully! You can now import it into Outlook, Google Calendar, or any other calendar application.');
        } catch (error) {
            console.error('Error generating ICS file:', error);
            alert('Error generating calendar file: ' + error.message);
        }
    }

    async connectGoogleCalendar() {
        const config = this.loadConfig();
        if (!config.googleClientId) {
            this.showModal();
            return;
        }

        try {
            await CalendarAPI.connectGoogle(config.googleClientId, this.extractedEvents);
            alert('Events added to Google Calendar successfully!');
        } catch (error) {
            console.error('Error connecting to Google Calendar:', error);
            alert('Error connecting to Google Calendar: ' + error.message);
        }
    }

    async connectOutlookCalendar() {
        const config = this.loadConfig();
        if (!config.outlookClientId) {
            this.showModal();
            return;
        }

        try {
            await CalendarAPI.connectOutlook(config.outlookClientId, this.extractedEvents);
            alert('Events added to Outlook Calendar successfully!');
        } catch (error) {
            console.error('Error connecting to Outlook Calendar:', error);
            alert('Error connecting to Outlook Calendar: ' + error.message);
        }
    }

    showModal() {
        document.getElementById('apiConfigModal').style.display = 'flex';
    }

    closeModal() {
        document.getElementById('apiConfigModal').style.display = 'none';
    }

    saveConfig() {
        const config = {
            googleClientId: document.getElementById('googleClientId').value,
            outlookClientId: document.getElementById('outlookClientId').value
        };
        localStorage.setItem('legalCalendarConfig', JSON.stringify(config));
        this.closeModal();
        alert('Configuration saved successfully!');
    }

    loadConfig() {
        const configStr = localStorage.getItem('legalCalendarConfig');
        if (configStr) {
            const config = JSON.parse(configStr);
            document.getElementById('googleClientId').value = config.googleClientId || '';
            document.getElementById('outlookClientId').value = config.outlookClientId || '';
            return config;
        }
        return {};
    }

    reset() {
        this.currentFile = null;
        this.extractedEvents = [];
        document.getElementById('uploadSection').style.display = 'block';
        document.getElementById('processingSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('exportSection').style.display = 'none';
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('fileInput').value = '';
    }
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new LegalCalendarApp();
});
