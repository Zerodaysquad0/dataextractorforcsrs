
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

export const downloadAsPDF = async (content: string, filename: string = 'data-extraction-results.pdf') => {
  // For PDF generation, you'd typically use jsPDF or similar
  // For now, we'll download as text with .pdf extension
  downloadAsText(content, filename);
};
