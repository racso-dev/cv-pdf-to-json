export interface ProcessorOptions {
  debug?: boolean
  outputJsonPath?: string
  outputRawTxtPath?: string
  outputSanitizedTxtPath?: string
}

export enum ContractType {
  PERMANENT_CONTRACT = 'PERMANENT_CONTRACT',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  FREELANCE = 'FREELANCE',
  FIXED_TERM_CONTRACT = 'FIXED_TERM_CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  APPRENTICESHIP = 'APPRENTICESHIP',
  PERFORMING_ARTS_INTERMITTENT = 'PERFORMING_ARTS_INTERMITTENT',
  PART_TIME_PERMANENT = 'PART_TIME_PERMANENT',
  CIVIC_SERVICE = 'CIVIC_SERVICE',
  PART_TIME_FIXED_TERM = 'PART_TIME_FIXED_TERM',
  SUPPORTED_EMPLOYMENT = 'SUPPORTED_EMPLOYMENT',
  CIVIL_SERVANT = 'CIVIL_SERVANT',
  TEMPORARY_WORKER = 'TEMPORARY_WORKER',
  ASSOCIATIVE = 'ASSOCIATIVE',
}

export enum LanguageLevel {
  BASIC_KNOWLEDGE = 'BASIC_KNOWLEDGE',
  LIMITED_PROFESSIONAL = 'LIMITED_PROFESSIONAL',
  PROFESSIONAL = 'PROFESSIONAL',
  FULL_PROFESSIONAL = 'FULL_PROFESSIONAL',
  NATIVE_BILINGUAL = 'NATIVE_BILINGUAL',
}

export interface Experience {
  companyName?: string
  title?: string
  roleName?: string
  location: string
  type: ContractType
  startDate: string
  endDate: string
  ongoing: boolean
  description: string
  associatedSkills: string[]
}

export interface Education {
  degree: string
  institution: string
  location: string
  startDate: string
  endDate: string
  ongoing: boolean
  description: string
  associatedSkills: string[]
}

export interface Language {
  language: string
  level: LanguageLevel
}

export interface CvData {
  lastName: string
  firstName: string
  address: string
  email: string
  phone: string
  linkedin: string
  github: string
  personalWebsite: string
  professionalSummary: string
  school: string
  schoolLowerCase: string
  promotionYear: number
  professionalExperiences: Experience[]
  otherExperiences: Experience[]
  educations: Education[]
  hardSkills: string[]
  softSkills: string[]
  languages: Language[]
  publications: string[]
  distinctions: string[]
  hobbies: string[]
  references: string[]
}

export interface ProcessorResult<T> {
  success: boolean
  data?: T
  error?: string | Error
}

export type SanitizedProcessorResult = ProcessorResult<string>
export type ParsedProcessorResult = ProcessorResult<CvData>

export interface ExtractorOptions {
  pages?: boolean
}

export interface PageData {
  pageNumber: number
  text: string
}

export interface ExtractionResult {
  text: string
  pages?: PageData[]
}

export interface LLMProcessor {
  sanitize(text: string): Promise<SanitizedProcessorResult>
  parse(text: string): Promise<ParsedProcessorResult>
}

export interface Extractor {
  extract(filePath: string, options?: ExtractorOptions): Promise<ExtractionResult>
  getName(): string
}

export interface DocumentProcessorOptions extends ProcessorOptions {
  extractor: Extractor
  llmProcessor?: LLMProcessor
}

export interface DirectoryProcessOptions {
  recursive?: boolean
  filePattern?: string
}
