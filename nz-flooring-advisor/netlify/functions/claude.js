import Anthropic from '@anthropic-ai/sdk'

export const handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        error: 'API key not configured',
        message: 'Add ANTHROPIC_API_KEY to your Netlify environment variables.'
      })
    }
  }

  try {
    const body = JSON.parse(event.body)
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: body.max_tokens || 2000,
      system: body.system || undefined,
      messages: body.messages
    })

    return { statusCode: 200, headers, body: JSON.stringify(response) }
  } catch (err) {
    console.error('Claude API error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    }
  }
}
