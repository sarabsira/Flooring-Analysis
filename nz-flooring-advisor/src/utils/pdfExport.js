import jsPDF from 'jspdf'

export async function generateJobReport(project, settings) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210, margin = 15, col = W - margin * 2
  let y = margin

  const forest = [28, 43, 31]
  const timber = [212, 131, 42]
  const stone = [139, 139, 122]
  const cream = [245, 240, 232]

  const line = (thickness = 0.3) => {
    doc.setDrawColor(...stone)
    doc.setLineWidth(thickness)
    doc.line(margin, y, W - margin, y)
    y += 3
  }

  const text = (str, x, size = 10, color = [40, 40, 40], style = 'normal') => {
    doc.setFontSize(size)
    doc.setTextColor(...color)
    doc.setFont('helvetica', style)
    doc.text(str, x, y)
  }

  const newPage = () => {
    doc.addPage()
    y = margin
  }

  const checkPage = (needed = 20) => {
    if (y + needed > 280) newPage()
  }

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFillColor(...forest)
  doc.rect(0, 0, W, 30, 'F')

  doc.setFontSize(18)
  doc.setTextColor(245, 240, 232)
  doc.setFont('helvetica', 'bold')
  doc.text(settings.companyName || 'NZ Flooring Advisor', margin, 13)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(180, 210, 185)
  doc.text('FLOORING JOB REPORT', margin, 20)

  doc.setFontSize(8)
  doc.setTextColor(180, 210, 185)
  doc.text(`Generated: ${new Date().toLocaleDateString('en-NZ')}`, W - margin, 13, { align: 'right' })
  if (settings.companyPhone) doc.text(settings.companyPhone, W - margin, 19, { align: 'right' })
  if (settings.companyEmail) doc.text(settings.companyEmail, W - margin, 25, { align: 'right' })

  y = 38

  // ── Project info ──────────────────────────────────────────────────────────
  doc.setFillColor(...cream)
  doc.rect(margin, y - 3, col, 22, 'F')
  text(project.name || 'Untitled Project', margin + 3, 13, forest, 'bold')
  y += 7
  text(project.address || 'Address not set', margin + 3, 9, [80, 80, 80])
  y += 5
  text(`Status: ${project.status?.toUpperCase() || 'QUOTED'}`, margin + 3, 8, stone)
  if (project.yearBuilt) {
    text(`Year Built: ${project.yearBuilt}`, margin + 60, 8, stone)
  }
  y += 10
  line()

  // ── Room summary ──────────────────────────────────────────────────────────
  y += 2
  text('ROOMS SUMMARY', margin, 11, forest, 'bold')
  y += 6

  const rooms = project.rooms || []
  let totalArea = 0

  rooms.forEach((room) => {
    checkPage(18)
    const area = room.manualArea ?? room.estimatedArea ?? 0
    totalArea += area

    doc.setFillColor(248, 247, 244)
    doc.rect(margin, y - 3, col, 14, 'F')
    text(room.name || 'Unnamed Room', margin + 2, 10, forest, 'bold')
    text(room.type?.toUpperCase() || '', margin + 80, 10, stone)
    text(`${area.toFixed(2)} m²`, W - margin - 2, 10, timber, 'bold')
    doc.setFont('helvetica', 'normal')

    y += 5
    const surface = room.flooringLayers?.surface
    const surfaceText = surface?.customNote || surface?.productName || 'Not selected'
    text(`Surface: ${surfaceText}`, margin + 4, 8, [80, 80, 80])

    if (room.areaConfidence && room.areaConfidence !== 'high' && !room.manualArea) {
      text(`⚠ AI estimate — verify manually`, margin + 80, 8, [200, 100, 0])
    }
    y += 10
  })

  y += 2
  doc.setFillColor(...forest)
  doc.rect(margin, y - 3, col, 10, 'F')
  doc.setFontSize(10)
  doc.setTextColor(245, 240, 232)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL FLOOR AREA', margin + 3, y + 3)
  doc.text(`${totalArea.toFixed(2)} m²`, W - margin - 3, y + 3, { align: 'right' })
  y += 12

  // ── Quotes ────────────────────────────────────────────────────────────────
  const quotes = project.quotes || []
  if (quotes.length > 0) {
    newPage()
    text('QUOTES', margin, 14, forest, 'bold')
    y += 6
    line()

    quotes.forEach((quote, qi) => {
      checkPage(40)
      y += 2
      text(`Quote v${quote.version} — ${new Date(quote.date).toLocaleDateString('en-NZ')}`, margin, 10, forest, 'bold')
      y += 6

      // Line items
      const items = quote.lineItems || []
      items.forEach((item) => {
        checkPage(8)
        text(item.description || '', margin + 3, 9)
        text(`${(item.area || 0).toFixed(2)} m²`, margin + 90, 9, stone)
        text(`$${(item.totalCost || 0).toFixed(2)}`, W - margin - 3, 9, [60, 60, 60])
        y += 5
      })

      y += 2
      line(0.5)
      text('Subtotal', margin + 3, 9, [60, 60, 60])
      text(`$${(quote.subtotal || 0).toFixed(2)}`, W - margin - 3, 9, [60, 60, 60])
      y += 5
      text(`GST (15%)`, margin + 3, 9, [60, 60, 60])
      text(`$${(quote.gst || 0).toFixed(2)}`, W - margin - 3, 9, [60, 60, 60])
      y += 5

      doc.setFillColor(...forest)
      doc.rect(margin, y - 3, col, 10, 'F')
      doc.setFontSize(11)
      doc.setTextColor(245, 240, 232)
      doc.setFont('helvetica', 'bold')
      doc.text('TOTAL INC GST', margin + 3, y + 3)
      doc.text(`$${(quote.total || 0).toFixed(2)}`, W - margin - 3, y + 3, { align: 'right' })
      y += 15
    })
  }

  // ── Compliance notes ──────────────────────────────────────────────────────
  checkPage(30)
  y += 3
  text('COMPLIANCE & NOTES', margin, 11, forest, 'bold')
  y += 5
  line()
  const complianceNotes = [
    'All wet area installations must comply with NZ Building Code E3 (Internal Moisture).',
    'Acoustic underlay required in multi-storey buildings per NZS G6.',
    'Subfloor timber must meet NZS 3604 treatment requirements.',
    'Underfloor insulation must meet H1 R-value requirements for the climate zone.',
  ]
  complianceNotes.forEach((note) => {
    checkPage(6)
    text(`• ${note}`, margin + 2, 8, [80, 80, 80])
    y += 5
  })

  if (project.yearBuilt && project.yearBuilt < 1990) {
    y += 3
    doc.setFillColor(255, 240, 230)
    doc.rect(margin, y - 3, col, 20, 'F')
    doc.setFontSize(8)
    doc.setTextColor(180, 60, 0)
    doc.setFont('helvetica', 'bold')
    doc.text('⚠ ASBESTOS RISK', margin + 3, y + 2)
    doc.setFont('helvetica', 'normal')
    const warning = 'Property pre-dates 1990. Asbestos-containing materials may be present in existing flooring, underlays and adhesives. Professional asbestos assessment required before work commences (H&S at Work (Asbestos) Regs 2016).'
    const lines = doc.splitTextToSize(warning, col - 6)
    doc.text(lines, margin + 3, y + 7)
    y += 22
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(...stone)
    doc.text(`${settings.companyName || 'NZ Flooring Advisor'} | ${settings.companyEmail || ''} | ${settings.companyPhone || ''}`, margin, 292)
    doc.text(`Page ${i} of ${pageCount}`, W - margin, 292, { align: 'right' })
  }

  return doc
}

export function downloadReport(project, settings) {
  generateJobReport(project, settings).then((doc) => {
    const filename = `${(project.name || 'job').replace(/\s+/g, '-').toLowerCase()}-report.pdf`
    doc.save(filename)
  })
}
