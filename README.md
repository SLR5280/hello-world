# Legal Calendar Automation

A powerful web application designed for lawyers and law firms to automatically extract deadlines from litigation scheduling orders and create calendar entries.

## Features

- **Document Upload**: Support for PDF, DOC, DOCX, and TXT files
- **Smart Date Extraction**: Automatically identifies dates and associated events from legal documents
- **Intelligent Parsing**: Recognizes legal terminology and deadline keywords
- **Editable Results**: Review and modify extracted events before exporting
- **Multiple Export Options**:
  - Download .ICS calendar files (compatible with all calendar applications)
  - Direct integration with Google Calendar
  - Direct integration with Microsoft Outlook Calendar
- **Automated Reminders**: Pre-configured reminders (1 day and 1 week before deadlines)
- **Professional UI**: Clean, responsive design optimized for legal professionals

## Installation

### Option 1: Standalone Website

1. Clone or download this repository
2. Upload all files to your web server
3. Access `index.html` through your web browser
4. That's it! No server-side dependencies required

### Option 2: WordPress Integration

#### Method A: Direct File Upload

1. Access your WordPress installation via FTP/SFTP or File Manager
2. Navigate to your theme folder: `/wp-content/themes/your-theme/`
3. Create a new folder called `legal-calendar` and upload all project files
4. Create a new WordPress page
5. Add a Custom HTML block with the following code:

```html
<iframe
    src="/wp-content/themes/your-theme/legal-calendar/index.html"
    width="100%"
    height="1200px"
    frameborder="0"
    style="border: none;">
</iframe>
```

#### Method B: Using a WordPress Plugin

1. Install the "Insert HTML Snippet" or "Simple Custom CSS and JS" plugin
2. Upload all project files to a subfolder in your WordPress directory
3. Create a new page and embed using shortcode or custom HTML

#### Method C: Child Theme Integration

1. Create a child theme if you don't have one
2. Create a new page template in your child theme:

```php
<?php
/*
Template Name: Legal Calendar
*/
get_header(); ?>

<div id="primary" class="content-area">
    <main id="main" class="site-main">
        <?php include('legal-calendar/index.html'); ?>
    </main>
</div>

<?php get_footer(); ?>
```

3. Upload the `legal-calendar` folder to your child theme directory
4. Create a new page and select "Legal Calendar" as the template

### Option 3: Embed in Any Website

Add this iframe code to any webpage:

```html
<iframe
    src="path/to/legal-calendar/index.html"
    width="100%"
    height="1200px"
    frameborder="0">
</iframe>
```

## Configuration

### Google Calendar API Setup

To enable direct Google Calendar integration:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins: `https://yourdomain.com`
   - Add authorized redirect URIs: `https://yourdomain.com/path/to/app`
   - Copy the Client ID
5. In the application, click "Connect to Google Calendar" and enter your Client ID

### Microsoft Outlook Calendar API Setup

To enable direct Outlook Calendar integration:

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Enter application name: "Legal Calendar Automation"
5. Set supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
6. Add redirect URI:
   - Type: "Single-page application (SPA)"
   - URI: `https://yourdomain.com/path/to/app`
7. Click "Register"
8. Note the "Application (client) ID"
9. Configure API permissions:
   - Click "API permissions" > "Add a permission"
   - Select "Microsoft Graph" > "Delegated permissions"
   - Add: `Calendars.ReadWrite`
   - Click "Add permissions"
10. In the application, click "Connect to Outlook Calendar" and enter your Application ID

### Alternative: No API Configuration Required

If you don't want to configure APIs, users can still:
- Download .ICS files and manually import them into any calendar application
- The .ICS format is universally compatible with:
  - Google Calendar
  - Microsoft Outlook
  - Apple Calendar
  - Mozilla Thunderbird
  - Any other iCalendar-compatible application

## Usage

1. **Upload Document**: Drag and drop or select a litigation scheduling order
2. **Process**: Click "Process Document" to extract dates and events
3. **Review**: Check extracted events and edit as needed
4. **Add Events**: Use the "+ Add Event" button to manually add additional deadlines
5. **Export**: Choose your preferred export method:
   - Download .ICS file for manual import
   - Direct integration with Google Calendar (requires API setup)
   - Direct integration with Outlook Calendar (requires API setup)

## Supported Document Formats

- **PDF**: Full text extraction using PDF.js
- **DOC/DOCX**: Text-based Word documents
- **TXT**: Plain text files

## Date Recognition

The application recognizes various date formats commonly used in legal documents:

- "January 15, 2024"
- "Jan 15, 2024"
- "1/15/2024"
- "01/15/24"
- "2024-01-15"

It also identifies legal deadline patterns such as:
- "Deadline: [description] - [date]"
- "By [date], [action]"
- "On or before [date], [action]"
- "No later than [date], [action]"

## Legal Keywords Recognized

The intelligent extraction system recognizes legal terminology including:
- Discovery, Motion, Brief, Response, Reply
- Deposition, Trial, Hearing, Conference
- Disclosure, Interrogatories, Production, Admissions
- Expert witness, Summary judgment
- And many more...

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

Modern browsers with JavaScript enabled required.

## Security & Privacy

- **Client-side Processing**: All document processing happens in your browser
- **No Data Upload**: Documents are never uploaded to external servers
- **Local Storage Only**: API credentials are stored locally in your browser
- **No Tracking**: We don't collect or store any user data

## Troubleshooting

### Document not processing
- Ensure the file is a valid PDF, DOC, DOCX, or TXT
- Check that the document contains readable text (not scanned images)
- Try converting scanned PDFs to text-based PDFs using OCR

### No dates extracted
- Verify the document contains properly formatted dates
- Try adding events manually using the "+ Add Event" button
- Check that dates are in a recognized format

### Calendar integration not working
- Verify you've entered the correct API credentials
- Check that you've enabled the required API permissions
- Ensure your redirect URIs match your domain exactly
- Try downloading the .ICS file as an alternative

### WordPress integration issues
- Check file paths in your iframe src attribute
- Ensure all files were uploaded correctly
- Verify your theme allows custom HTML
- Try clearing browser cache

## Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **PDF Processing**: PDF.js library
- **Calendar Format**: iCalendar (.ICS) standard
- **APIs**:
  - Google Calendar API v3
  - Microsoft Graph API
- **Authentication**: OAuth 2.0

## File Structure

```
legal-calendar/
├── index.html              # Main application page
├── css/
│   └── styles.css         # Application styles
├── js/
│   ├── app.js            # Main application logic
│   ├── pdf-parser.js     # PDF text extraction
│   ├── date-extractor.js # Date and event extraction
│   ├── calendar-generator.js # ICS file generation
│   └── calendar-api.js   # Google/Outlook API integration
└── README.md             # This file
```

## Future Enhancements

Potential features for future versions:
- AI-powered extraction using LLM APIs for improved accuracy
- Support for scanned documents with OCR
- Multi-language support
- Custom reminder configurations
- Batch processing multiple documents
- Export to other calendar formats
- Integration with legal practice management software

## Support

For issues, questions, or feature requests, please contact your system administrator or the development team.

## License

Copyright © 2025. All rights reserved.

---

**Built for legal professionals by legal technology enthusiasts.**

*Always learning something new.*
