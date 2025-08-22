import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase.js'
import Mailgun from 'mailgun.js'
import FormData from 'form-data'

// Initialize Mailgun
const mailgun = new Mailgun(FormData)
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY
})

export async function POST(request) {
  try {
    const submissionData = await request.json()
    console.log('Received submission data:', submissionData)
    
    // Test Supabase connection first
    console.log('Testing Supabase connection...')
    const { data: testData, error: testError } = await supabase
      .from('quote_submissions')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('Supabase connection test failed:', testError)
    } else {
      console.log('Supabase connection test passed')
    }
    
    // Temporarily skip Supabase insertion to test email functionality
    console.log('Skipping Supabase insertion for debugging...')
    
    // Create mock data for email
    const data = {
      id: 'test-' + Date.now(),
      product_type: submissionData.product?.type || 'unknown',
      product_name: submissionData.product?.name || 'Unknown Product',
      selections: submissionData.selections || [],
      pricing: submissionData.pricing,
      quantity: submissionData.quantity || 1,
      quote_notes: submissionData.quoteNotes || '',
      company_name: submissionData.companyName,
      first_name: submissionData.firstName,
      last_name: submissionData.lastName,
      email: submissionData.email,
      phone: submissionData.phone,
      customer_notes: submissionData.notes || '',
      created_at: new Date().toISOString()
    }
    
    // Send email notification
    try {
      await sendQuoteNotificationEmail(data)
    } catch (emailError) {
      console.error('Email notification failed:', emailError)
      // Don't fail the whole request if email fails
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Quote submitted successfully',
      submissionId: data.id
    })
    
  } catch (error) {
    console.error('Error submitting quote:', error)
    console.error('Error details:', error.message, error.stack)
    return NextResponse.json(
      { success: false, message: 'Failed to submit quote', error: error.message },
      { status: 500 }
    )
  }
}

async function sendQuoteNotificationEmail(submissionData) {
  try {
    const emailBody = formatQuoteEmail(submissionData)
    
    const messageData = {
      from: 'Quote Builder <noreply@sandbox2d9835745d994dba816329fc59aa5f94.mailgun.org>',
      to: ['natemoshel@gmail.com', 'nate@moshconsult.com'],
      subject: `New Quote Request - ${submissionData.product_name}`,
      text: emailBody,
      html: formatQuoteEmailHTML(submissionData)
    }

    const result = await mg.messages.create('sandbox2d9835745d994dba816329fc59aa5f94.mailgun.org', messageData)
    console.log('Email sent successfully:', result)
    return result
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

function formatQuoteEmail(submissionData) {
  const selectionsText = Array.isArray(submissionData.selections) 
    ? submissionData.selections.map(item => `${item.section}: ${item.selection}`).join('\n')
    : 'No selections available'

  return `
New Quote Request Submitted:

Company: ${submissionData.company_name}
Contact: ${submissionData.first_name} ${submissionData.last_name}
Email: ${submissionData.email}
Phone: ${submissionData.phone}

Product: ${submissionData.product_name}
Quantity: ${submissionData.quantity}

Configuration:
${selectionsText}

${submissionData.pricing ? `Estimated Total: $${submissionData.pricing.total}` : ''}

Customer Notes:
${submissionData.customer_notes || 'None'}

Submitted: ${submissionData.created_at || new Date().toISOString()}
  `
}

function formatQuoteEmailHTML(submissionData) {
  const selectionsHTML = Array.isArray(submissionData.selections) 
    ? submissionData.selections.map(item => `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${item.section}:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${item.selection}</td></tr>`).join('')
    : '<tr><td colspan="2" style="padding: 8px;">No selections available</td></tr>'

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">New Quote Request</h1>
          
          <h2 style="color: #374151; margin-top: 30px;">Customer Information</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Company:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${submissionData.company_name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Contact:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${submissionData.first_name} ${submissionData.last_name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${submissionData.email}">${submissionData.email}</a></td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${submissionData.phone}</td></tr>
          </table>

          <h2 style="color: #374151; margin-top: 30px;">Product Details</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Product:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${submissionData.product_name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Quantity:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${submissionData.quantity}</td></tr>
          </table>

          <h2 style="color: #374151; margin-top: 30px;">Configuration</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            ${selectionsHTML}
          </table>

          ${submissionData.pricing ? `
          <h2 style="color: #374151; margin-top: 30px;">Pricing</h2>
          <p style="font-size: 18px; font-weight: bold; color: #059669;">Estimated Total: $${submissionData.pricing.total}</p>
          ` : ''}

          ${submissionData.customer_notes ? `
          <h2 style="color: #374151; margin-top: 30px;">Customer Notes</h2>
          <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #2563eb; margin-bottom: 20px;">
            <p style="margin: 0;">${submissionData.customer_notes}</p>
          </div>
          ` : ''}

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            <strong>Submitted:</strong> ${submissionData.created_at || new Date().toISOString()}<br>
            <strong>Submission ID:</strong> ${submissionData.id || 'N/A'}
          </p>
        </div>
      </body>
    </html>
  `
}