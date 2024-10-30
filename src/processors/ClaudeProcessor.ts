import { Anthropic } from '@anthropic-ai/sdk'
import LLMProcessor from './LLMProcessor'
import { ProcessorOptions, SanitizedProcessorResult, ParsedProcessorResult, CvData, ProcessorResult } from '../types'

interface ClaudeProcessorOptions extends ProcessorOptions {
  apiKey: string
  baseUrl?: string
}

class ClaudeProcessor extends LLMProcessor {
  private anthropic: Anthropic

  constructor(options: ClaudeProcessorOptions) {
    super(options)
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
    // Check for partial data
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

  private mergePartialData(existing: Partial<CvData> | null, partial: Partial<CvData>): Partial<CvData> {
    if (!existing) return partial

    const merged: Partial<CvData> = { ...existing }

    // Type-safe array merging for each array field
    if (partial.professionalExperiences) {
      merged.professionalExperiences = [...(existing.professionalExperiences || []), ...partial.professionalExperiences]
    }
    if (partial.otherExperiences) {
      merged.otherExperiences = [...(existing.otherExperiences || []), ...partial.otherExperiences]
    }
    if (partial.educations) {
      merged.educations = [...(existing.educations || []), ...partial.educations]
    }
    if (partial.hardSkills) {
      merged.hardSkills = [...(existing.hardSkills || []), ...partial.hardSkills]
    }
    if (partial.softSkills) {
      merged.softSkills = [...(existing.softSkills || []), ...partial.softSkills]
    }
    if (partial.languages) {
      merged.languages = [...(existing.languages || []), ...partial.languages]
    }
    if (partial.publications) {
      merged.publications = [...(existing.publications || []), ...partial.publications]
    }
    if (partial.distinctions) {
      merged.distinctions = [...(existing.distinctions || []), ...partial.distinctions]
    }
    if (partial.hobbies) {
      merged.hobbies = [...(existing.hobbies || []), ...partial.hobbies]
    }
    if (partial.references) {
      merged.references = [...(existing.references || []), ...partial.references]
    }

    // Merge scalar fields
    if (partial.lastName) merged.lastName = partial.lastName
    if (partial.firstName) merged.firstName = partial.firstName
    if (partial.address) merged.address = partial.address
    if (partial.email) merged.email = partial.email
    if (partial.phone) merged.phone = partial.phone
    if (partial.linkedin) merged.linkedin = partial.linkedin
    if (partial.github) merged.github = partial.github
    if (partial.personalWebsite) merged.personalWebsite = partial.personalWebsite
    if (partial.professionalSummary) merged.professionalSummary = partial.professionalSummary
    if (partial.school) merged.school = partial.school
    if (partial.schoolLowerCase) merged.schoolLowerCase = partial.schoolLowerCase
    if (partial.promotionYear) merged.promotionYear = partial.promotionYear

    return merged
  }

  async process<T>(text: string): Promise<ProcessorResult<T>> {
    throw new Error('Use sanitize() or parse() methods instead of process()')
  }

  async sanitize(prompt: string): Promise<SanitizedProcessorResult> {
    try {
      let sanitizedText = ''
      let messageHistory: Array<{
        role: 'user' | 'assistant'
        content: string
      }> = []
      let shouldContinue

      do {
        messageHistory.push({
          role: 'user',
          content: messageHistory.length === 0 ? prompt : 'continue',
        })
        const message = await this.anthropic.beta.promptCaching.messages.create({
          max_tokens: 8192,
          messages: messageHistory,
          model: 'claude-3-5-sonnet-latest',
        })

        const textContent = message.content.find((block) => block.type === 'text')

        const rawResponse = textContent?.text || ''
        messageHistory.push({ role: 'assistant', content: rawResponse })

        if (this.debug) {
          console.log('\n=== Raw answer from Claude ===')
          console.log(rawResponse)
          console.log('===============================\n')
        }

        const { text: extractedText, shouldContinueCmd } = this.extractSanitizedText(rawResponse)

        sanitizedText += extractedText
        shouldContinue = shouldContinueCmd
      } while (messageHistory.length < 10 && shouldContinue)

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
      let messageHistory: Array<{
        role: 'user' | 'assistant'
        content: string
      }> = []
      let shouldContinue
      let accumulatedData: Partial<CvData> | null = null

      do {
        messageHistory.push({
          role: 'user',
          content: messageHistory.length === 0 ? prompt : 'continue',
        })
        const message = await this.anthropic.beta.promptCaching.messages.create({
          max_tokens: 8192,
          messages: messageHistory,
          model: 'claude-3-5-sonnet-latest',
        })

        const textContent = message.content.find((block) => block.type === 'text')

        const rawResponse = textContent?.text || ''
        messageHistory.push({ role: 'assistant', content: rawResponse })

        if (this.debug) {
          console.log('\n=== Raw answer from Claude ===')
          console.log(rawResponse)
          console.log('===============================\n')
        }

        const { shouldContinueCmd, partialData } = this.extractCvPartialData(rawResponse)

        accumulatedData = this.mergePartialData(accumulatedData, partialData)
        shouldContinue = shouldContinueCmd
      } while (messageHistory.length < 15 && shouldContinue)

      if (!this.isCompleteCvData(accumulatedData)) {
        return {
          success: false,
          error: 'Incomplete CV data received',
        }
      }

      return {
        success: true,
        data: accumulatedData,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }
    }
  }

  private isCompleteCvData(data: Partial<CvData> | null): data is CvData {
    if (!data) return false

    const requiredFields: (keyof CvData)[] = [
      'lastName',
      'firstName',
      'address',
      'email',
      'phone',
      'linkedin',
      'github',
      'personalWebsite',
      'professionalSummary',
      'school',
      'schoolLowerCase',
      'promotionYear',
      'professionalExperiences',
      'otherExperiences',
      'educations',
      'hardSkills',
      'softSkills',
      'languages',
      'publications',
      'distinctions',
      'hobbies',
      'references',
    ]

    return requiredFields.every((field) => field in data)
  }
}

export default ClaudeProcessor
