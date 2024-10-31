import { Anthropic } from '@anthropic-ai/sdk'
import LLMProcessor from './LLMProcessor'
import { ProcessorResult, SanitizedProcessorResult, ParsedProcessorResult, CvData } from '../types'
import { ClaudeProcessorOptions, ClaudeConfig, DEFAULT_CLAUDE_CONFIG } from '../types/claude'
import { CvDataBuilder } from '../utils/CvDataBuilder'

class ClaudeProcessor extends LLMProcessor {
  private anthropic: Anthropic
  private config: ClaudeConfig

  constructor(options: ClaudeProcessorOptions) {
    super(options)
    this.config = {
      ...DEFAULT_CLAUDE_CONFIG,
      ...options.config,
    }
    this.anthropic = new Anthropic({
      apiKey: options.apiKey,
      ...(options.baseUrl ? { baseUrl: options.baseUrl } : {}),
    })
  }

  private extractSanitizedText(response: string): {
    text: string
    shouldContinueCmd: boolean
  } {
    const sanitizedMatch = response.match(/<sanitized_text>([\s\S]*?)<\/sanitized_text>/)
    const sanitizedText = sanitizedMatch ? sanitizedMatch[1].trim() : ''
    const shouldContinueCmd = response.includes('<continue_cmd/>') && !response.includes('<end_cmd/>')
    return { text: sanitizedText, shouldContinueCmd }
  }

  private extractCvPartialData(response: string): {
    shouldContinueCmd: boolean
    partialData: Partial<CvData>
  } {
    const shouldContinueCmd = response.includes('<continue_cmd/>') && !response.includes('<end_cmd/>')
    const partialMatch = response.match(/<partial_data>([\s\S]*?)<\/partial_data>/)
    if (partialMatch) {
      try {
        return {
          shouldContinueCmd,
          partialData: JSON.parse(partialMatch[1].trim()),
        }
      } catch (error) {
        throw new Error(`Failed to parse partial CV data: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    throw new Error('No CV JSON or partial data found in response')
  }

  private async processWithClaude(prompt: string, maxIterations: number): Promise<{ role: 'assistant'; content: string }[]> {
    const messageHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
    let shouldContinue: boolean

    do {
      messageHistory.push({
        role: 'user',
        content: messageHistory.length === 0 ? prompt : 'continue',
      })

      const message = await this.anthropic.beta.promptCaching.messages.create({
        max_tokens: this.config.maxTokens,
        messages: messageHistory,
        model: this.config.model,
        temperature: this.config.temperature,
      })

      const textContent = message.content.find((block) => block.type === 'text')
      const rawResponse = textContent?.text || ''
      messageHistory.push({ role: 'assistant', content: rawResponse })

      if (this.debug) {
        console.log('\n=== Raw answer from Claude ===')
        console.log(rawResponse)
        console.log('===============================\n')
      }

      shouldContinue = rawResponse.includes('<continue_cmd/>') && !rawResponse.includes('<end_cmd/>')
    } while (messageHistory.length < maxIterations && shouldContinue)

    return messageHistory.filter((msg) => msg.role === 'assistant') as { role: 'assistant'; content: string }[]
  }

  async process<T>(text: string): Promise<ProcessorResult<T>> {
    throw new Error('Use sanitize() or parse() methods instead of process()')
  }

  async sanitize(prompt: string): Promise<SanitizedProcessorResult> {
    try {
      const responses = await this.processWithClaude(prompt, 10)
      const sanitizedText = responses.map((msg) => this.extractSanitizedText(msg.content).text).join('')

      return {
        success: true,
        data: sanitizedText,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }
    }
  }

  async parse(prompt: string): Promise<ParsedProcessorResult> {
    try {
      const responses = await this.processWithClaude(prompt, 15)
      const builder = new CvDataBuilder()

      for (const response of responses) {
        const { partialData } = this.extractCvPartialData(response.content)

        // Build CV data progressively
        if ('lastName' in partialData || 'firstName' in partialData) {
          builder.withPersonalInfo(partialData as any)
        }
        if ('linkedin' in partialData || 'github' in partialData || 'personalWebsite' in partialData) {
          builder.withSocialLinks(partialData as any)
        }
        if ('professionalSummary' in partialData) {
          builder.withProfessionalInfo(partialData as any)
        }
        if ('school' in partialData) {
          builder.withSchoolInfo(partialData as any)
        }
        if ('professionalExperiences' in partialData || 'otherExperiences' in partialData) {
          builder.withExperiences(partialData.professionalExperiences || [], partialData.otherExperiences || [])
        }
        if ('educations' in partialData) {
          builder.withEducation(partialData.educations || [])
        }
        if ('hardSkills' in partialData || 'softSkills' in partialData) {
          builder.withSkills(partialData.hardSkills || [], partialData.softSkills || [])
        }
        if ('languages' in partialData) {
          builder.withLanguages(partialData.languages || [])
        }
        if ('publications' in partialData || 'distinctions' in partialData || 'hobbies' in partialData || 'references' in partialData) {
          builder.withExtras(partialData as any)
        }
      }

      const cvData = builder.build()
      if (!cvData) {
        return {
          success: false,
          error: 'Failed to build complete CV data',
        }
      }

      return {
        success: true,
        data: cvData,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }
    }
  }
}

export default ClaudeProcessor
