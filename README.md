# CV PDF to JSON

Extract and process CV data from PDF files with Claude AI's native PDF support. This library provides a robust pipeline for converting PDF resumes into structured JSON data.

## Features

- Direct PDF processing using Claude AI's native PDF support
- Structured JSON output of CV data
- Support for processing single PDF file or directory of PDF files
- Support for saving structured JSON outputs
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
  outputJsonPath: './outputs/json',
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
  ClaudeProcessor,
  type CvData,
  type Experience,
  type Education,
  type Language,
  ContractType,
  LanguageLevel,
} from '@racsodev/cv-pdf-to-json'

// Initialize Claude AI processor with native PDF support
const processor = new ClaudeProcessor({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// Create document processor
const documentProcessor = new DocumentProcessor({
  processor,
  outputJsonPath: './outputs/json',
  debug: true,
})

// Process CV
async function processCV(pdfPath: string) {
  const result = await documentProcessor.process(pdfPath)

  if (result.success && result.data) {
    const cvData: CvData = result.data
    console.log('Extracted CV Data:', cvData)
  }

  return result
}

// Use the processor
const result = await processCV('path/to/cv.pdf')
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

This will process the specified PDF file or directory and generate JSON outputs in the configured directory.

## Project Structure

- `src/` - Source code directory
  - `processors/` - Document processing pipeline
    - `Processor.ts` - Base processor class
    - `DocumentProcessor.ts` - Main document processing logic
    - `ClaudeProcessor.ts` - Claude AI integration with native PDF support
  - `types/` - TypeScript type definitions
  - `utils/` - Utility functions for data processing and file handling

## Requirements

- Node.js >= 18.4.2
- Anthropic API key for Claude AI integration

## License

Apache-2.0
