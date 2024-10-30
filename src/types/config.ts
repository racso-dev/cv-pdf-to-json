import { Extractor } from './index'
import DocumentProcessor from '../processors/DocumentProcessor'

export interface ExtractionMethod {
  name: string
  documentExtractor: Extractor
  documentProcessor: DocumentProcessor | null
  description: string
}

export interface Config {
  ANTHROPIC_API_KEY: string
  DEBUG: boolean
  docsDir: string
  baseOutputDir: string
  baseJsonsDir: string
  extractionMethods: Record<string, ExtractionMethod>
}
