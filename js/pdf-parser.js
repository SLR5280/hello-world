// PDF Parser using PDF.js
class PDFParser {
    static async extractText(file) {
        try {
            // Set up PDF.js worker
            if (typeof pdfjsLib !== 'undefined') {
                pdfjsLib.GlobalWorkerOptions.workerSrc =
                    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }

            // Read file as ArrayBuffer
            const arrayBuffer = await this.readFileAsArrayBuffer(file);

            // Load PDF document
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            let fullText = '';

            // Extract text from each page
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();

                // Combine text items
                const pageText = textContent.items
                    .map(item => item.str)
                    .join(' ');

                fullText += pageText + '\n\n';
            }

            return fullText;

        } catch (error) {
            console.error('Error parsing PDF:', error);
            throw new Error('Failed to parse PDF file. Please ensure it is a valid PDF.');
        }
    }

    static readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsArrayBuffer(file);
        });
    }
}
