import fs from 'fs'
import pdfParse from 'pdf-parse'
import { ExtractorOptions, ExtractionResult, PageData } from '../types'
import Extractor from './Extractor'

class PdfParseExtractor extends Extractor {
  getName(): string {
    return 'pdfParse'
  }

  async extract(pdfPath: string, options: ExtractorOptions = {}): Promise<ExtractionResult> {
    this._logDebug(`Starting PDF extraction for: ${pdfPath}`)
    const buffer = fs.readFileSync(pdfPath)
    const data = await pdfParse(buffer)
    // If specific pages are requested
    if (options.pages) {
      const pages: PageData[] = data.text.split(/\f/).map((pageText, index) => ({
        pageNumber: index + 1,
        text: pageText.trim(),
      }))

      this._logDebug('\n=== Extracted Pages ===')
      pages.forEach((page) => {
        this._logDebug(`\n--- Page ${page.pageNumber} ---`)
        this._logDebug(page.text)
      })
      this._logDebug('=====================\n')

      return {
        text: pages.map((page) => page.text).join('\n\n'),
        pages,
      }
    }

    this._logDebug('\n=== Extracted Text ===')
    this._logDebug(data.text)
    this._logDebug('===================\n')

    return {
      text: data.text,
      pages: [{ pageNumber: 1, text: data.text }],
    }
  }
}

export default PdfParseExtractor
