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

  // Images: Because jsPDF cannot reliably embed remote images due to CORS, we instead list the image URLs.
  if (images?.length) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("Extracted Images", 14, y);
    y += 10;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    images.forEach((imgUrl, idx) => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(`Image ${idx + 1}: ${imgUrl}`, 14, y, { maxWidth: 180 });
      y += 8;
    });
  }

  doc.save(filename);
};

export const downloadAsWord = async (
  content: string,
  filename: string = 'data-extraction-results.docx',
  heading: string = 'Extraction Results',
  mainTopic: string = '',
  images: string[] = []
) => {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Media } = await import('docx');

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

  // Create the document before embedding images, as required by docx's Media.addImage API
  const doc = new Document({ sections: [{ children: [] }] });

  // Insert images in the DOCX
  if (images?.length) {
    children.push(
      new Paragraph({
        text: "Extracted Images",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 150 }
      })
    );
    for (let imgUrl of images) {
      try {
        const res = await fetch(imgUrl);
        const imgBlob = await res.blob();
        const arrayBuffer = await imgBlob.arrayBuffer();
        // Modern docx expects addImage(doc, arrayBuffer, width, height, options)
        if (typeof Media?.addImage === "function") {
          const image = Media.addImage(doc, arrayBuffer, 350, 200);
          children.push(image);
        } else {
          // Fallback: just add the link if addImage not available
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: `Image: `, bold: true }),
                new TextRun({
                  text: imgUrl,
                  underline: { type: 'single', color: '0000FF' },
                  color: "0000FF"
                })
              ],
              spacing: { after: 60 }
            })
          );
        }
      } catch (e) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Image: `, bold: true }),
              new TextRun({
                text: imgUrl,
                underline: { type: 'single', color: '0000FF' },
                color: "0000FF"
              })
            ],
            spacing: { after: 60 }
          })
        );
      }
      // Small space after each img/link
      children.push(new Paragraph({ text: "", spacing: { after: 40 } }));
    }
  }

  // Attach all children to the doc section.
  (doc as any).Sections[0].Properties.options.children = children;

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
