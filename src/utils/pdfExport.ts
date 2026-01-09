import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFJobDescription {
  position: string;
  job_band: string;
  job_grade: string;
  status: string;
  direct_supervisor: string;
  job_purpose?: string;
  version: number;
  created_at: string;
  updated_at?: string;
  location?: { name: string };
  department?: { name: string };
  team?: { name: string };
  responsibilities?: Array<{ category: string; description: string }>;
  risks?: Array<{ type: string; level?: string; description: string; mitigation?: string }>;
  jd_competencies?: Array<{ score: number; competency?: { name: string } }>;
  created_by_user?: { full_name: string };
}

export const exportJDToPDF = (jd: PDFJobDescription) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  // Helper function to add text with line wrapping
  const addWrappedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number = 10
  ): number => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * (fontSize * 0.4);
  };

  // Header with company branding
  doc.setFillColor(0, 122, 255); // Accent color
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Job Description', margin, 20);

  // Reset text color
  doc.setTextColor(0, 0, 0);
  yPosition = 40;

  // Position Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(jd.position, margin, yPosition);
  yPosition += 10;

  // Status Badge
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const statusText = jd.status.charAt(0).toUpperCase() + jd.status.slice(1);
  const statusColors: Record<string, [number, number, number]> = {
    draft: [156, 163, 175],
    published: [34, 197, 94],
    archived: [234, 179, 8],
  };
  const statusColor = statusColors[jd.status] || [156, 163, 175];
  doc.setFillColor(...statusColor);
  doc.roundedRect(margin, yPosition, 30, 6, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(statusText, margin + 2, yPosition + 4.5);
  doc.setTextColor(0, 0, 0);
  yPosition += 15;

  // Version and Date
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  const dateStr = new Date(jd.updated_at || jd.created_at).toLocaleDateString();
  doc.text(`Version ${jd.version} • Last updated ${dateStr}`, margin, yPosition);
  doc.setTextColor(0, 0, 0);
  yPosition += 10;

  // Basic Information Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Basic Information', margin, yPosition);
  yPosition += 5;

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: [
      ['Position', jd.position],
      ['Band / Grade', `${jd.job_band} / ${jd.job_grade}`],
      ['Location', jd.location?.name || 'N/A'],
      ['Department', jd.department?.name || 'N/A'],
      ['Team', jd.team?.name || 'N/A'],
      ['Direct Supervisor', jd.direct_supervisor],
    ],
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40, textColor: [107, 114, 128] },
      1: { cellWidth: 130 },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = margin;
  }

  // Job Purpose
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Job Purpose', margin, yPosition);
  yPosition += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(jd.job_purpose || 'N/A', margin, yPosition, pageWidth - 2 * margin);
  yPosition += 10;

  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = margin;
  }

  // Key Responsibilities
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Responsibilities', margin, yPosition);
  yPosition += 5;

  if (jd.responsibilities && jd.responsibilities.length > 0) {
    const responsibilityData = jd.responsibilities.map((resp: any, index: number) => [
      (index + 1).toString(),
      resp.category.charAt(0).toUpperCase() + resp.category.slice(1),
      resp.description,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['#', 'Category', 'Description']],
      body: responsibilityData,
      theme: 'striped',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 30, fontStyle: 'bold' },
        2: { cellWidth: 130 },
      },
      headStyles: {
        fillColor: [0, 122, 255],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(107, 114, 128);
    doc.text('No responsibilities defined', margin, yPosition + 5);
    doc.setTextColor(0, 0, 0);
    yPosition += 15;
  }

  // Check if we need a new page
  if (yPosition > 230) {
    doc.addPage();
    yPosition = margin;
  }

  // Risks & Mitigations
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Risks & Mitigations', margin, yPosition);
  yPosition += 5;

  if (jd.risks && jd.risks.length > 0) {
    const riskData = jd.risks.map((risk: any, index: number) => {
      const riskType = risk.type.charAt(0).toUpperCase() + risk.type.slice(1);
      const mitigation = risk.mitigation || 'No mitigation specified';
      return [
        (index + 1).toString(),
        `${riskType}\nLevel ${risk.level}`,
        risk.description,
        mitigation,
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [['#', 'Type & Level', 'Description', 'Mitigation']],
      body: riskData,
      theme: 'striped',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 30 },
        2: { cellWidth: 65 },
        3: { cellWidth: 65 },
      },
      headStyles: {
        fillColor: [0, 122, 255],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(107, 114, 128);
    doc.text('No risks defined', margin, yPosition + 5);
    doc.setTextColor(0, 0, 0);
    yPosition += 15;
  }

  // Check if we need a new page
  if (yPosition > 230) {
    doc.addPage();
    yPosition = margin;
  }

  // Required Competencies
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Required Competencies', margin, yPosition);
  yPosition += 5;

  if (jd.jd_competencies && jd.jd_competencies.length > 0) {
    const competencyData = jd.jd_competencies.map((jdComp: any, index: number) => {
      const score = jdComp.score;
      const scoreBar = '█'.repeat(score) + '░'.repeat(5 - score);
      return [
        (index + 1).toString(),
        jdComp.competency?.name || 'Unknown',
        `${score}/5`,
        scoreBar,
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [['#', 'Competency', 'Score', 'Level']],
      body: competencyData,
      theme: 'striped',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 80 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 60, halign: 'center', font: 'courier' },
      },
      headStyles: {
        fillColor: [0, 122, 255],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(107, 114, 128);
    doc.text('No competencies defined', margin, yPosition + 5);
    doc.setTextColor(0, 0, 0);
    yPosition += 15;
  }

  // Check if we need a new page for footer
  if (yPosition > 250) {
    doc.addPage();
    yPosition = margin;
  }

  // Metadata section
  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Document Information', margin, yPosition);
  yPosition += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text(`Created by: ${jd.created_by_user?.full_name || 'Unknown'}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Created at: ${new Date(jd.created_at).toLocaleString()}`, margin, yPosition);
  yPosition += 5;
  if (jd.updated_at && jd.updated_at !== jd.created_at) {
    doc.text(`Last updated: ${new Date(jd.updated_at).toLocaleString()}`, margin, yPosition);
    yPosition += 5;
  }
  doc.text(`Document version: v${jd.version}`, margin, yPosition);
  doc.setTextColor(0, 0, 0);

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      'Job Description Management System',
      margin,
      doc.internal.pageSize.getHeight() - 10
    );
    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }

  // Save the PDF
  const fileName = `JD_${jd.position.replace(/\s+/g, '_')}_v${jd.version}.pdf`;
  doc.save(fileName);
};
