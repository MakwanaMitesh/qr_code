'use client'
import { useState } from 'react'

const faqs = [
  {
    id: 'faq1',
    q: 'What is a QR code?',
    a: 'A QR (Quick Response) code is a 2D barcode that can be scanned by smartphones to quickly access URLs, text, contact information, and more without typing anything.',
    open: true,
  },
  {
    id: 'faq2',
    q: 'How do I generate a QR code?',
    a: 'Choose the code type, enter your content, customize colors and size if needed, then click Download PNG to save your high-resolution QR code.',
  },
  {
    id: 'faq3',
    q: 'Are the generated codes free?',
    a: 'Yes! QRCraft is 100% free. You can generate unlimited codes without any subscription, login, or payment required.',
  },
  {
    id: 'faq4',
    q: 'Can I download the generated codes?',
    a: 'Absolutely! You can download your generated codes as high-resolution PNG or SVG files, ready for print and digital use.',
  },
  {
    id: 'faq5',
    q: 'Can I generate barcodes?',
    a: 'Yes, QRCraft supports barcode generation in addition to QR codes. Select "Barcode" from the tool sidebar to get started.',
  },
  {
    id: 'faq6',
    q: 'Do I need to create an account?',
    a: 'No account required. QRCraft is designed to be instant and friction-free - just open the page and start generating.',
  },
]

function AccordionItem({ item, groupId }) {
  const [open, setOpen] = useState(item.open || false)
  return (
    <div className="accordion-item">
      <h2 className="accordion-header">
        <button
          className={`accordion-button${open ? '' : ' collapsed'}`}
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          id={`faq-btn-${item.id}`}
        >
          {item.q}
        </button>
      </h2>
      <div className={`accordion-collapse collapse${open ? ' show' : ''}`} id={item.id}>
        <div className="accordion-body">{item.a}</div>
      </div>
    </div>
  )
}

export default function FAQ() {
  const left  = faqs.slice(0, 3)
  const right = faqs.slice(3)

  return (
    <section id="faq" aria-label="Frequently asked questions">
      <div className="container py-5">
        <div className="text-center mb-5">
          <p className="section-label">Frequently Asked Questions</p>
          <h2 className="section-title">Everything You Need to Know</h2>
        </div>
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="accordion" id="faq-left">
              {left.map(item => <AccordionItem key={item.id} item={item} groupId="faq-left" />)}
            </div>
          </div>
          <div className="col-lg-6">
            <div className="accordion" id="faq-right">
              {right.map(item => <AccordionItem key={item.id} item={item} groupId="faq-right" />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
