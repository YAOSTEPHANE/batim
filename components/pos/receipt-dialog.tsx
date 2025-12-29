"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  Store, 
  Phone, 
  MapPin,
  Calendar,
  Receipt,
  CreditCard,
  User,
  Package,
  Hash
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface SaleItem {
  productId: string
  name: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
  unitLabel: string
}

interface Sale {
  id: string
  saleNumber: string
  items: SaleItem[]
  subtotal: number
  discountAmount: number
  discountPercent?: number | null
  total: number
  paymentMethod: string
  amountPaid: number
  change: number
  remainingAmount?: number
  customerName?: string | null
  customerPhone?: string | null
  clientName?: string | null
  dueDate?: string | null
  createdAt: string
  user?: { name: string }
}

interface ReceiptDialogProps {
  open: boolean
  onClose: () => void
  sale: Sale | null
}

// Configuration du magasin (peut être déplacé dans les paramètres)
const storeConfig = {
  name: "Quincaillerie Pro",
  address: "123 Avenue du Commerce",
  city: "Douala, Cameroun",
  phone: "+237 6XX XXX XXX",
  email: "contact@quincaillerie.com",
  taxId: "RC/DLA/2024/B/XXXX",
  slogan: "Votre partenaire en construction",
}

const paymentMethodLabels: Record<string, string> = {
  CASH: "Espèces",
  MOBILE_MONEY: "Mobile Money",
  CARD: "Carte bancaire",
  CREDIT: "Crédit",
}

