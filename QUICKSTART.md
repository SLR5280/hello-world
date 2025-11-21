# Quick Start Guide

Get up and running with Legal Calendar Automation in 5 minutes!

## For Testing (No Installation Required)

1. Open `index.html` in your web browser (Chrome recommended)
2. Try the sample document:
   - Click "Select File" and choose `SAMPLE_DOCUMENT.txt`
   - Click "Process Document"
   - Review the extracted deadlines
   - Click "Download .ICS File" to test the export

That's it! You now have a calendar file with all the deadlines.

## For WordPress Users

### Quick Embed Method

1. Upload the entire project folder to your WordPress server
2. Create a new page in WordPress
3. Add a Custom HTML block
4. Paste this code (update the path):

```html
<iframe
    src="/path/to/legal-calendar/index.html"
    width="100%"
    height="1200px"
    frameborder="0"
    style="border: none;">
</iframe>
```

5. Publish the page

## Features You Can Use Immediately

- Upload PDF or text documents
- Extract dates and deadlines automatically
- Edit or add new events
- Download .ICS calendar files
- Import to Google Calendar, Outlook, or Apple Calendar

## Optional: API Integration

For direct calendar integration (not required for basic use):

- See `README.md` for detailed API setup instructions
- Works with Google Calendar and Microsoft Outlook
- Requires free API credentials from Google/Microsoft

## Need Help?

- Read the full `README.md` for detailed instructions
- Check the Troubleshooting section for common issues
- Review `SAMPLE_DOCUMENT.txt` to see the expected format

## What to Try Next

1. Test with your own litigation scheduling orders
2. Customize the extracted events
3. Set up API integration for one-click calendar sync
4. Share with your team

---

**Pro Tip**: The app works entirely in your browser - no data is sent to external servers. Your documents stay private and secure.
