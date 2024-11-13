import fs from 'fs'
import path from 'path'
import Processor from './Processor'
import { DocumentProcessorOptions, DirectoryProcessOptions, ParsedProcessorResult } from '../types'
import { postProcessing } from '../utils/helper'

class DocumentProcessor extends Processor {
  private processor: DocumentProcessorOptions['processor']
  private outputJsonPath?: string

  constructor(options: DocumentProcessorOptions) {
    super(options)
    this.processor = options.processor
    this.outputJsonPath = options.outputJsonPath
  }

  async process(filePath: string): Promise<ParsedProcessorResult> {
    try {
      if (this.debug) {
        console.log('Processing:', path.basename(filePath))
      }

      const result = await this.processor.process(filePath)

      if (result.success && result.data) {
        result.data = postProcessing(result.data)

        if (this.outputJsonPath) {
          // Create output directory if it doesn't exist
          if (!fs.existsSync(this.outputJsonPath)) {
            fs.mkdirSync(this.outputJsonPath, { recursive: true })
          }

          // Get the original filename without extension and create the output path
          const originalName = path.basename(filePath, path.extname(filePath))
          const outputFilePath = path.join(this.outputJsonPath, `${originalName}.json`)

          // Save the JSON file
          fs.writeFileSync(outputFilePath, JSON.stringify(result.data, null, 2))
        }
      }

      return result
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
