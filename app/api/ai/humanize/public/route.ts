import { NextRequest, NextResponse } from 'next/server'
import { humanizeContent } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, options } = body

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Humanize content (no auth required for public endpoint)
    let result
    try {
      result = await humanizeContent(text, options || {})
    } catch (error: any) {
      console.error('Error humanizing content:', error)
      return NextResponse.json(
        {
          error: error.message || 'Failed to humanize content',
        },
        { status: 500 }
      )
    }

    // Generate a payment ID for this result
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Return result with payment ID
    // The result will be blurred until payment is verified
    return NextResponse.json({ 
      result,
      paymentId,
      price: 500, // TZS
      tool: 'humanize'
    })
  } catch (error: any) {
    console.error('Error in public humanize API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

