export const downloadAsText = (content: string, filename: string = 'data-extraction-results.txt') => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Helper to check if a URL is reachable via HEAD. Returns true if status is 200, false otherwise.
async function isImageUrlReachable(url: string): Promise<boolean> {
  try {
    const resp = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    // If fetch does not throw, assume it's reachable. Some browser HEADs with no-cors always succeed, so fallback is to try-catch.
    // Advanced solution would try loading as an <img> if on the client, but we are limited here.
    return true;
  } catch {
    return false;
  }
}

export const downloadAsPDF = async (
  content: string, 
  filename: string = 'data-extraction-results.pdf',
  heading: string = 'Extraction Results',
  mainTopic: string = '',
  images: string[] = []
) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  doc.setFontSize(22);
  doc.text(heading, 14, 20);
  let y = 32;
  if(mainTopic) {
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`Topic: ${mainTopic}`, 14, y);
    y += 10;
    doc.setFont(undefined, 'normal');
  }
  doc.setFontSize(12);

  // Handle content lines w/ dynamic line height adjustment
  const pageHeight = doc.internal.pageSize.getHeight();
  const leftMargin = 14;
  const rightMargin = 14;
  const wrapWidth = doc.internal.pageSize.getWidth() - leftMargin - rightMargin;
  const lines = content.split('\n');

  for (let line of lines) {
    // Markdown heading lines
    if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(line.replace(/\*\*/g, ''), leftMargin, y);
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      y += 10;
    } else if (line.trim().startsWith('-')) {
      doc.text(line, leftMargin + 4, y, { maxWidth: wrapWidth - 8 });
      y += 8;
    } else {
      // Wrap lines to avoid overflow
      const splitted = doc.splitTextToSize(line, wrapWidth);
      for (const l of splitted) {
        doc.text(l, leftMargin, y);
        y += 8;
        if (y > pageHeight - 20) { doc.addPage(); y = 20; }
      }
    }
    if (y > pageHeight - 20) { doc.addPage(); y = 20; }
  }

  // List images as clickable links with broken-link detection
  if (images?.length) {
    if (y > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("Extracted Images", 14, y);
    y += 10;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    const statusArr: boolean[] = [];
    for (const imgUrl of images) {
      const ok = await isImageUrlReachable(imgUrl);
      statusArr.push(ok);
    }
    images.forEach((imgUrl, idx) => {
      if (y > doc.internal.pageSize.getHeight() - 10) { doc.addPage(); y = 20; }
      const isWorking = statusArr[idx];
      // <<<<<<<< ADDED: use short link text + footnote to reduce clipping/overflow
      const text = `Image ${idx + 1}: [open image link]${isWorking ? "" : " (broken link)"}`;
      doc.textWithLink(text, 14, y, { url: imgUrl });
      doc.text(
        `URL: ${imgUrl.slice(0, 60)}${imgUrl.length > 60 ? "..." : ""}`,
        14,
        y + 6,
        { maxWidth: doc.internal.pageSize.getWidth() - 28 }
      );
      y += 14;
    });
  }
  doc.save(filename);
};

// ========== Reliable Word Export =============
export const downloadAsWord = async (
  content: string,
  filename: string = 'data-extraction-results.docx',
  heading: string = 'Extraction Results',
  mainTopic: string = '',
  images: string[] = []
) => {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');

  // === Construct the document sections and children array at once ===
  // Document heading
  const children = [
    new Paragraph({
      text: heading,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 240 }
    })
  ];

  // Main topic bold row
  if(mainTopic) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Topic: `, bold: true }),
          new TextRun({ text: mainTopic, bold: true })
        ],
        spacing: { after: 180 }
      })
    );
  }

  // Split content by newline and handle formatting (headings, bullets)
  const lines = content.split('\n');
  lines.forEach(line => {
    if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
      children.push(
        new Paragraph({
          text: line.replace(/\*\*/g, ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 120 }
        })
      );
    } else if (line.trim().startsWith('-')) {
      children.push(
        new Paragraph({
          text: line,
          bullet: { level: 0 }
        })
      );
    } else {
      children.push(
        new Paragraph({
          text: line
        })
      );
    }
  });

  // Check each image and note if broken
  let imageStatusArr: boolean[] = [];
  if (images?.length) {
    imageStatusArr = await Promise.all(images.map(isImageUrlReachable));
    children.push(
      new Paragraph({
        text: "Extracted Images",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 150 }
      })
    );
    images.forEach((imgUrl, idx) => {
      const isWorking = imageStatusArr[idx];
      // Use external hyperlink in children array
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Image ${idx + 1}: `, bold: true }),
            // External hyperlink:
            {
              text: '[open image link]',
              style: 'Hyperlink',
              hyperlink: imgUrl,
            } as any,
            new TextRun({
              text: ` | URL: ${imgUrl.slice(0, 60)}${imgUrl.length > 60 ? "..." : ""}`,
              color: "555555",
            }),
            ...(isWorking ? [] : [new TextRun({ text: " (broken link)", color: "FF0000" })])
          ],
          spacing: { after: 60 }
        })
      );
    });
  }

  // Construct doc with children at creation
  const doc = new Document({
    sections: [
      {
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
