export async function extractTextFromPDF(file: File): Promise<string> {
  // 1. DYNAMIC IMPORT: Prevents "DOMMatrix is not defined" by loading only in browser
  const pdfjsLib = await import('pdfjs-dist');

  // 2. WORKER CONFIG: Point to the exact version on unpkg
  // Note: We use .mjs for modern pdfjs versions (v4+)
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  // 3. PARSE
  const arrayBuffer = await file.arrayBuffer();
  
  // Load the document
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullText = "";

  // Loop pages
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      // @ts-ignore: pdfjs types can be tricky with 'str'
      .map((item: any) => item.str)
      .join(" ");
    
    fullText += pageText + "\n";
  }

  return fullText;
}