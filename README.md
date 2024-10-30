# CV PDF to JSON

Extract and process CV data from PDF files with Claude AI integration. This library provides a robust pipeline for converting PDF resumes into structured JSON data, with intermediate text processing steps.

## Features

- Text sanitization using Claude AI
- Structured JSON output of CV data using Claude AI
- Support for processing single PDF file or directory of PDF files
- Support for saving raw, sanitized, and structured JSON outputs to specified directories
- Debug mode for detailed processing insights

## Installation

```bash
npm install @racsodev/cv-pdf-to-json
```

## Basic Usage

```typescript
import { createPdfExtractor } from '@racsodev/cv-pdf-to-json'
import path from 'path'

// Initialize the PDF extractor
const extractor = createPdfExtractor({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
})

// Process a single file
const result = await extractor.process('path/to/cv.pdf')
console.log('Processing Result:', result)

// Process a directory
const results = await extractor.processDirectory('path/to/cvs')
console.log('Processing Results:', results)
```

## Advanced Usage

For more control over the extraction process, you can use individual components:

```typescript
import {
  DocumentProcessor,
  PdfParseExtractor,
  ClaudeProcessor,
  type CvData,
  type Experience,
  type Education,
  type Language,
  ContractType,
  LanguageLevel,
} from '@racsodev/cv-pdf-to-json'

// Initialize PDF extractor
const pdfExtractor = new PdfParseExtractor()

// Initialize Claude AI processor
const llmProcessor = new ClaudeProcessor({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// Create custom document processor
const processor = new DocumentProcessor({
  extractor: pdfExtractor,
  llmProcessor,
  outputJsonPath: './outputs/json',
  outputRawTxtPath: './outputs/raw',
  outputSanitizedTxtPath: './outputs/sanitized',
  debug: true,
})

// Custom processing pipeline
async function customProcessCV(pdfPath: string) {
  // Extract text from PDF
  const extractionResult = await pdfExtractor.extract(pdfPath, { pages: true })

  // Sanitize the extracted text
  const sanitizedResult = await llmProcessor.sanitize(sanitizePrompt({ textToSanitize: extractionResult.text }))

  if (!sanitizedResult.success || !sanitizedResult.data) {
    return { success: false, error: 'Sanitization failed' }
  }

  // Parse the sanitized text into structured data
  const parsedResult = await llmProcessor.parse(parsePrompt({ cvTextData: sanitizedResult.data }))

  return parsedResult
}

// Use the custom pipeline
const result = await customProcessCV('path/to/cv.pdf')
if (result.success && result.data) {
  const cvData: CvData = result.data
  console.log('Extracted CV Data:', cvData)
}
```

## Output Format

The processor returns data in the following format:

```typescript
interface CvData {
  lastName: string
  firstName: string
  address: string
  email: string
  phone: string
  linkedin: string
  github: string
  personalWebsite: string
  professionalSummary: string
  school: string
  schoolLowerCase: string
  promotionYear: number
  professionalExperiences: Experience[]
  otherExperiences: Experience[]
  educations: Education[]
  hardSkills: string[]
  softSkills: string[]
  languages: Language[]
  publications: string[]
  distinctions: string[]
  hobbies: string[]
  references: string[]
}

interface Experience {
  companyName?: string
  title?: string
  roleName?: string
  location: string
  type: ContractType
  startDate: string
  endDate: string
  ongoing: boolean
  description: string
  associatedSkills: string[]
  duration: number
}

interface Education {
  degree: string
  institution: string
  location: string
  startDate: string
  endDate: string
  ongoing: boolean
  description: string
  associatedSkills: string[]
  duration: number
}

interface Language {
  language: string
  level: LanguageLevel
}

enum ContractType {
  PERMANENT_CONTRACT = 'PERMANENT_CONTRACT',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  FREELANCE = 'FREELANCE',
  FIXED_TERM_CONTRACT = 'FIXED_TERM_CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  APPRENTICESHIP = 'APPRENTICESHIP',
  // ... other contract types
}

enum LanguageLevel {
  BASIC_KNOWLEDGE = 'BASIC_KNOWLEDGE',
  LIMITED_PROFESSIONAL = 'LIMITED_PROFESSIONAL',
  PROFESSIONAL = 'PROFESSIONAL',
  FULL_PROFESSIONAL = 'FULL_PROFESSIONAL',
  NATIVE_BILINGUAL = 'NATIVE_BILINGUAL',
}
```

## Development Setup

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Anthropic API key
ANTHROPIC_API_KEY=your_api_key_here
```

3. Process documents:

```bash
npm run process <file-path>
```

This will process the specified PDF file or directory and generate outputs in the configured directories.

## Project Structure

- `src/` - Source code directory
  - `extractors/` - PDF text extraction implementations
    - `Extractor.ts` - Base extractor class
    - `PdfParseExtractor.ts` - PDF-parse based extractor
  - `processors/` - Document processing pipeline
    - `Processor.ts` - Base processor class
    - `DocumentProcessor.ts` - Main document processing logic
    - `ClaudeProcessor.ts` - Claude AI integration
    - `LLMProcessor.ts` - Language model processor interface
  - `types/` - TypeScript type definitions
  - `utils/` - Utility functions for text processing and file handling

## Requirements

- Node.js >= 18.4.2
- Anthropic API key for Claude AI integration

## License

Apache-2.0
