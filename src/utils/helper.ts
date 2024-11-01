import path from 'path'
import fs from 'fs'

const dateFormats: Record<number, string> = {
  0: '',
  1: 'YYYY',
  2: 'YYYY-MM',
  3: 'YYYY-MM-DD',
}

const getLastDayOfMonth = (year: number, month: number): Date => {
  return new Date(Date.UTC(year, month + 1, 0))
}

const getFirstDayOfMonth = (year: number, month: number): Date => {
  return new Date(Date.UTC(year, month, 1))
}

const getFirstDayOfYear = (year: number): Date => {
  return new Date(Date.UTC(year, 0, 1))
}

const parseDateString = (dateStr: string, isEndDate: boolean, format?: string): Date => {
  // Handle empty or invalid dates
  if (!dateStr) {
    return new Date()
  }

  const parts = dateStr.split('-')
  const year = parseInt(parts[0], 10)

  if (format === 'YYYY') {
    return getFirstDayOfYear(year)
  } else if (format === 'YYYY-MM') {
    const month = parseInt(parts[1], 10) - 1 // JS months are 0-based
    return isEndDate ? getLastDayOfMonth(year, month) : getFirstDayOfMonth(year, month)
  } else {
    // Format: YYYY-MM-DD
    const month = parseInt(parts[1], 10) - 1
    const day = parseInt(parts[2], 10)
    return new Date(Date.UTC(year, month, day))
  }
}

const calculateDurationInMonths = (startDate: Date, endDate: Date, format: string): number => {
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Calculate years difference
  const yearsDiff = end.getUTCFullYear() - start.getUTCFullYear()

  // Calculate months difference
  const monthsDiff = end.getUTCMonth() - start.getUTCMonth()

  // Total months including the end month
  let duration = yearsDiff * 12 + monthsDiff + (format === 'YYYY-MM' ? 1 : 0)

  // Adjust if end day is less than start day
  if (end.getUTCDate() < start.getUTCDate()) {
    duration -= 1
  }

  return duration
}

const processItem = (item: any): any => {
  if (!item) return item

  // Create a copy of the item to avoid modifying the original
  const processedItem = { ...item }
  const startDate = processedItem.startDate as string
  const endDate = processedItem.endDate as string
  const formatOfStartDate = dateFormats[startDate.split('-').length || 0]
  const formatOfEndDate = dateFormats[endDate.split('-').length || 0]

  if (processedItem.startDate) {
    processedItem.startDate = parseDateString(processedItem.startDate, false, formatOfStartDate)
  }

  if (processedItem.endDate) {
    processedItem.endDate = parseDateString(processedItem.endDate, true, formatOfEndDate)
  }

  // Calculate duration if both dates are present
  if (processedItem.startDate && processedItem.endDate) {
    processedItem.duration = calculateDurationInMonths(processedItem.startDate, processedItem.endDate, formatOfEndDate)
  } else if (processedItem.startDate) {
    // Calculate duration until now if only start date is present
    processedItem.duration = calculateDurationInMonths(processedItem.startDate, new Date(), formatOfStartDate)
  }

  return processedItem
}

export const postProcessing = (data: any): any => {
  if (data.professionalExperiences) {
    data.professionalExperiences = data.professionalExperiences.map(processItem)
  }

  if (data.otherExperiences) {
    data.otherExperiences = data.otherExperiences.map(processItem)
  }

  if (data.educations) {
    data.educations = data.educations.map(processItem)
  }

  return data
}

export const saveRawTxt = (basePath: string | undefined, filePath: string, text: string): void => {
  const outputPath = getOutputPath(basePath, path.basename(filePath), '.txt')
  if (outputPath) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(outputPath, text)
  }
}

export const saveSanitizedTxt = (basePath: string | undefined, filePath: string, text: string): void => {
  const outputPath = getOutputPath(basePath, path.basename(filePath), '.txt')
  if (outputPath) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(outputPath, text)
  }
}

export const saveJson = (basePath: string | undefined, filePath: string, data: any): void => {
  const outputPath = getOutputPath(basePath, path.basename(filePath), '.json')
  if (outputPath) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
  }
}

export const getOutputPath = (basePath: string | undefined, fileName: string, extension: string): string | null => {
  if (!basePath) return null
  const baseName = path.parse(fileName).name
  return path.join(basePath, `${baseName}${extension}`)
}
