/**
 * Script pour créer des indexes MongoDB optimisés
 * Exécuter avec: npx tsx prisma/indexes.ts
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Fonction helper pour créer des indexes en ignorant les conflits
async function safeCreateIndexes(collection: string, indexes: any[]) {
  for (const index of indexes) {
    try {
      await prisma.$runCommandRaw({
        createIndexes: collection,
        indexes: [index],
      })
      console.log(`  ✓ Index "${index.name}" créé`)
    } catch (error: any) {
      if (error.meta?.message?.includes("IndexOptionsConflict") || 
          error.meta?.message?.includes("already exists")) {
        console.log(`  ⚠ Index "${index.name}" existe déjà, ignoré`)
      } else {
        console.log(`  ✗ Erreur pour "${index.name}": ${error.message}`)
      }
    }
  }
}

async function createIndexes() {
  console.log("🔧 Création des indexes MongoDB pour optimisation...\n")

  try {
    // Indexes pour les produits
    console.log("📦 Indexes pour les produits:")
    await safeCreateIndexes("products", [
      {
        key: { name: "text", sku: "text", barcode: "text" },
        name: "products_search_text",
        weights: { name: 10, sku: 5, barcode: 5 },
      },
      {
        key: { active: 1, quantity: 1 },
        name: "products_active_quantity",
      },
      {
        key: { categoryId: 1, active: 1 },
        name: "products_category_active",
      },
      {
        key: { quantity: 1, minThreshold: 1 },
        name: "products_low_stock",
      },
    ])

    // Indexes pour les ventes
    console.log("\n💰 Indexes pour les ventes:")
    await safeCreateIndexes("sales", [
      {
        key: { createdAt: -1 },
        name: "sales_created_desc",
      },
      {
        key: { isPaid: 1, remainingAmount: 1 },
        name: "sales_unpaid",
      },
      {
        key: { clientId: 1, createdAt: -1 },
        name: "sales_client_date",
      },
      {
        key: { paymentMethod: 1, isPaid: 1 },
        name: "sales_payment_status",
      },
      {
        key: { dueDate: 1, isPaid: 1 },
        name: "sales_due_date",
      },
      {
        key: { userId: 1, createdAt: -1 },
        name: "sales_user_date",
      },
    ])

    // Indexes pour les articles de vente
    console.log("\n📝 Indexes pour les articles de vente:")
    await safeCreateIndexes("saleItems", [
      {
        key: { productId: 1, saleId: 1 },
        name: "saleItems_product_sale_compound",
      },
    ])

    // Indexes pour les clients
    console.log("\n👥 Indexes pour les clients:")
    await safeCreateIndexes("clients", [
      {
        key: { name: "text", phone: "text" },
        name: "clients_search_text",
      },
      {
        key: { status: 1, soldeActuel: 1 },
        name: "clients_status_debt",
      },
      {
        key: { soldeActuel: -1 },
        name: "clients_debt_desc",
      },
    ])

    // Indexes pour les paiements
    console.log("\n💳 Indexes pour les paiements:")
    await safeCreateIndexes("payments", [
      {
        key: { clientId: 1, createdAt: -1 },
        name: "payments_client_date_compound",
      },
      {
        key: { saleId: 1, createdAt: -1 },
        name: "payments_sale_date_compound",
      },
    ])

    // Indexes pour les bons de commande
    console.log("\n📋 Indexes pour les bons de commande:")
    await safeCreateIndexes("purchaseOrders", [
      {
        key: { status: 1, orderDate: -1 },
        name: "purchases_status_date",
      },
      {
        key: { supplierId: 1, orderDate: -1 },
        name: "purchases_supplier_date_compound",
      },
    ])

    // Indexes pour les mouvements de stock
    console.log("\n📊 Indexes pour les mouvements de stock:")
    await safeCreateIndexes("stockMovements", [
      {
        key: { productId: 1, createdAt: -1 },
        name: "stock_product_date_compound",
      },
      {
        key: { type: 1, createdAt: -1 },
        name: "stock_type_date",
      },
    ])

    console.log("\n✅ Traitement des indexes terminé!")

    // Afficher les indexes existants
    console.log("\n📋 Liste des indexes existants:")
    
    const collections = ["products", "sales", "saleItems", "clients", "payments", "purchaseOrders", "stockMovements"]
    
    for (const collection of collections) {
      try {
        const indexes = await prisma.$runCommandRaw({
          listIndexes: collection,
        }) as any
        
        console.log(`\n${collection}:`)
        const indexList = indexes?.cursor?.firstBatch || []
        indexList.forEach((idx: any) => {
          console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`)
        })
      } catch (error) {
        console.log(`\n${collection}: (collection non trouvée)`)
      }
    }

  } catch (error) {
    console.error("❌ Erreur lors de la création des indexes:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createIndexes()
  .then(() => {
    console.log("\n🎉 Optimisation des indexes terminée!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Erreur:", error)
    process.exit(1)
  })

