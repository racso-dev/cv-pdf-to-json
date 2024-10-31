import { ProcessorOptions } from './index'

export interface ClaudeConfig {
  maxTokens: number
  model: string
  temperature?: number
}

export interface ClaudeProcessorOptions extends ProcessorOptions {
  apiKey: string
  baseUrl?: string
  config?: Partial<ClaudeConfig>
}

export const DEFAULT_CLAUDE_CONFIG: ClaudeConfig = {
  maxTokens: 8192,
  model: 'claude-3-5-sonnet-latest',
  temperature: 0.1,
}
