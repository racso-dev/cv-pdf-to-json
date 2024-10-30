import { ProcessorOptions, ProcessorResult } from '../types'

abstract class Processor<T = unknown> {
  protected debug: boolean

  constructor(options: ProcessorOptions = {}) {
    this.debug = options.debug ?? false
  }

  abstract process(text: string, outputPath?: string): Promise<ProcessorResult<T>>
}

export default Processor
