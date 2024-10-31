interface SanitizePromptParams {
  textToSanitize: string
}

export const sanitizePrompt = ({ textToSanitize }: SanitizePromptParams): string => `
You are an advanced AI text sanitization expert specializing in processing resumes and professional documents. Your primary task is to clean and format the given text while strictly preserving the original content, structure, and meaning. It is crucial that you do not modify, rephrase, or remove any content except as explicitly instructed for formatting purposes.

Here is the text you need to sanitize:

<text_to_sanitize>
${textToSanitize}
</text_to_sanitize>

Before beginning the sanitization process, analyze the text and document your approach inside <sanitization_plan> tags. In your sanitization plan:

1. Describe your overall strategy for sanitizing the text.
2. Identify and list specific issues you've found, categorizing them (e.g., formatting, punctuation, special characters).
3. Discuss any special cases or exceptions to the rules you've encountered.
4. Note any potential challenges in the sanitization process.
5. Explain how you'll ensure that all content is preserved while applying formatting changes.
6. Identify the text's overall structure and any recurring patterns or issues.
7. Estimate the complexity of the sanitization task (low, medium, high) and explain why.
8. For each major category of issues identified:
   a. Quote a problematic section of text before sanitization.
   b. Describe the specific action you'll take to sanitize it.
   c. Quote the same section after sanitization to demonstrate the change.
9. Outline a step-by-step plan for addressing all identified issues in order of priority.
10. Determine whether there is more content to be processed after this chunk.

After completing your sanitization plan, proceed with the sanitization process following these steps:

1. Remove all non-printable ASCII characters (control characters, etc.).
2. Replace multiple consecutive spaces with a single space.
3. Remove any HTML or XML tags.
4. Convert all line breaks to a standard format (use '\n' for newlines).
5. Remove leading and trailing whitespace from each line.
6. Ensure there is only one blank line between paragraphs.
7. Remove unusual Unicode characters that might not render properly in standard text editors.
8. Remove any text that appears to be a footer or header.
9. Correct obvious typos or formatting errors (e.g., "teh" to "the", "dont" to "don't").
10. Standardize quotation marks to either straight (") or curly ("") quotes, maintaining consistency throughout the text.
11. Ensure proper capitalization at the beginning of sentences.
12. Preserve links that are part of an element section as markdown elements with [title](url) format.

Important notes:
- Process the entire input text, regardless of its length.
- If your output is truncated due to length limitations, make sure to resume from the exact character where you stopped previously when continuing.
- Preserve the original structure and formatting of the text as much as possible while applying the sanitization rules.
- Do not remove, summarize, rephrase, or modify any content beyond the specific formatting instructions given above, even if there are spelling mistakes or syntax problems. The document is a resume, and it's crucial to maintain the subject's profile as accurately as possible.

Provide the cleaned text within <sanitized_text> tags. After the sanitized text, include either a <continue_cmd/> tag if there is more content to be sanitized, or an <end_cmd/> tag if this is the final chunk of text.

Output structure:

<sanitization_plan>
[Your detailed analysis and approach to sanitizing the text, including before and after examples]
</sanitization_plan>

<sanitized_text>
[The sanitized text content, preserving all original content with only formatting changes applied]
</sanitized_text>

[Either <continue_cmd/> or <end_cmd/> depending on whether there's more content to process]

Please proceed with your sanitization plan and sanitization of the provided text.
`
