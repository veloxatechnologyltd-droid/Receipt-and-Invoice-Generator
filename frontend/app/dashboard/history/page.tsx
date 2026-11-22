'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/currency'
import ProfessionalInvoice from '@/components/ProfessionalInvoice'
import ProfessionalReceipt from '@/components/ProfessionalReceipt'
import '../dashboard.css'
import '../receipt-invoice.css'
import '../../professional-receipt.css'

const IconReceiptSmall = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
)

const IconInvoiceSmall = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>
)

export default function HistoryPage() {
  const [loading, setLoading] = useState(true)
  const [receipts, setReceipts] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'receipts' | 'invoices'>('receipts')
  const [business, setBusiness] = useState<any>(null)
  const [viewDoc, setViewDoc] = useState<{ kind: 'receipt' | 'invoice'; data: any } | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadHistory()
    loadBusiness()
  }, [])

  const loadHistory = async () => {
    try {
      const res = await api.get('/api/history/')
      setReceipts(res.data.receipts || [])
      setInvoices(res.data.invoices || [])
    } catch (err) {
      console.error('Failed to load history', err)
    } finally {
      setLoading(false)
    }
  }

  const loadBusiness = async () => {
    try {
      const res = await api.get('/api/business/')
      setBusiness(res.data)
    } catch (err) {
      console.error('Failed to load business profile', err)
    }
  }

  const handleDownloadPDF = async () => {
    if (!viewDoc) return
    const element = document.getElementById(
      viewDoc.kind === 'invoice' ? 'invoice-preview-content' : 'receipt-preview-content'
    )
    if (!element) return

    setExporting(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const filename =
        viewDoc.kind === 'invoice'
          ? `invoice_${viewDoc.data.invoice_number}`
          : `receipt_${viewDoc.data.receipt_number}`

      await html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).from(element).save()
    } catch (err) {
      console.error('Failed to generate PDF', err)
      alert('Could not generate the PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const money = (amount: number) => formatCurrency(amount, business?.currency)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) return null

  return (
    <div className="history-page">
      <header className="page-header-simple">
        <div className="header-text">
          <h1>Document History</h1>
          <p>View and manage your generated receipts and invoices.</p>
        </div>
      </header>

      <div className="history-container-premium">
        <div className="history-tabs-premium">
          <button 
            className={`tab-btn-premium ${activeTab === 'receipts' ? 'active' : ''}`}
            onClick={() => setActiveTab('receipts')}
          >
            Receipts <span className="tab-count">{receipts.length}</span>
          </button>
          <button 
            className={`tab-btn-premium ${activeTab === 'invoices' ? 'active' : ''}`}
            onClick={() => setActiveTab('invoices')}
          >
            Invoices <span className="tab-count">{invoices.length}</span>
          </button>
        </div>

        <div className="history-list-premium">
          {activeTab === 'receipts' ? (
            receipts.length === 0 ? (
              <div className="empty-history">No receipts found.</div>
            ) : (
              receipts.map((item) => (
                <div key={item.id} className="history-card-premium">
                  <div className="h-card-main">
                    <div className="h-card-icon"><IconReceiptSmall /></div>
                    <div className="h-card-details">
                      <h3>{item.receipt_number}</h3>
                      <p>{item.customer_name || 'No Customer'} • {formatDate(item.date)}</p>
                    </div>
                  </div>
                  <div className="h-card-side">
                    <span className="h-card-amount">{money(item.total)}</span>
                    <button
                      className="h-card-action"
                      onClick={() => setViewDoc({ kind: 'receipt', data: item })}
                    >
                      View PDF
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            invoices.length === 0 ? (
              <div className="empty-history">No invoices found.</div>
            ) : (
              invoices.map((item) => (
                <div key={item.id} className="history-card-premium">
                  <div className="h-card-main">
                    <div className="h-card-icon"><IconInvoiceSmall /></div>
                    <div className="h-card-details">
                      <h3>{item.invoice_number}</h3>
                      <p>{item.customer_name} • {formatDate(item.issue_date)}</p>
                    </div>
                  </div>
                  <div className="h-card-side">
                    <span className={`h-status-badge ${item.status}`}>{item.status}</span>
                    <span className="h-card-amount">{money(item.total)}</span>
                    <button
                      className="h-card-action"
                      onClick={() => setViewDoc({ kind: 'invoice', data: item })}
                    >
                      View PDF
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {viewDoc && (
        <div
          className="doc-modal-overlay"
          onClick={() => setViewDoc(null)}
        >
          <div
            className="doc-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="doc-modal-header">
              <h2>
                {viewDoc.kind === 'invoice'
                  ? viewDoc.data.invoice_number
                  : viewDoc.data.receipt_number}
              </h2>
              <button className="doc-modal-close" onClick={() => setViewDoc(null)}>
                Close
              </button>
            </div>

            <div className="doc-modal-body">
              {viewDoc.kind === 'invoice' ? (
                <ProfessionalInvoice
                  invoiceNumber={viewDoc.data.invoice_number}
                  businessName={business?.name || ''}
                  businessAddress={business?.address}
                  businessCity={business?.city}
                  businessState={business?.state}
                  businessZip={business?.zip_code}
                  businessCountry={business?.country}
                  businessPhone={business?.phone}
                  businessEmail={business?.email}
                  businessTaxId={business?.tax_id}
                  currency={business?.currency}
                  customerName={viewDoc.data.customer_name}
                  customerEmail={viewDoc.data.customer_email}
                  customerPhone={viewDoc.data.customer_phone}
                  customerAddress={viewDoc.data.customer_address}
                  customerTaxId={viewDoc.data.customer_tax_id}
                  issueDate={viewDoc.data.issue_date}
                  items={viewDoc.data.items || []}
                  subtotal={viewDoc.data.subtotal}
                  taxRate={viewDoc.data.tax_rate}
                  taxAmount={viewDoc.data.tax_amount}
                  discount={viewDoc.data.discount}
                  total={viewDoc.data.total}
                  paymentTerms={viewDoc.data.payment_terms}
                  status={viewDoc.data.status}
                  notes={viewDoc.data.notes}
                />
              ) : (
                <ProfessionalReceipt
                  receiptNumber={viewDoc.data.receipt_number}
                  businessName={business?.name || ''}
                  businessAddress={business?.address}
                  businessCity={business?.city}
                  businessState={business?.state}
                  businessZip={business?.zip_code}
                  businessCountry={business?.country}
                  businessPhone={business?.phone}
                  businessEmail={business?.email}
                  businessTaxId={business?.tax_id}
                  currency={business?.currency}
                  customerName={viewDoc.data.customer_name}
                  customerEmail={viewDoc.data.customer_email}
                  customerPhone={viewDoc.data.customer_phone}
                  customerAddress={viewDoc.data.customer_address}
                  date={viewDoc.data.date}
                  items={viewDoc.data.items || []}
                  subtotal={viewDoc.data.subtotal}
                  taxRate={viewDoc.data.tax_rate}
                  taxAmount={viewDoc.data.tax_amount}
                  discount={viewDoc.data.discount}
                  total={viewDoc.data.total}
                  paymentMethod={viewDoc.data.payment_method}
                  notes={viewDoc.data.notes}
                />
              )}
            </div>

            <div className="doc-modal-actions">
              <button className="doc-modal-close" onClick={() => setViewDoc(null)}>
                Close
              </button>
              <button
                className="save-btn-premium"
                onClick={handleDownloadPDF}
                disabled={exporting}
              >
                {exporting ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
