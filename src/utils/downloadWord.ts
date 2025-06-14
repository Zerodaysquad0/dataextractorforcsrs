
async function isImageUrlReachable(url: string): Promise<boolean> {
  try {
    await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return true;
  } catch {
    return false;
  }
}

export const downloadAsWord = async (
  content: string,
  filename: string = 'data-extraction-results.docx',
  heading: string = 'Extraction Results',
  mainTopic: string = '',
  images: string[] = []
) => {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');

  const children = [
    new Paragraph({
      text: heading,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 240 }
    })
  ];

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
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Image ${idx + 1}: `, bold: true }),
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
