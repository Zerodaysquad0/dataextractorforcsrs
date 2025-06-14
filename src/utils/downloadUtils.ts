
// Remove file-saver import! Not needed with Blob/URL/anchor.

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
  mainTopic: string = ''
) => {
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF();
  doc.setFontSize(22);
  doc.text(heading, 14, 20);
  if(mainTopic) {
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`Topic: ${mainTopic}`, 14, 32);
    doc.setFont(undefined, 'normal'); // reset to normal after bold
  }
  doc.setFontSize(12);

  // Add line wrapping and bullet formatting
  let y = mainTopic ? 42 : 32;
  const lines = content.split('\n');
  lines.forEach(line => {
    if (line.trim().startsWith('**') && line.trim().endsWith('**')) { // Markdown heading
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(line.replace(/\*\*/g, ''), 14, y);
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      y += 10;
    } else if (line.trim().startsWith('-')) { // Bullet
      doc.text(line, 18, y);
      y += 8;
    } else {
      doc.text(line, 14, y, { maxWidth: 180 });
      y += 8;
    }
    if (y > 280) { doc.addPage(); y = 20; }
  });

  doc.save(filename);
};

export const downloadAsWord = async (
  content: string,
  filename: string = 'data-extraction-results.docx',
  heading: string = 'Extraction Results',
  mainTopic: string = ''
) => {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');

  const children = [];

  // Heading
  children.push(
    new Paragraph({
      text: heading,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 240 }
    })
  );

  // Main topic, bold
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

  // Content formatting
  const lines = content.split('\n');
  lines.forEach(line => {
    if (line.trim().startsWith('**') && line.trim().endsWith('**')) { // Markdown heading
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

