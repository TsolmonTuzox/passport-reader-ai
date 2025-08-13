// OCR Processor Module
// Handles Tesseract.js OCR operations

class OCRProcessor {
    constructor() {
        this.worker = null;
        this.isInitialized = false;
    }

    async initialize(onProgress) {
        if (this.isInitialized) return;

        try {
            // Create Tesseract worker - newer versions come pre-initialized
            this.worker = await Tesseract.createWorker('eng');
            
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize OCR:', error);
            throw new Error('Failed to initialize OCR engine');
        }
    }

    async processImage(imageUrl, onProgress) {
        if (!this.isInitialized) {
            await this.initialize(onProgress);
        }

        try {
            const startTime = Date.now();
            
            // Update progress manually
            if (onProgress) {
                onProgress({
                    status: 'processing',
                    progress: 0.5,
                    message: 'Analyzing passport image...'
                });
            }

            // Perform OCR
            const result = await this.worker.recognize(imageUrl);
            
            const processingTime = (Date.now() - startTime) / 1000;

            return {
                text: result.data.text,
                confidence: result.data.confidence,
                processingTime: processingTime,
                words: result.data.words,
                lines: result.data.lines
            };
        } catch (error) {
            console.error('OCR processing failed:', error);
            throw new Error('Failed to process image');
        }
    }

    async processForMRZ(imageUrl, onProgress) {
        if (!this.isInitialized) {
            await this.initialize(onProgress);
        }

        try {
            // Process image directly without special parameters
            const result = await this.processImage(imageUrl, onProgress);
            return result;
        } catch (error) {
            console.error('MRZ processing failed:', error);
            throw error;
        }
    }

    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
            this.isInitialized = false;
        }
    }

    // Utility method to enhance image before OCR
    async preprocessImage(imageUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas size
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw image
                ctx.drawImage(img, 0, 0);
                
                // Apply filters for better OCR
                ctx.filter = 'contrast(1.5) brightness(1.1)';
                ctx.drawImage(canvas, 0, 0);
                
                // Convert to grayscale
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                for (let i = 0; i < data.length; i += 4) {
                    const gray = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
                    data[i] = gray;
                    data[i + 1] = gray;
                    data[i + 2] = gray;
                }
                
                ctx.putImageData(imageData, 0, 0);
                
                resolve(canvas.toDataURL());
            };
            img.src = imageUrl;
        });
    }
}

// Export for use in other modules
window.OCRProcessor = OCRProcessor;