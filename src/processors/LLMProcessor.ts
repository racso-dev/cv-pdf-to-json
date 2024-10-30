import fs from 'fs'
import Processor from './Processor'
import { ProcessorOptions, SanitizedProcessorResult, ParsedProcessorResult } from '../types'

abstract class LLMProcessor extends Processor {
  constructor(options: ProcessorOptions = {}) {
    super(options)
  }

  abstract sanitize(prompt: string): Promise<SanitizedProcessorResult>
  abstract parse(prompt: string): Promise<ParsedProcessorResult>

  protected _writeOutput(data: string, outputPath?: string) {
    if (outputPath) {
      fs.writeFileSync(outputPath, data)
    }
  }
}

export default LLMProcessor
