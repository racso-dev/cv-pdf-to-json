import path from 'path'
import dotenv from 'dotenv'
import { createPdfExtractor } from './index'
import fs from 'fs'

// Load environment variables from .env file
dotenv.config()

async function main() {
  // Get file path from command line arguments
  const filePath = process.argv[2]

  if (!filePath) {
    console.error('Error: Please provide a file path as an argument')
    console.error('Usage: npm run dev <file-path>')
    process.exit(1)
  }

  // Resolve the absolute path
  const absolutePath = path.resolve(filePath)

  // Create the PDF extractor with debug mode enabled
  const extractor = createPdfExtractor({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    debug: true,
    outputJsonPath: path.join(__dirname, '../outputs/jsons'),
  })

  try {
    // If the path is a directory, process all files in the directory otherwise process the single file
    if (fs.statSync(absolutePath).isDirectory()) {
      const results = await extractor.processDirectory(absolutePath)
      console.log('\nProcessing Results:\n', results)
      return
    } else {
      const result = await extractor.process(absolutePath)
      console.log('\nProcessing Result:\n', result)
    }
  } catch (error) {
    console.error('Error during processing:', error)
    process.exit(1)
  }
}

// Check for API key
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('Error: ANTHROPIC_API_KEY environment variable is required. Please check your .env file.')
  process.exit(1)
}

main().catch(console.error)
