import fs from 'fs'
import path from 'path'
import Processor from './Processor'
import { sanitizePrompt } from '../utils/sanitizePrompt'
import { parsePrompt } from '../utils/parsePrompt'
import { DocumentProcessorOptions, DirectoryProcessOptions, SanitizedProcessorResult, ParsedProcessorResult, Extractor } from '../types'
import { postProcessing, saveJson, saveRawTxt, saveSanitizedTxt } from '../utils/helper'

class DocumentProcessor extends Processor {
  private extractor: Extractor
  private llmProcessor?: DocumentProcessorOptions['llmProcessor']
  private outputJsonPath?: string
  private outputRawTxtPath?: string
  private outputSanitizedTxtPath?: string

  constructor(options: DocumentProcessorOptions) {
    super(options)
    this.extractor = options.extractor
    this.llmProcessor = options.llmProcessor
    this.outputJsonPath = options.outputJsonPath
    this.outputRawTxtPath = options.outputRawTxtPath
    this.outputSanitizedTxtPath = options.outputSanitizedTxtPath
  }

  async process(filePath: string): Promise<ParsedProcessorResult> {
    try {
      if (this.debug) {
        console.log('Processing:', path.basename(filePath))
      }

      const extractionResult = await this.extractor.extract(filePath, {
        pages: true,
      })

      const { text, pages } = extractionResult

      if (this.debug) {
        console.log('\n=== Raw extracted ===')
        if (pages) {
          pages.forEach((page) => {
            console.log(`\n--- Page ${page.pageNumber} ---`)
            console.log(page.text)
          })
        } else {
          console.log(text)
        }
        console.log('===================\n')
      }

      saveRawTxt(this.outputRawTxtPath, filePath, text)

      if (this.llmProcessor) {
        const fullText = pages ? pages.map((page) => page.text).join('\n\n') : text

        const sanitizedResult = await this.llmProcessor.sanitize(sanitizePrompt({ textToSanitize: fullText }))

        if (!sanitizedResult.success || !sanitizedResult.data) {
          return {
            success: false,
            error: sanitizedResult.error || 'Sanitization failed',
          }
        }

        saveSanitizedTxt(this.outputSanitizedTxtPath, filePath, sanitizedResult.data)

        const parsedResult = await this.llmProcessor.parse(parsePrompt({ cvTextData: sanitizedResult.data }))

        if (parsedResult.success && parsedResult.data) {
          parsedResult.data = postProcessing(parsedResult.data)
          saveJson(this.outputJsonPath, filePath, parsedResult.data)
        }

        return parsedResult
      }

      return {
        success: false,
        error: 'LLM processor not configured',
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : 'An unknown error occurred',
      }
    }
  }

  async processDirectory(inputDir: string, options: DirectoryProcessOptions = {}): Promise<ParsedProcessorResult[]> {
    try {
      const files = fs.readdirSync(inputDir)
      const results: ParsedProcessorResult[] = []

      for (const file of files) {
        const filePath = path.join(inputDir, file)

        if (fs.statSync(filePath).isDirectory()) {
          if (options.recursive) {
            const subResults = await this.processDirectory(filePath, options)
            results.push(...subResults)
          }
          continue
        }

        if (options.filePattern && !file.match(new RegExp(options.filePattern))) {
          continue
        }

        const result = await this.process(filePath)
        results.push(result)
      }

      return results
    } catch (error) {
      return [
        {
          success: false,
          error: error instanceof Error ? error : 'An unknown error occurred',
        },
      ]
    }
  }
}

export default DocumentProcessor
