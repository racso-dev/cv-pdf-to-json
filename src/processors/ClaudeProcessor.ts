import { Anthropic } from '@anthropic-ai/sdk'
import fs from 'fs'
import Processor from './Processor'
import { ProcessorResult, CvData } from '../types'
import { ClaudeProcessorOptions, ClaudeConfig, DEFAULT_CLAUDE_CONFIG } from '../types/claude'
import { CvDataBuilder } from '../utils/CvDataBuilder'
import { parsePrompt } from '../utils/parsePrompt'

class ClaudeProcessor extends Processor<CvData> {
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

  private async processWithClaude(pdfPath: string, maxIterations: number): Promise<{ role: 'assistant'; content: string }[]> {
    const messageHistory: Array<{ role: 'user' | 'assistant'; content: any[] }> = []
    let shouldContinue: boolean

    // Read the PDF file
    const pdfContent = await fs.promises.readFile(pdfPath)
    const pdfBase64 = pdfContent.toString('base64')

    // Initial message with PDF and prompt
    const initialPrompt = parsePrompt() // Empty cvTextData as we're using PDF directly

    do {
      const content =
        messageHistory.length === 0
          ? [
              {
                type: 'document',
                source: {
                  media_type: 'application/pdf',
                  type: 'base64',
                  data: pdfBase64,
                },
                cache_control: { type: 'ephemeral' },
              },
              {
                type: 'text',
                text: initialPrompt,
              },
            ]
          : [{ type: 'text', text: 'continue' }]

      messageHistory.push({
        role: 'user',
        content,
      })

      const message = await this.anthropic.beta.messages.create({
        max_tokens: this.config.maxTokens,
        model: this.config.model,
        temperature: this.config.temperature,
        messages: messageHistory as any,
        betas: ['pdfs-2024-09-25', 'prompt-caching-2024-07-31'],
      })

      const textContent = message.content.find((block) => block.type === 'text')
      const rawResponse = textContent?.text || ''
      messageHistory.push({ role: 'assistant', content: [{ type: 'text', text: rawResponse }] })

      if (this.debug) {
        console.log('\n=== Raw answer from Claude ===')
        console.log(rawResponse)
        console.log('===============================\n')
      }

      shouldContinue = rawResponse.includes('<continue_cmd/>') && !rawResponse.includes('<end_cmd/>')
    } while (messageHistory.length < maxIterations && shouldContinue)

    return messageHistory.filter((msg) => msg.role === 'assistant').map((msg) => ({ role: 'assistant' as const, content: msg.content[0].text }))
  }

  async process(pdfPath: string, outputPath?: string): Promise<ProcessorResult<CvData>> {
    try {
      const responses = await this.processWithClaude(pdfPath, 15)
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

      if (outputPath) {
        fs.writeFileSync(outputPath, JSON.stringify(cvData, null, 2))
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
