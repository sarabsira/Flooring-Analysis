import { useState } from 'react'

const API_ENDPOINT = '/.netlify/functions/claude'

export function useClaude() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const call = async ({ system, messages, max_tokens = 2000 }) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system, messages, max_tokens })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message || 'API error')
      const text = data.content?.map(b => b.text || '').join('') || ''
      return text
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Analyse a room photo
  const analyseRoom = async (imageBase64, mimeType = 'image/jpeg', roomType = 'unknown') => {
    return call({
      system: `You are an expert NZ building surveyor and flooring specialist. Analyse room photos to estimate dimensions and floor area using reference objects. Always respond with valid JSON only — no preamble, no markdown fences.`,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: imageBase64 }
          },
          {
            type: 'text',
            text: `Analyse this ${roomType} room photo. Identify any reference objects (doors ~2040mm tall, power outlets ~115mm wide, skirting boards ~90mm, ceiling height typically 2400mm, kitchen benches ~900mm high). Use these to estimate room dimensions and floor area.

Return JSON with this exact structure:
{
  "referenceObjects": [{"object": string, "estimatedSize": string, "usedForCalculation": boolean}],
  "estimatedLength": number (metres),
  "estimatedWidth": number (metres),  
  "estimatedArea": number (m²),
  "confidence": "high"|"medium"|"low",
  "confidenceReason": string,
  "roomType": string,
  "observations": string[],
  "subfloorVisible": boolean,
  "subfloorNotes": string,
  "manualMeasurementRecommended": boolean,
  "manualMeasurementReason": string
}`
          }
        ]
      }],
      max_tokens: 1000
    })
  }

  // Analyse subfloor
  const analyseSubfloor = async (imageBase64, mimeType = 'image/jpeg', yearBuilt = null) => {
    return call({
      system: `You are an NZ building inspector specialising in subfloor assessment. Analyse subfloor photos for issues. Always respond with valid JSON only.`,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
          {
            type: 'text',
            text: `Analyse this subfloor photo. Year built (if known): ${yearBuilt || 'unknown'}.

Assess: timber condition, moisture signs, joist spacing, existing materials, levelness, visible damage, rot, pest damage.

IMPORTANT: Never clear asbestos risk from photos — if year is pre-1990 or unknown, always flag for professional testing.

Return JSON:
{
  "condition": "good"|"fair"|"poor"|"critical",
  "material": string,
  "joistSpacing": string,
  "moistureVisible": boolean,
  "rotOrDamage": boolean,
  "levelingRequired": boolean,
  "existingUnderlay": boolean,
  "existingUnderlayCondition": string,
  "asbestosRisk": "high"|"medium"|"low"|"unknown",
  "asbestosRiskReason": string,
  "issues": string[],
  "recommendations": string[],
  "remedialCostEstimate": string,
  "suitableForFlooring": boolean,
  "suitabilityNotes": string
}`
          }
        ]
      }],
      max_tokens: 1000
    })
  }

  // Get flooring recommendation
  const getFlooringRecommendation = async (roomType, area, subfloorType, wetArea, yearBuilt) => {
    return call({
      system: `You are an NZ flooring specialist with deep knowledge of NZ Building Code and local products. Respond with JSON only.`,
      messages: [{
        role: 'user',
        content: `Recommend flooring layers for:
- Room type: ${roomType}
- Floor area: ${area}m²
- Subfloor: ${subfloorType}
- Wet area: ${wetArea}
- Year built: ${yearBuilt || 'unknown'}

Consider NZ Building Code (E3, G6, NZS 3604, H1), common NZ products, climate zones.

Return JSON:
{
  "subfloor": { "recommendation": string, "compliance": string[], "notes": string },
  "underlay": { "recommendation": string, "compliance": string[], "notes": string },
  "surface": [
    { "option": string, "type": string, "suitability": "excellent"|"good"|"acceptable", "pros": string[], "cons": string[], "estimatedCostRange": string, "notes": string }
  ],
  "warnings": string[],
  "complianceNotes": string[]
}`
      }],
      max_tokens: 1500
    })
  }

  return { call, analyseRoom, analyseSubfloor, getFlooringRecommendation, loading, error }
}
