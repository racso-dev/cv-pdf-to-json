import { CvData, Experience, Education, Language } from '../types'

export class CvDataBuilder {
  private data: CvData = {
    lastName: '',
    firstName: '',
    address: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    personalWebsite: '',
    professionalSummary: '',
    jobTitle: '',
    school: '',
    schoolLowerCase: '',
    promotionYear: 0,
    professionalExperiences: [],
    otherExperiences: [],
    educations: [],
    hardSkills: [],
    softSkills: [],
    languages: [],
    publications: [],
    distinctions: [],
    hobbies: [],
    references: [],
  }

  private deduplicateArray<T>(arr: T[]): T[] {
    return Array.from(new Set(arr))
  }

  private deduplicateObjectArray<T extends Record<string, any>>(arr: T[]): T[] {
    const seen = new Set()
    return arr.filter((item) => {
      const key = JSON.stringify(item)
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  withPersonalInfo(info: Pick<CvData, 'lastName' | 'firstName' | 'address' | 'email' | 'phone'>) {
    Object.assign(this.data, info)
    return this
  }

  withSocialLinks(info: Pick<CvData, 'linkedin' | 'github' | 'personalWebsite'>) {
    Object.assign(this.data, info)
    return this
  }

  withProfessionalInfo(info: Pick<CvData, 'professionalSummary' | 'jobTitle'>) {
    Object.assign(this.data, info)
    return this
  }

  withSchoolInfo(info: Pick<CvData, 'school' | 'schoolLowerCase' | 'promotionYear'>) {
    Object.assign(this.data, info)
    return this
  }

  withExperiences(professionalExperiences: Experience[], otherExperiences: Experience[]) {
    this.data.professionalExperiences = this.deduplicateObjectArray([...this.data.professionalExperiences, ...professionalExperiences])
    this.data.otherExperiences = this.deduplicateObjectArray([...this.data.otherExperiences, ...otherExperiences])
    return this
  }

  withEducation(educations: Education[]) {
    this.data.educations = this.deduplicateObjectArray([...this.data.educations, ...educations])
    return this
  }

  withSkills(hardSkills: string[], softSkills: string[]) {
    this.data.hardSkills = this.deduplicateArray([...this.data.hardSkills, ...hardSkills])
    this.data.softSkills = this.deduplicateArray([...this.data.softSkills, ...softSkills])
    return this
  }

  withLanguages(languages: Language[]) {
    this.data.languages = this.deduplicateObjectArray([...this.data.languages, ...languages])
    return this
  }

  withExtras(info: Pick<CvData, 'publications' | 'distinctions' | 'hobbies' | 'references'>) {
    if (info.publications) {
      this.data.publications = this.deduplicateArray([...this.data.publications, ...info.publications])
    }
    if (info.distinctions) {
      this.data.distinctions = this.deduplicateArray([...this.data.distinctions, ...info.distinctions])
    }
    if (info.hobbies) {
      this.data.hobbies = this.deduplicateArray([...this.data.hobbies, ...info.hobbies])
    }
    if (info.references) {
      this.data.references = this.deduplicateArray([...this.data.references, ...info.references])
    }
    return this
  }

  build(): CvData {
    return this.data
  }
}
