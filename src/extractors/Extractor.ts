import { ProcessorOptions, ExtractorOptions, ExtractionResult } from '../types'

abstract class Extractor {
  protected debug: boolean

  constructor(options: ProcessorOptions = {}) {
    this.debug = options.debug ?? false
  }

  abstract extract(filePath: string, options?: ExtractorOptions): Promise<ExtractionResult>

  abstract getName(): string

  protected _logDebug(message: string): void {
    if (this.debug) {
      console.log(message)
    }
  }
}

export default Extractor
