import PdfParseExtractor from './extractors/PdfParseExtractor'
import ClaudeProcessor from './processors/ClaudeProcessor'
import DocumentProcessor from './processors/DocumentProcessor'
import {
  ProcessorResult,
  DocumentProcessorOptions,
  CvData,
  Experience,
  Education,
  Language,
  ContractType,
  LanguageLevel,
  SanitizedProcessorResult,
  ParsedProcessorResult,
} from './types'

export interface PdfExtractorConfig {
  anthropicApiKey: string
  anthropicBaseUrl?: string
  debug?: boolean
  outputJsonPath?: string
  outputRawTxtPath?: string
  outputSanitizedTxtPath?: string
}

/**
 * Creates a configured PDF extractor that processes PDFs and extracts structured data
 */
export function createPdfExtractor(config: PdfExtractorConfig) {
  const extractor = new PdfParseExtractor({ debug: config.debug })
  const llmProcessor = new ClaudeProcessor({
    apiKey: config.anthropicApiKey,
    baseUrl: config.anthropicBaseUrl,
    debug: config.debug,
  })

  const processorOptions: DocumentProcessorOptions = {
    extractor,
    llmProcessor,
    debug: !!config.debug,
    outputJsonPath: config.outputJsonPath,
    outputRawTxtPath: config.outputRawTxtPath,
    outputSanitizedTxtPath: config.outputSanitizedTxtPath,
  }

  return new DocumentProcessor(processorOptions)
}

// Export types
export type { ProcessorResult, CvData, Experience, Education, Language, SanitizedProcessorResult, ParsedProcessorResult }
export type { ExtractionResult } from './types'
export type { Config as ExtractorConfig } from './types/config'

// Export enums
export { ContractType, LanguageLevel }

// Export base classes for extension
export { default as PdfParseExtractor } from './extractors/PdfParseExtractor'
export { default as ClaudeProcessor } from './processors/ClaudeProcessor'
export { default as DocumentProcessor } from './processors/DocumentProcessor'
export { default as LLMProcessor } from './processors/LLMProcessor'
export { default as Processor } from './processors/Processor'

// Export utilities
export { sanitizePrompt } from './utils/sanitizePrompt'
export { parsePrompt } from './utils/parsePrompt'
