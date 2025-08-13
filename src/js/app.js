// Main Application Module
// Handles UI interactions and coordinates OCR processing

class PassportReaderApp {
    constructor() {
        this.ocrProcessor = new OCRProcessor();
        this.passportParser = new PassportParser();
        this.currentImage = null;
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // Upload elements
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.previewSection = document.getElementById('previewSection');
        this.previewImage = document.getElementById('previewImage');
        this.processBtn = document.getElementById('processBtn');
        
        // Processing elements
        this.processingSection = document.getElementById('processingSection');
        this.progressFill = document.getElementById('progressFill');
        this.statusText = document.getElementById('statusText');
        
        // Results elements
        this.resultsSection = document.getElementById('resultsSection');
        this.rawTextArea = document.getElementById('rawText');
        this.mrzDataPre = document.getElementById('mrzData');
        
        // Data fields
        this.dataFields = {
            fullName: document.getElementById('fullName'),
            passportNumber: document.getElementById('passportNumber'),
            nationality: document.getElementById('nationality'),
            dateOfBirth: document.getElementById('dateOfBirth'),
            gender: document.getElementById('gender'),
            issueDate: document.getElementById('issueDate'),
            expiryDate: document.getElementById('expiryDate')
        };
        
        // Metrics
        this.processingTimeSpan = document.getElementById('processingTime');
        this.confidenceSpan = document.getElementById('confidence');
        
        // Actions
        this.exportBtn = document.getElementById('exportBtn');
        this.newScanBtn = document.getElementById('newScanBtn');
    }

    attachEventListeners() {
        // Upload listeners
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });
        
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                this.handleFile(e.dataTransfer.files[0]);
            }
        });
        
        // Process button
        this.processBtn.addEventListener('click', () => this.processPassport());
        
        // Action buttons
        this.exportBtn.addEventListener('click', () => this.exportData());
        this.newScanBtn.addEventListener('click', () => this.resetApp());
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.handleFile(file);
        }
    }

    handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentImage = e.target.result;
            this.previewImage.src = this.currentImage;
            this.previewSection.style.display = 'block';
            this.hideResults();
        };
        reader.readAsDataURL(file);
    }

    async processPassport() {
        if (!this.currentImage) return;

        this.showProcessing();
        this.hideResults();

        try {
            // Process image with OCR
            const ocrResult = await this.ocrProcessor.processImage(
                this.currentImage,
                (progress) => this.updateProgress(progress)
            );

            // Parse the extracted text
            const parsedData = this.passportParser.parseText(ocrResult.text);
            
            // Debug: Log what we got
            console.log('OCR Text:', ocrResult.text);
            console.log('Parsed Data:', parsedData);

            // Display results
            this.displayResults(ocrResult, parsedData);

        } catch (error) {
            console.error('Processing error:', error);
            alert('Error processing passport: ' + error.message);
        } finally {
            this.hideProcessing();
        }
    }

    updateProgress(progress) {
        if (progress.progress) {
            const percentage = Math.round(progress.progress * 100);
            this.progressFill.style.width = percentage + '%';
        }
        if (progress.message) {
            this.statusText.textContent = progress.message;
        }
    }

    displayResults(ocrResult, parsedData) {
        // Show raw OCR text
        this.rawTextArea.value = ocrResult.text;

        // Show parsed data
        for (const [field, element] of Object.entries(this.dataFields)) {
            element.value = parsedData[field] || 'Not detected';
        }

        // Show MRZ data if found
        if (parsedData.mrzLines && parsedData.mrzLines.length > 0) {
            this.mrzDataPre.textContent = parsedData.mrzLines.join('\n');
            this.mrzDataPre.style.display = 'block';
        } else {
            this.mrzDataPre.textContent = 'No MRZ data detected';
            this.mrzDataPre.style.display = 'block';
        }

        // Show metrics
        this.processingTimeSpan.textContent = ocrResult.processingTime.toFixed(2) + 's';
        this.confidenceSpan.textContent = Math.round(ocrResult.confidence) + '%';
        
        // Update status
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = 'Success';
            statusElement.className = 'metric-value metric-success';
        }

        // Show results section
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    exportData() {
        const data = {
            extractedData: {},
            rawText: this.rawTextArea.value,
            processingTime: this.processingTimeSpan.textContent,
            confidence: this.confidenceSpan.textContent,
            timestamp: new Date().toISOString()
        };

        // Collect field data
        for (const [field, element] of Object.entries(this.dataFields)) {
            data.extractedData[field] = element.value;
        }

        // Convert to JSON
        const jsonData = JSON.stringify(data, null, 2);

        // Download as file
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `passport_data_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    resetApp() {
        // Clear current image
        this.currentImage = null;
        this.fileInput.value = '';

        // Hide sections
        this.previewSection.style.display = 'none';
        this.resultsSection.style.display = 'none';

        // Clear fields
        for (const element of Object.values(this.dataFields)) {
            element.value = '';
        }

        // Clear other data
        this.rawTextArea.value = '';
        this.mrzDataPre.textContent = '';

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showProcessing() {
        this.processBtn.disabled = true;
        this.processingSection.style.display = 'block';
        this.progressFill.style.width = '0%';
    }

    hideProcessing() {
        this.processBtn.disabled = false;
        this.processingSection.style.display = 'none';
    }

    hideResults() {
        this.resultsSection.style.display = 'none';
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if Tesseract is available
    let checkCount = 0;
    const checkTesseract = setInterval(() => {
        checkCount++;
        
        if (typeof Tesseract !== 'undefined') {
            clearInterval(checkTesseract);
            // Create app instance
            window.passportReaderApp = new PassportReaderApp();
            console.log('Passport Reader AI initialized successfully');
        } else if (checkCount > 20) { // Wait up to 10 seconds
            clearInterval(checkTesseract);
            alert('Failed to load OCR library. Please check your internet connection and refresh the page.\n\nTip: Try using a local web server by running ./start.sh');
            
            // Show manual instructions
            document.querySelector('.app-container').innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <h2>⚠️ OCR Library Failed to Load</h2>
                    <p>This usually happens due to CORS restrictions when opening the file directly.</p>
                    <h3>Solution:</h3>
                    <ol style="text-align: left; max-width: 500px; margin: 20px auto;">
                        <li>Open terminal in the project folder</li>
                        <li>Run: <code>./start.sh</code></li>
                        <li>Open: <a href="http://localhost:3000">http://localhost:3000</a></li>
                    </ol>
                    <p>Or use any local web server to serve the files.</p>
                </div>
            `;
        }
    }, 500);
});