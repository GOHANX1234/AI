// Client-side PDF processor for Nemotron 3 Omni Multimodal Vision
export interface ProcessedPdfPage {
  pageNumber: number;
  imageUrl: string;
}

export interface ProcessedPdf {
  name: string;
  size: number;
  pageCount: number;
  extractedText: string;
  pages: ProcessedPdfPage[];
}

export async function processPdfFile(file: File, maxPages = 8): Promise<ProcessedPdf> {
  if (typeof window === "undefined") {
    throw new Error("PDF processing is only supported in client environment.");
  }

  // Dynamically import pdfjs-dist
  const pdfjsLib = await import("pdfjs-dist");

  // Configure worker URL from CDN
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "3.11.174"}/pdf.worker.min.js`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;

  const pageCount = pdfDoc.numPages;
  const pagesToProcess = Math.min(pageCount, maxPages);
  const pages: ProcessedPdfPage[] = [];
  let fullText = "";

  for (let i = 1; i <= pagesToProcess; i++) {
    try {
      const page = await pdfDoc.getPage(i);

      // Extract text from page
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || "")
        .join(" ")
        .trim();

      if (pageText) {
        fullText += `\n--- [PDF Page ${i}] ---\n${pageText}\n`;
      }

      // Render page to visual image for Omni Vision
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (ctx) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Fill white background (for transparent PDFs)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: ctx,
          viewport: viewport,
        }).promise;

        const imageUrl = canvas.toDataURL("image/jpeg", 0.85);
        pages.push({
          pageNumber: i,
          imageUrl,
        });
      }
    } catch (pageErr) {
      console.warn(`Failed to render PDF page ${i}:`, pageErr);
    }
  }

  return {
    name: file.name,
    size: file.size,
    pageCount,
    extractedText: fullText.trim(),
    pages,
  };
}
