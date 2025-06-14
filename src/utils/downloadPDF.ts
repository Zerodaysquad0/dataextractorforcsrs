
async function isImageUrlReachable(url: string): Promise<boolean> {
  try {
    await fetch(url, { method: 'HEAD', mode: 'no-cors' });
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

  const pageHeight = doc.internal.pageSize.getHeight();
  const leftMargin = 14;
  const rightMargin = 14;
  const wrapWidth = doc.internal.pageSize.getWidth() - leftMargin - rightMargin;
  const lines = content.split('\n');

  for (let line of lines) {
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
      const splitted = doc.splitTextToSize(line, wrapWidth);
      for (const l of splitted) {
        doc.text(l, leftMargin, y);
        y += 8;
        if (y > pageHeight - 20) { doc.addPage(); y = 20; }
      }
    }
    if (y > pageHeight - 20) { doc.addPage(); y = 20; }
  }

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