export function ReceiptDialog({ open, onClose, sale }: ReceiptDialogProps) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const [isPrinting, setIsPrinting] = useState(false)

  if (!sale) return null

  const handlePrint = () => {
    setIsPrinting(true)
    
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      setIsPrinting(false)
      return
    }

    const receiptContent = generateReceiptHTML(sale)
    
    printWindow.document.write(receiptContent)
    printWindow.document.close()
    
    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
      printWindow.onafterprint = () => {
        printWindow.close()
        setIsPrinting(false)
      }
    }
  }

  const handleDownloadPDF = async () => {
    // Import dynamique de jsPDF
    const { jsPDF } = await import('jspdf')
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200] // Format ticket de caisse
    })

    let y = 10

    // En-tête
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(storeConfig.name, 40, y, { align: 'center' })
    y += 5
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(storeConfig.address, 40, y, { align: 'center' })
    y += 4
    doc.text(storeConfig.city, 40, y, { align: 'center' })
    y += 4
    doc.text(`Tél: ${storeConfig.phone}`, 40, y, { align: 'center' })
    y += 6

    // Ligne de séparation
    doc.setLineWidth(0.5)
    doc.line(5, y, 75, y)
    y += 5

    // Infos de la vente
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`REÇU N° ${sale.saleNumber}`, 40, y, { align: 'center' })
    y += 5

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Date: ${format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}`, 5, y)
    y += 4
    if (sale.user?.name) {
      doc.text(`Vendeur: ${sale.user.name}`, 5, y)
      y += 4
    }
    if (sale.customerName || sale.clientName) {
      doc.text(`Client: ${sale.clientName || sale.customerName}`, 5, y)
      y += 4
    }
    y += 2

    // Ligne de séparation
    doc.line(5, y, 75, y)
    y += 5

    // Articles
    doc.setFont('helvetica', 'bold')
    doc.text('Article', 5, y)
    doc.text('Qté', 45, y)
    doc.text('Total', 60, y)
    y += 4
    doc.line(5, y, 75, y)
    y += 4

    doc.setFont('helvetica', 'normal')
    sale.items.forEach((item) => {
      // Nom du produit (tronqué si trop long)
      const name = item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name
      doc.text(name, 5, y)
      doc.text(item.quantity.toString(), 50, y, { align: 'center' })
      doc.text(formatCurrency(item.total).replace(' F CFA', ''), 75, y, { align: 'right' })
      y += 4
      
      // Prix unitaire
      doc.setFontSize(7)
      doc.text(`@ ${formatCurrency(item.unitPrice)}`, 8, y)
      doc.setFontSize(8)
      y += 4
    })

    // Ligne de séparation
    y += 2
    doc.line(5, y, 75, y)
    y += 5

    // Totaux
    doc.text('Sous-total:', 5, y)
    doc.text(formatCurrency(sale.subtotal).replace(' F CFA', ''), 75, y, { align: 'right' })
    y += 4

    if (sale.discountAmount > 0) {
      doc.text('Remise:', 5, y)
      doc.text(`-${formatCurrency(sale.discountAmount).replace(' F CFA', '')}`, 75, y, { align: 'right' })
      y += 4
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('TOTAL:', 5, y)
    doc.text(formatCurrency(sale.total), 75, y, { align: 'right' })
    y += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(`Paiement: ${paymentMethodLabels[sale.paymentMethod] || sale.paymentMethod}`, 5, y)
    y += 4
    doc.text(`Montant reçu: ${formatCurrency(sale.amountPaid)}`, 5, y)
    y += 4

    if (sale.paymentMethod === 'CREDIT' && sale.remainingAmount && sale.remainingAmount > 0) {
      doc.setFont('helvetica', 'bold')
      doc.text(`Reste à payer: ${formatCurrency(sale.remainingAmount)}`, 5, y)
      y += 4
      if (sale.dueDate) {
        doc.setFont('helvetica', 'normal')
        doc.text(`Échéance: ${format(new Date(sale.dueDate), "dd/MM/yyyy", { locale: fr })}`, 5, y)
        y += 4
      }
    } else if (sale.change > 0) {
      doc.text(`Monnaie: ${formatCurrency(sale.change)}`, 5, y)
      y += 4
    }

    // Ligne de séparation
    y += 2
    doc.line(5, y, 75, y)
    y += 5

    // Pied de page
    doc.setFontSize(8)
    doc.text('Merci de votre visite !', 40, y, { align: 'center' })
    y += 4
    doc.text(storeConfig.slogan, 40, y, { align: 'center' })
    y += 6

    doc.setFontSize(6)
    doc.text(`${storeConfig.taxId}`, 40, y, { align: 'center' })

    // Télécharger le PDF
    doc.save(`recu-${sale.saleNumber}.pdf`)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            Vente effectuée avec succès !
          </DialogTitle>
        </DialogHeader>

        {/* Reçu */}
        <div 
          ref={receiptRef}
          className="bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 font-mono text-sm"
        >
          {/* En-tête du magasin */}
          <div className="text-center mb-4 pb-4 border-b border-dashed border-gray-300 dark:border-gray-600">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Store className="w-6 h-6 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{storeConfig.name}</h3>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <div className="flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3" />
                {storeConfig.address}
              </div>
              <div>{storeConfig.city}</div>
              <div className="flex items-center justify-center gap-1">
                <Phone className="w-3 h-3" />
                {storeConfig.phone}
              </div>
            </div>
          </div>

          {/* Infos de la vente */}
          <div className="mb-4 pb-4 border-b border-dashed border-gray-300 dark:border-gray-600">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Receipt className="w-5 h-5 text-indigo-600" />
              <span className="text-lg font-bold">REÇU N° {sale.saleNumber}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1 text-gray-500">
                <Calendar className="w-3 h-3" />
                {format(new Date(sale.createdAt), "dd MMM yyyy HH:mm", { locale: fr })}
              </div>
              {sale.user?.name && (
                <div className="flex items-center gap-1 text-gray-500">
                  <User className="w-3 h-3" />
                  {sale.user.name}
                </div>
              )}
            </div>
            {(sale.customerName || sale.clientName) && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                <span className="font-medium">Client:</span> {sale.clientName || sale.customerName}
                {sale.customerPhone && <span className="ml-2">({sale.customerPhone})</span>}
              </div>
            )}
          </div>

          {/* Articles */}
          <div className="mb-4 pb-4 border-b border-dashed border-gray-300 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-3 text-gray-700 dark:text-gray-300">
              <Package className="w-4 h-4" />
              <span className="font-medium">Articles ({sale.items.length})</span>
            </div>
            <div className="space-y-2">
              {sale.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start text-xs">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 dark:text-gray-200">{item.name}</div>
                    <div className="text-gray-500">
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </div>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totaux */}
          <div className="space-y-2 mb-4 pb-4 border-b border-dashed border-gray-300 dark:border-gray-600">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Sous-total</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>
            {sale.discountAmount > 0 && (
              <div className="flex justify-between text-xs text-orange-600">
                <span>Remise {sale.discountPercent ? `(${sale.discountPercent}%)` : ''}</span>
                <span>-{formatCurrency(sale.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
              <span>TOTAL</span>
              <span className="text-green-600">{formatCurrency(sale.total)}</span>
            </div>
          </div>

          {/* Paiement */}
          <div className="space-y-2 mb-4 pb-4 border-b border-dashed border-gray-300 dark:border-gray-600">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <CreditCard className="w-4 h-4" />
              <span className="font-medium">Paiement</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Mode</span>
              <span className="font-medium">{paymentMethodLabels[sale.paymentMethod] || sale.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Montant reçu</span>
              <span>{formatCurrency(sale.amountPaid)}</span>
            </div>
            
            {sale.paymentMethod === 'CREDIT' && sale.remainingAmount && sale.remainingAmount > 0 ? (
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded mt-2">
                <div className="flex justify-between text-sm font-bold text-red-600">
                  <span>Reste à payer</span>
                  <span>{formatCurrency(sale.remainingAmount)}</span>
                </div>
                {sale.dueDate && (
                  <div className="text-xs text-red-500 mt-1">
                    Échéance: {format(new Date(sale.dueDate), "dd MMMM yyyy", { locale: fr })}
                  </div>
                )}
              </div>
            ) : sale.change > 0 && (
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded mt-2">
                <div className="flex justify-between text-sm font-bold text-blue-600">
                  <span>Monnaie à rendre</span>
                  <span>{formatCurrency(sale.change)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Pied de page */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            <p className="font-medium mb-1">Merci de votre visite !</p>
            <p className="italic">{storeConfig.slogan}</p>
            <p className="mt-2 text-[10px]">{storeConfig.taxId}</p>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handlePrint}
            disabled={isPrinting}
          >
            <Printer className="w-4 h-4 mr-2" />
            {isPrinting ? "Impression..." : "Imprimer"}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDownloadPDF}
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger PDF
          </Button>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          onClick={onClose}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Nouvelle vente
        </Button>
      </DialogContent>
    </Dialog>
  )
}

// Génération du HTML pour l'impression
function generateReceiptHTML(sale: Sale): string {
  const itemsHTML = sale.items.map(item => `
    <tr>
      <td style="padding: 4px 0; border-bottom: 1px dotted #ddd;">
        <div style="font-weight: 500;">${item.name}</div>
        <div style="font-size: 11px; color: #666;">${item.quantity} x ${formatCurrency(item.unitPrice)}</div>
      </td>
      <td style="padding: 4px 0; text-align: right; border-bottom: 1px dotted #ddd; font-weight: 500;">
        ${formatCurrency(item.total)}
      </td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reçu ${sale.saleNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Courier New', monospace; 
          font-size: 12px; 
          width: 80mm; 
          padding: 10px;
          background: white;
        }
        .header { text-align: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px dashed #333; }
        .store-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        .store-info { font-size: 10px; color: #666; line-height: 1.4; }
        .receipt-info { margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #ccc; }
        .receipt-number { font-size: 14px; font-weight: bold; text-align: center; margin-bottom: 10px; }
        .info-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px; }
        .items-table { width: 100%; margin-bottom: 15px; border-collapse: collapse; }
        .totals { margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #ccc; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .total-row.grand { font-size: 16px; font-weight: bold; padding-top: 10px; border-top: 2px solid #333; }
        .payment { margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #ccc; }
        .footer { text-align: center; font-size: 10px; color: #666; }
        .footer p { margin-bottom: 5px; }
        .credit-warning { background: #fee; padding: 8px; border-radius: 4px; margin-top: 10px; }
        .change-info { background: #eef; padding: 8px; border-radius: 4px; margin-top: 10px; }
        @media print {
          body { width: 80mm; }
          @page { size: 80mm auto; margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="store-name">${storeConfig.name}</div>
        <div class="store-info">
          ${storeConfig.address}<br>
          ${storeConfig.city}<br>
          Tél: ${storeConfig.phone}
        </div>
      </div>

      <div class="receipt-info">
        <div class="receipt-number">REÇU N° ${sale.saleNumber}</div>
        <div class="info-row">
          <span>Date:</span>
          <span>${format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}</span>
        </div>
        ${sale.user?.name ? `
        <div class="info-row">
          <span>Vendeur:</span>
          <span>${sale.user.name}</span>
        </div>
        ` : ''}
        ${sale.customerName || sale.clientName ? `
        <div class="info-row">
          <span>Client:</span>
          <span>${sale.clientName || sale.customerName}</span>
        </div>
        ` : ''}
      </div>

      <table class="items-table">
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Sous-total</span>
          <span>${formatCurrency(sale.subtotal)}</span>
        </div>
        ${sale.discountAmount > 0 ? `
        <div class="total-row" style="color: #e67e22;">
          <span>Remise${sale.discountPercent ? ` (${sale.discountPercent}%)` : ''}</span>
          <span>-${formatCurrency(sale.discountAmount)}</span>
        </div>
        ` : ''}
        <div class="total-row grand">
          <span>TOTAL</span>
          <span>${formatCurrency(sale.total)}</span>
        </div>
      </div>

      <div class="payment">
        <div class="total-row">
          <span>Mode de paiement:</span>
          <span>${paymentMethodLabels[sale.paymentMethod] || sale.paymentMethod}</span>
        </div>
        <div class="total-row">
          <span>Montant reçu:</span>
          <span>${formatCurrency(sale.amountPaid)}</span>
        </div>
        ${sale.paymentMethod === 'CREDIT' && sale.remainingAmount && sale.remainingAmount > 0 ? `
        <div class="credit-warning">
          <div class="total-row" style="font-weight: bold; color: #c0392b;">
            <span>Reste à payer:</span>
            <span>${formatCurrency(sale.remainingAmount)}</span>
          </div>
          ${sale.dueDate ? `
          <div style="font-size: 10px; color: #c0392b; margin-top: 5px;">
            Échéance: ${format(new Date(sale.dueDate), "dd MMMM yyyy", { locale: fr })}
          </div>
          ` : ''}
        </div>
        ` : sale.change > 0 ? `
        <div class="change-info">
          <div class="total-row" style="font-weight: bold; color: #2980b9;">
            <span>Monnaie à rendre:</span>
            <span>${formatCurrency(sale.change)}</span>
          </div>
        </div>
        ` : ''}
      </div>

      <div class="footer">
        <p style="font-weight: bold;">Merci de votre visite !</p>
        <p style="font-style: italic;">${storeConfig.slogan}</p>
        <p style="margin-top: 10px; font-size: 9px;">${storeConfig.taxId}</p>
      </div>
    </body>
    </html>
  `
}




