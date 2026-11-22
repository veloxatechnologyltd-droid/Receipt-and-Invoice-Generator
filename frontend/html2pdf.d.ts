declare module 'html2pdf.js' {
  interface Html2PdfWorker {
    set(options: Record<string, any>): Html2PdfWorker
    from(element: HTMLElement | string): Html2PdfWorker
    save(): Promise<void>
  }

  interface Html2PdfFactory {
    (): Html2PdfWorker
  }

  const html2pdf: Html2PdfFactory
  export default html2pdf
}
