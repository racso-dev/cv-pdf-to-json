import ClaudeProcessor from './processors/ClaudeProcessor'
import DocumentProcessor from './processors/DocumentProcessor'
import { ProcessorResult, DocumentProcessorOptions, CvData, Experience, Education, Language, ContractType, LanguageLevel } from './types'

export interface PdfExtractorConfig {
  anthropicApiKey: string
  anthropicBaseUrl?: string
  debug?: boolean
  outputJsonPath?: string
}

/**
 * Creates a configured PDF extractor that processes PDFs and extracts structured data using Claude's native PDF support
 */
export function createPdfExtractor(config: PdfExtractorConfig) {
  const processor = new ClaudeProcessor({
    apiKey: config.anthropicApiKey,
    baseUrl: config.anthropicBaseUrl,
    debug: config.debug,
  })

  const processorOptions: DocumentProcessorOptions = {
    processor,
    debug: !!config.debug,
    outputJsonPath: config.outputJsonPath,
  }

  return new DocumentProcessor(processorOptions)
}

// Export types
export type { ProcessorResult, CvData, Experience, Education, Language }

// Export enums
export { ContractType, LanguageLevel }

// Export base classes for extension
export { default as ClaudeProcessor } from './processors/ClaudeProcessor'
export { default as DocumentProcessor } from './processors/DocumentProcessor'
export { default as Processor } from './processors/Processor'

// Export utilities
export { parsePrompt } from './utils/parsePrompt'
