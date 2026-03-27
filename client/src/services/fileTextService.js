export async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt") || name.endsWith(".md")) {
    return file.text();
  }

  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.replace(/\s+/g, " ").trim();
  }

  if (name.endsWith(".pdf")) {
    const rawText = await file.text();
    return rawText.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
  }

  if (
    name.endsWith(".doc") ||
    name.endsWith(".ppt") ||
    name.endsWith(".pptx") ||
    name.endsWith(".slides")
  ) {
    throw new Error(
      "This file type is accepted for upload, but free extraction is limited. Please export it as .docx, .txt, .md, or .pdf for best results."
    );
  }

  throw new Error(
    "Unsupported file type. Please upload .txt, .md, .pdf, or .docx files, or paste the text directly."
  );
}
