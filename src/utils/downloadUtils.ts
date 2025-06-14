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
    doc.setFont(undefined, 'normal'); // reset font style
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

  // List images as clickable links
  if (images?.length) {
    if (y > pageHeight - 40) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("Extracted Images", leftMargin, y);
    y += 10;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    images.forEach((imgUrl, idx) => {
      if (y > pageHeight - 10) { doc.addPage(); y = 20; }
      // NOTE: true hyperlinks are not supported; user will see link text
      doc.text(`Image ${idx + 1}: ${imgUrl}`, leftMargin, y, { maxWidth: wrapWidth });
      y += 8;
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

  const children = [];

  // Document heading
  children.push(
    new Paragraph({
      text: heading,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 240 }
    })
  );

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

  // List clickable links for images
  if (images?.length) {
    children.push(
      new Paragraph({
        text: "Extracted Images",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 150 }
      })
    );
    images.forEach((imgUrl, idx) => {
      // Always include a clickable link to the image, for reliability
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Image ${idx + 1}: `, bold: true }),
            new TextRun({
              text: imgUrl,
              underline: { type: 'single', color: '0000FF' },
              color: "0000FF",
              style: "Hyperlink"
            })
          ],
          spacing: { after: 60 }
        })
      );
    });
  }

  // Create the doc object and attach content
  const doc = new Document({ sections: [{ children }] });

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
