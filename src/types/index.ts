export interface ProcessorOptions {
  debug?: boolean
  outputJsonPath?: string
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
  location: string
  type: ContractType
  startDate: number
  endDate: number
  duration: number // in months
  ongoing: boolean
  description: string
  associatedSkills: string[]
}

export interface Education {
  degree: string
  institution: string
  location: string
  startDate: number
  endDate: number
  duration: number // in months
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

export type ParsedProcessorResult = ProcessorResult<CvData>

export interface PdfProcessor {
  process(pdfPath: string, outputPath?: string): Promise<ParsedProcessorResult>
}

export interface DocumentProcessorOptions extends ProcessorOptions {
  processor: PdfProcessor
}

export interface DirectoryProcessOptions {
  recursive?: boolean
  filePattern?: string
}
