// Passport Parser Module
// Handles parsing of passport text and MRZ data

class PassportParser {
    constructor() {
        this.countries = {
            'VNM': 'VIETNAM',
            'USA': 'UNITED STATES',
            'CHN': 'CHINA',
            'IND': 'INDIA',
            'GBR': 'UNITED KINGDOM',
            'FRA': 'FRANCE',
            'DEU': 'GERMANY',
            'JPN': 'JAPAN',
            'KOR': 'SOUTH KOREA',
            'THA': 'THAILAND',
            'MNG': 'MONGOLIA'
        };
    }

    parseText(text) {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        const data = {
            fullName: null,
            passportNumber: null,
            nationality: null,
            dateOfBirth: null,
            gender: null,
            issueDate: null,
            expiryDate: null,
            mrzLines: []
        };

        // Find MRZ lines
        const mrzLines = this.findMRZLines(lines);
        if (mrzLines.length > 0) {
            data.mrzLines = mrzLines;
            this.parseMRZ(mrzLines, data);
        }

        // Also try to extract from regular text
        this.parseRegularText(lines, data);
        
        // Debug log
        console.log('Parser - Found MRZ lines:', mrzLines);
        console.log('Parser - Extracted data:', data);

        return data;
    }

    findMRZLines(lines) {
        const mrzLines = [];
        
        for (const line of lines) {
            const cleanLine = line.replace(/\s+/g, '').toUpperCase();
            
            // Check for MRZ patterns
            if (cleanLine.includes('<<') || 
                cleanLine.includes('<Z<') ||
                cleanLine.includes('<L') ||
                /^P[A-Z<]/.test(cleanLine) ||
                /^E[<][0-9]/.test(cleanLine) ||
                (cleanLine.includes('MNG') && cleanLine.includes('<')) ||
                (cleanLine.length > 40 && cleanLine.match(/[A-Z0-9<]{40,}/))) {
                mrzLines.push(cleanLine);
            }
        }
        
        return mrzLines;
    }

    parseMRZ(mrzLines, data) {
        console.log('Parsing MRZ lines:', mrzLines);
        
        if (mrzLines.length >= 2) {
            const line1 = mrzLines[0];
            const line2 = mrzLines[1];

            // Extract name from line 1
            if (line1.includes('<')) {
                let namePart = line1;
                if (namePart.startsWith('PEMNG')) {
                    namePart = namePart.substring(5);
                } else if (namePart.startsWith('P<MNG')) {
                    namePart = namePart.substring(5);
                }
                
                const parts = namePart.split('<').filter(p => p && p !== 'Z' && p !== 'L');
                if (parts.length >= 2) {
                    const surname = parts[0];
                    const givenName = parts[1];
                    data.fullName = `${givenName} ${surname}`;
                }
            }

            // Extract from line 2
            if (line2.startsWith('E<') || line2.startsWith('E')) {
                // Extract passport number
                const passportMatch = line2.match(/E<?([0-9]{8,9})/);
                if (passportMatch) {
                    data.passportNumber = 'E' + passportMatch[1];
                }
                
                // Extract country code
                const countryMatch = line2.match(/[0-9]{8,9}([A-Z]{3})/);
                if (countryMatch && this.countries[countryMatch[1]]) {
                    data.nationality = this.countries[countryMatch[1]];
                }
                
                // Extract date of birth
                const dobMatch = line2.match(/[A-Z]{3}(\d{6})/);
                if (dobMatch) {
                    data.dateOfBirth = this.formatMRZDate(dobMatch[1]);
                }
                
                // Extract gender
                const genderMatch = line2.match(/\d{6}\d([MF])/);
                if (genderMatch) {
                    data.gender = genderMatch[1] === 'M' ? 'Male' : 'Female';
                }
                
                // Extract expiry date
                const expiryMatch = line2.match(/[MF](\d{6})/);
                if (expiryMatch) {
                    data.expiryDate = this.formatMRZDate(expiryMatch[1]);
                }
            }
        }
    }

    parseRegularText(lines, data) {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const upperLine = line.toUpperCase();

            // Look for passport number
            if (!data.passportNumber) {
                const passportMatch = upperLine.match(/\bE[-\s]*([0-9]{7,9})/);
                if (passportMatch) {
                    data.passportNumber = 'E' + passportMatch[1];
                }
            }

            // Look for nationality
            if (!data.nationality) {
                for (const [code, country] of Object.entries(this.countries)) {
                    if (upperLine.includes(country) || upperLine.includes(code)) {
                        data.nationality = country;
                        break;
                    }
                }
            }

            // Gender detection
            if (!data.gender) {
                if (upperLine.includes('MALE') || /\bM\b/.test(upperLine)) {
                    data.gender = 'Male';
                } else if (upperLine.includes('FEMALE') || /\bF\b/.test(upperLine)) {
                    data.gender = 'Female';
                }
            }

            // Date patterns
            const datePattern = /(\d{1,2})\s*(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s*(\d{2})/g;
            const monthMap = {
                'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
                'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
                'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
            };
            
            let match;
            while ((match = datePattern.exec(upperLine)) !== null) {
                const day = match[1].padStart(2, '0');
                const month = monthMap[match[2]];
                const year = match[3];
                
                let fullYear;
                const yearNum = parseInt(year);
                if (yearNum > 50) {
                    fullYear = '19' + year;
                } else {
                    fullYear = '20' + year;
                }
                
                const formattedDate = `${day}/${month}/${fullYear}`;
                
                // Assign dates based on context
                if (yearNum > 80 && yearNum <= 99 && !data.dateOfBirth) {
                    data.dateOfBirth = formattedDate;
                } else if (yearNum >= 20 && yearNum <= 25 && !data.issueDate) {
                    data.issueDate = formattedDate;
                } else if (yearNum >= 30 && yearNum <= 40 && !data.expiryDate) {
                    data.expiryDate = formattedDate;
                }
            }
        }
    }

    formatMRZDate(dateStr) {
        if (dateStr.length === 6) {
            const year = parseInt(dateStr.substring(0, 2));
            const month = dateStr.substring(2, 4);
            const day = dateStr.substring(4, 6);
            
            let fullYear;
            if (year > 50) {
                fullYear = 1900 + year;
            } else {
                fullYear = 2000 + year;
            }
            
            return `${day}/${month}/${fullYear}`;
        }
        return dateStr;
    }
}

// Export for use in other modules
window.PassportParser = PassportParser;