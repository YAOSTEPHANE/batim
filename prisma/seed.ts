import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Créer des catégories
  const categoriesData = [
    { name: "Outils", description: "Outils manuels et électriques" },
    { name: "Quincaillerie", description: "Vis, boulons, écrous" },
    { name: "Peinture", description: "Peintures et accessoires" },
    { name: "Plomberie", description: "Tuyaux, robinets, accessoires" },
    { name: "Électricité", description: "Câbles, interrupteurs, prises" },
    { name: "Matériaux de construction", description: "Ciment, sable, gravier" },
  ]

  const categories: Record<string, any> = {}
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    })
    categories[cat.name] = category
  }
  console.log("✅ Categories created")

  // Créer des marques
  const brandsData = [
    { name: "Bosch" },
    { name: "Stanley" },
    { name: "DeWalt" },
    { name: "Makita" },
    { name: "Generic" },
    { name: "Black & Decker" },
    { name: "Sika" },
    { name: "Legrand" },
  ]

  const brands: Record<string, any> = {}
  for (const brand of brandsData) {
    const b = await prisma.brand.upsert({
      where: { name: brand.name },
      update: {},
      create: brand,
    })
    brands[brand.name] = b
  }
  console.log("✅ Brands created")

  // Créer des fournisseurs
  const suppliersData = [
    {
      name: "Fournitures Pro",
      contactName: "Jean Dupont",
      email: "contact@fourniturespro.com",
      phone: "+225 07 00 00 01",
      address: "Zone Industrielle, Abidjan",
    },
    {
      name: "Quincaillerie Centrale",
      contactName: "Marie Koné",
      email: "info@quincailleriecentrale.ci",
      phone: "+225 07 00 00 02",
      address: "Marcory, Abidjan",
    },
    {
      name: "Import Tools CI",
      contactName: "Ahmed Touré",
      email: "ahmed@importtools.ci",
      phone: "+225 07 00 00 03",
      address: "Port Autonome, Abidjan",
    },
  ]

  const suppliers: Record<string, any> = {}
  for (const sup of suppliersData) {
    // Vérifier si le fournisseur existe déjà
    let supplier = await prisma.supplier.findFirst({
      where: { name: sup.name },
    })
    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: sup,
      })
    }
    suppliers[sup.name] = supplier
  }
  console.log("✅ Suppliers created")

  // Créer des utilisateurs
  const hashedPassword = await bcrypt.hash("admin123", 10)
  await prisma.user.upsert({
    where: { email: "admin@quincaillerie.com" },
    update: {},
    create: {
      email: "admin@quincaillerie.com",
      password: hashedPassword,
      name: "Administrateur",
      role: "ADMIN",
    },
  })
  console.log("✅ Admin user created (email: admin@quincaillerie.com, password: admin123)")

  const stockManagerPassword = await bcrypt.hash("stock123", 10)
  await prisma.user.upsert({
    where: { email: "stock@quincaillerie.com" },
    update: {},
    create: {
      email: "stock@quincaillerie.com",
      password: stockManagerPassword,
      name: "Gestionnaire Stock",
      role: "STOCK_MANAGER",
    },
  })
  console.log("✅ Stock manager created (email: stock@quincaillerie.com, password: stock123)")

  const cashierPassword = await bcrypt.hash("cashier123", 10)
  await prisma.user.upsert({
    where: { email: "cashier@quincaillerie.com" },
    update: {},
    create: {
      email: "cashier@quincaillerie.com",
      password: cashierPassword,
      name: "Caissier",
      role: "CASHIER",
    },
  })
  console.log("✅ Cashier created (email: cashier@quincaillerie.com, password: cashier123)")

  // Créer des clients
  const clientsData = [
    {
      name: "Entreprise BTP Côte d'Ivoire",
      phone: "+225 05 00 00 01",
      email: "contact@btpci.com",
      address: "Cocody, Abidjan",
      limiteCredit: 2000000,
      status: "ACTIVE" as const,
    },
    {
      name: "Construction Moderne",
      phone: "+225 05 00 00 02",
      email: "info@constructionmoderne.ci",
      address: "Plateau, Abidjan",
      limiteCredit: 1500000,
      status: "ACTIVE" as const,
    },
    {
      name: "Artisan Koffi",
      phone: "+225 05 00 00 03",
      email: "koffi.artisan@gmail.com",
      address: "Yopougon, Abidjan",
      limiteCredit: 500000,
      status: "ACTIVE" as const,
    },
    {
      name: "Menuiserie Excellence",
      phone: "+225 05 00 00 04",
      email: "excellence.menuiserie@gmail.com",
      address: "Abobo, Abidjan",
      limiteCredit: 750000,
      status: "ACTIVE" as const,
    },
    {
      name: "Électricité Plus",
      phone: "+225 05 00 00 05",
      email: "elecplus@gmail.com",
      address: "Treichville, Abidjan",
      limiteCredit: 1000000,
      status: "ACTIVE" as const,
    },
  ]

  for (const client of clientsData) {
    await prisma.client.upsert({
      where: { phone: client.phone },
      update: {},
      create: client,
    })
  }
  console.log("✅ Clients created")

  // Créer des produits (unitType: UNIT, LENGTH, BULK) avec images
  const productsData = [
    // Outils
    {
      name: "Perceuse sans fil 18V",
      description: "Perceuse visseuse sans fil avec 2 batteries",
      sku: "OUT-PER-001",
      barcode: "3000000000001",
      categoryId: categories["Outils"].id,
      brandId: brands["Bosch"].id,
      unitType: "UNIT",
      unitLabel: "pièce",
      purchasePrice: 45000,
      sellingPrice: 65000,
      quantity: 15,
      minThreshold: 5,
      imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop",
    },
    {
      name: "Marteau de charpentier 500g",
      description: "Marteau professionnel manche fibre de verre",
      sku: "OUT-MAR-001",
      barcode: "3000000000002",
      categoryId: categories["Outils"].id,
      brandId: brands["Stanley"].id,
      unitType: "UNIT",
      unitLabel: "pièce",
      purchasePrice: 8500,
      sellingPrice: 12500,
      quantity: 30,
      minThreshold: 10,
      imageUrl: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400&h=400&fit=crop",
    },
    {
      name: "Scie circulaire 185mm",
      description: "Scie circulaire 1400W avec guide laser",
      sku: "OUT-SCI-001",
      barcode: "3000000000003",
      categoryId: categories["Outils"].id,
      brandId: brands["DeWalt"].id,
      unitType: "UNIT",
      unitLabel: "pièce",
      purchasePrice: 85000,
      sellingPrice: 115000,
      quantity: 8,
      minThreshold: 3,
      imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=400&fit=crop",
    },
    {
      name: "Meuleuse d'angle 125mm",
      description: "Meuleuse 900W avec disque diamant",
      sku: "OUT-MEU-001",
      barcode: "3000000000004",
      categoryId: categories["Outils"].id,
      brandId: brands["Makita"].id,
      unitType: "UNIT",
      unitLabel: "pièce",
      purchasePrice: 35000,
      sellingPrice: 52000,
      quantity: 12,
      minThreshold: 4,
      imageUrl: "https://images.unsplash.com/photo-1580402427914-a6cc60d7b44f?w=400&h=400&fit=crop",
    },
    {
      name: "Niveau à bulle 60cm",
      description: "Niveau professionnel aluminium",
      sku: "OUT-NIV-001",
      barcode: "3000000000005",
      categoryId: categories["Outils"].id,
      brandId: brands["Stanley"].id,
      unitType: "UNIT",
      unitLabel: "pièce",
      purchasePrice: 5500,
      sellingPrice: 8500,
      quantity: 25,
      minThreshold: 8,
      imageUrl: "https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=400&h=400&fit=crop",
    },
    {
      name: "Tournevis cruciforme PH2",
      description: "Tournevis professionnel isolé 1000V",
      sku: "OUT-TOU-001",
      barcode: "3000000000006",
      categoryId: categories["Outils"].id,
      brandId: brands["Stanley"].id,
      unitType: "UNIT",
      unitLabel: "pièce",
      purchasePrice: 2500,
      sellingPrice: 4000,
      quantity: 50,
      minThreshold: 15,
      imageUrl: "https://images.unsplash.com/photo-1426927308491-6380b6a9936f?w=400&h=400&fit=crop",
    },
    {
      name: "Clé à molette 250mm",
      description: "Clé à molette réglable chromée",
      sku: "OUT-CLE-001",
      barcode: "3000000000007",
      categoryId: categories["Outils"].id,
      brandId: brands["Stanley"].id,
      unitType: "UNIT",
      unitLabel: "pièce",
      purchasePrice: 6000,
      sellingPrice: 9500,
      quantity: 20,
      minThreshold: 6,
      imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop",
    },
    {
      name: "Pince multiprise 250mm",
      description: "Pince multiprise ajustable",
      sku: "OUT-PIN-001",
      barcode: "3000000000008",
      categoryId: categories["Outils"].id,
      brandId: brands["Stanley"].id,
      unitType: "UNIT",
      unitLabel: "pièce",
      purchasePrice: 4500,
      sellingPrice: 7000,
      quantity: 35,
      minThreshold: 10,
      imageUrl: "https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=400&h=400&fit=crop",
    },

    // Quincaillerie
    {
      name: "Vis à bois 4x40mm (boîte 200)",
      description: "Vis à bois tête fraisée zinguée",
      sku: "QUI-VIS-001",
      barcode: "3000000000009",
      categoryId: categories["Quincaillerie"].id,
      brandId: brands["Generic"].id,
      unitType: "UNIT",
      unitLabel: "boîte",
      purchasePrice: 3500,
      sellingPrice: 5500,
      quantity: 100,
      minThreshold: 30,
      imageUrl: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
    },
    {
      name: "Vis à bois 5x50mm (boîte 200)",
      description: "Vis à bois tête fraisée zinguée",
      sku: "QUI-VIS-002",
      barcode: "3000000000010",
      categoryId: categories["Quincaillerie"].id,
      brandId: brands["Generic"].id,
      unitType: "UNIT",
      unitLabel: "boîte",
      purchasePrice: 4200,
      sellingPrice: 6500,
      quantity: 80,
      minThreshold: 25,
      imageUrl: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
    },
    {
      name: "Boulon M8x60mm (sachet 50)",
      description: "Boulon hexagonal avec écrou",
      sku: "QUI-BOU-001",
      barcode: "3000000000011",
      categoryId: categories["Quincaillerie"].id,
      brandId: brands["Generic"].id,
      unitType: "UNIT",
      unitLabel: "sachet",
      purchasePrice: 5000,
      sellingPrice: 7500,
      quantity: 60,
      minThreshold: 20,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    },
    {
      name: "Cheville nylon 8mm (boîte 100)",
      description: "Cheville expansion universelle",
      sku: "QUI-CHE-001",
      barcode: "3000000000012",
      categoryId: categories["Quincaillerie"].id,
      brandId: brands["Generic"].id,
      unitType: "UNIT",
      unitLabel: "boîte",
      purchasePrice: 2800,
      sellingPrice: 4500,
      quantity: 150,
      minThreshold: 40,
      imageUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&h=400&fit=crop",
    },
    {
      name: "Clou tête plate 4x80mm (kg)",
      description: "Clou acier zingué",
      sku: "QUI-CLO-001",
      barcode: "3000000000013",
      categoryId: categories["Quincaillerie"].id,
      brandId: brands["Generic"].id,
      unitType: "BULK",
      unitLabel: "kg",
      purchasePrice: 1500,
      sellingPrice: 2500,
      quantity: 200,
      minThreshold: 50,
      imageUrl: "https://images.unsplash.com/photo-1558618047-f4b511e69c09?w=400&h=400&fit=crop",
    },
    {
      name: "Cadenas 50mm",
      description: "Cadenas laiton avec 3 clés",
      sku: "QUI-CAD-001",
      barcode: "3000000000014",
      categoryId: categories["Quincaillerie"].id,
      brandId: brands["Generic"].id,
      unitType: "UNIT",
      unitLabel: "pièce",
      purchasePrice: 3500,
      sellingPrice: 5500,
      quantity: 40,
      minThreshold: 12,
      imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop",
    },
    {
      name: "Charnière 100mm (paire)",
      description: "Charnière acier inox",
      sku: "QUI-CHA-001",
      barcode: "3000000000015",
      categoryId: categories["Quincaillerie"].id,
      brandId: brands["Generic"].id,
      unitType: "UNIT",
      unitLabel: "paire",
      purchasePrice: 2000,
      sellingPrice: 3500,
      quantity: 70,
      minThreshold: 20,
      imageUrl: "https://images.unsplash.com/photo-1590959651373-a3db0f38a961?w=400&h=400&fit=crop",
    },

    // Peinture
    {
      name: "Peinture acrylique blanche 20L",
      description: "Peinture murale intérieure mat",
      sku: "PEI-ACR-001",
      barcode: "3000000000016",
      categoryId: categories["Peinture"].id,
      brandId: brands["Sika"].id,
      unitType: "UNIT",
      unitLabel: "seau",
      purchasePrice: 25000,
      sellingPrice: 38000,
      quantity: 25,
      minThreshold: 8,
      imageUrl: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=400&fit=crop",
    },
    {
      name: "Peinture glycéro brillante 5L",
      description: "Peinture boiserie et métal",
      sku: "PEI-GLY-001",
      barcode: "3000000000017",
      categoryId: categories["Peinture"].id,
      brandId: brands["Sika"].id,
      unitType: "UNIT",
      unitLabel: "pot",
      purchasePrice: 18000,
      sellingPrice: 27000,
      quantity: 20,
      minThreshold: 6,
      imageUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
    },
    {
      name: "Rouleau peinture 180mm",
      description: "Rouleau anti-goutte avec monture",
      sku: "PEI-ROU-001",
      barcode: "3000000000018",
      categoryId: categories["Peinture"].id,
      brandId: brands["Generic"].id,
      unitType: "UNIT",
      unitLabel: "pièce",
      purchasePrice: 2500,
      sellingPrice: 4000,
      quantity: 45,
      minThreshold: 15,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    },
    {
      name: "Pinceau plat 80mm",
      description: "Pinceau soies naturelles",
      sku: "PEI-PIN-001",
      barcode: "3000000000019",
      categoryId: categories["Peinture"].id,
      brandId: brands["Generic"].id,
      unitType: "UNIT",
      unitLabel: "pièce",
      purchasePrice: 1500,
      sellingPrice: 2500,
      quantity: 60,
      minThreshold: 20,
      imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=400&fit=crop",
    },
    {
      name: "Bâche de protection 4x5m",
      description: "Bâche plastique épaisse",
      sku: "PEI-BAC-001",
      barcode: "3000000000020",
      categoryId: categories["Peinture"].id,
      brandId: brands["Generic"].id,
      unitType: "UNIT",
      unitLabel: "pièce",
      purchasePrice: 3000,
      sellingPrice: 5000,
      quantity: 30,
      minThreshold: 10,
      imageUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&h=400&fit=crop",
    },
    {
      name: "Ruban de masquage 50mm x 50m",
      description: "Ruban adhésif peintre",
      sku: "PEI-RUB-001",
      barcode: "3000000000021",
      categoryId: categories["Peinture"].id,
      brandId: brands["Generic"].id,
      unitType: "UNIT",
      unitLabel: "rouleau",
      purchasePrice: 1200,
      sellingPrice: 2000,
      quantity: 80,
      minThreshold: 25,
      imageUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop",
    },

    // Plomberie
    {
      name: "Tuyau PVC 100mm (4m)",
      description: "Tuyau évacuation PVC rigide",
      sku: "PLO-TUY-001",
      barcode: "3000000000022",
      categoryId: categories["Plomberie"].id,
      brandId: brands["Generic"].id,
      unitType: "LENGTH",
      unitLabel: "barre",
      purchasePrice: 8500,
      sellingPrice: 12500,
      quantity: 40,
      minThreshold: 12,
      imageUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop",
    },
    {
      name: "Robinet mitigeur lavabo",
      description: "Mitigeur chromé mono-commande",
      sku: "PLO-ROB-001",
      barcode: "3000000000023",
      categoryId: categories["Plomberie"].id,
      brandId: brands["Generic"].id,
      unitType: "UNIT",
      imageUrl: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=400&fit=crop",
      unitLabel: "pièce",
      purchasePrice: 15000,
      sellingPrice: 24000,
      quantity: 18,
      minThreshold: 5,
    },
    {
      name: "Coude PVC 90° 100mm",
      description: "Coude d'évacuation",
      sku: "PLO-COU-001",
      barcode: "3000000000024",
      categoryId: categories["Plomberie"].id,
      brandId: brands["Generic"].id,
      unitType: "UNIT",
      unitLabel: "pièce",
      purchasePrice: 1500,
      sellingPrice: 2500,
      quantity: 100,
      minThreshold: 30,
      imageUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop",
    },
    {
      name: "Flexible inox 50cm",
      description: "Flexible de raccordement",
      sku: "PLO-FLE-001",
      barcode: "3000000000025",
      categoryId: categories["Plomberie"].id,
      brandId: brands["Generic"].id,
      unitType: "UNIT",
      unitLabel: "pièce",
      purchasePrice: 2500,
      sellingPrice: 4000,
      quantity: 50,
      minThreshold: 15,
      imageUrl: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=400&fit=crop",
    },
    {
      name: "Téflon 12mm x 12m",
      description: "Ruban d'étanchéité PTFE",
      sku: "PLO-TEF-001",
      barcode: "3000000000026",
      categoryId: categories["Plomberie"].id,
      brandId: brands["Generic"].id,
      unitType: "UNIT",
      unitLabel: "rouleau",
      purchasePrice: 500,
      sellingPrice: 1000,
      quantity: 200,
      minThreshold: 50,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    },
    {
      name: "Siphon lavabo",
      description: "Siphon plastique avec bouchon",
      sku: "PLO-SIP-001",
      barcode: "3000000000027",
      categoryId: categories["Plomberie"].id,
      brandId: brands["Generic"].id,
      unitType: "UNIT",
      unitLabel: "pièce",
      purchasePrice: 2000,
      sellingPrice: 3500,
      quantity: 35,
      minThreshold: 10,
      imageUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop",
    },

    // Électricité
    {
      name: "Câble électrique 2.5mm² (100m)",
      description: "Câble rigide H07VU bleu",
      sku: "ELE-CAB-001",
      barcode: "3000000000028",
      categoryId: categories["Électricité"].id,
      brandId: brands["Legrand"].id,
      unitType: "LENGTH",
      unitLabel: "rouleau",
      purchasePrice: 25000,
      sellingPrice: 38000,
      quantity: 20,
      minThreshold: 6,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    },
    {
      name: "Interrupteur simple",
      description: "Interrupteur encastrable blanc",
      sku: "ELE-INT-001",
      barcode: "3000000000029",
      categoryId: categories["Électricité"].id,
      brandId: brands["Legrand"].id,
      unitType: "UNIT",
      unitLabel: "pièce",
      purchasePrice: 1500,
      sellingPrice: 2500,
      quantity: 100,
      minThreshold: 30,
      imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop",
    },
    {
      name: "Prise de courant 2P+T",
      description: "Prise encastrable avec terre",
      sku: "ELE-PRI-001",
      barcode: "3000000000030",
      categoryId: categories["Électricité"].id,
      brandId: brands["Legrand"].id,
      unitType: "UNIT",
      unitLabel: "pièce",
      purchasePrice: 2000,
      sellingPrice: 3500,
      quantity: 80,
      minThreshold: 25,
      imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop",
    },
    {
      name: "Disjoncteur 16A",
      description: "Disjoncteur modulaire",
      sku: "ELE-DIS-001",
      barcode: "3000000000031",
      categoryId: categories["Électricité"].id,
      brandId: brands["Legrand"].id,
      unitType: "UNIT",
      unitLabel: "pièce",
      purchasePrice: 4500,
      sellingPrice: 7000,
      quantity: 40,
      minThreshold: 12,
      imageUrl: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400&h=400&fit=crop",
    },
    {
      name: "Tableau électrique 12 modules",
      description: "Coffret de distribution",
      sku: "ELE-TAB-001",
      barcode: "3000000000032",
      categoryId: categories["Électricité"].id,
      brandId: brands["Legrand"].id,
      unitType: "UNIT",
      unitLabel: "pièce",
      purchasePrice: 12000,
      sellingPrice: 18000,
      quantity: 15,
      minThreshold: 4,
      imageUrl: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400&h=400&fit=crop",
    },
    {
      name: "Gaine ICTA 20mm (100m)",
      description: "Gaine annelée pour câbles",
      sku: "ELE-GAI-001",
      barcode: "3000000000033",
      categoryId: categories["Électricité"].id,
      brandId: brands["Generic"].id,
      unitType: "LENGTH",
      unitLabel: "rouleau",
      purchasePrice: 8000,
      sellingPrice: 12500,
      quantity: 25,
      minThreshold: 8,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    },
    {
      name: "Ampoule LED E27 12W",
      description: "Ampoule économique blanc chaud",
      sku: "ELE-AMP-001",
      barcode: "3000000000034",
      categoryId: categories["Électricité"].id,
      brandId: brands["Generic"].id,
      unitType: "UNIT",
      unitLabel: "pièce",
      purchasePrice: 1500,
      sellingPrice: 2500,
      quantity: 150,
      minThreshold: 40,
      imageUrl: "https://images.unsplash.com/photo-1532007091569-ffe94c48c67f?w=400&h=400&fit=crop",
    },

    // Matériaux de construction
    {
      name: "Ciment Portland 50kg",
      description: "Ciment gris CEM II 32.5",
      sku: "MAT-CIM-001",
      barcode: "3000000000035",
      categoryId: categories["Matériaux de construction"].id,
      brandId: brands["Sika"].id,
      unitType: "UNIT",
      unitLabel: "sac",
      purchasePrice: 5500,
      sellingPrice: 7500,
      quantity: 200,
      minThreshold: 50,
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=400&fit=crop",
    },
    {
      name: "Fer à béton 10mm (12m)",
      description: "Barre d'armature HA",
      sku: "MAT-FER-001",
      barcode: "3000000000036",
      categoryId: categories["Matériaux de construction"].id,
      brandId: brands["Generic"].id,
      unitType: "LENGTH",
      imageUrl: "https://images.unsplash.com/photo-1590767950092-42b8362368da?w=400&h=400&fit=crop",
      unitLabel: "barre",
      purchasePrice: 4500,
      sellingPrice: 6500,
      quantity: 150,
      minThreshold: 40,
    },
    {
      name: "Fer à béton 8mm (12m)",
      description: "Barre d'armature HA",
      sku: "MAT-FER-002",
      barcode: "3000000000037",
      categoryId: categories["Matériaux de construction"].id,
      brandId: brands["Generic"].id,
      unitType: "LENGTH",
      unitLabel: "barre",
      purchasePrice: 3200,
      sellingPrice: 4800,
      quantity: 180,
      minThreshold: 50,
      imageUrl: "https://images.unsplash.com/photo-1590767950092-42b8362368da?w=400&h=400&fit=crop",
    },
    {
      name: "Sable fin (m³)",
      description: "Sable de construction lavé",
      sku: "MAT-SAB-001",
      barcode: "3000000000038",
      categoryId: categories["Matériaux de construction"].id,
      brandId: brands["Generic"].id,
      unitType: "BULK",
      unitLabel: "m³",
      purchasePrice: 15000,
      sellingPrice: 22000,
      quantity: 50,
      minThreshold: 15,
      imageUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
    },
    {
      name: "Gravier 15/25 (m³)",
      description: "Gravier concassé",
      sku: "MAT-GRA-001",
      barcode: "3000000000039",
      categoryId: categories["Matériaux de construction"].id,
      brandId: brands["Generic"].id,
      unitType: "BULK",
      unitLabel: "m³",
      purchasePrice: 18000,
      sellingPrice: 26000,
      quantity: 40,
      minThreshold: 12,
      imageUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
    },
    {
      name: "Parpaing creux 20x20x40",
      description: "Bloc béton creux",
      sku: "MAT-PAR-001",
      barcode: "3000000000040",
      categoryId: categories["Matériaux de construction"].id,
      brandId: brands["Generic"].id,
      unitType: "UNIT",
      unitLabel: "pièce",
      purchasePrice: 350,
      sellingPrice: 550,
      quantity: 500,
      minThreshold: 100,
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=400&fit=crop",
    },
    {
      name: "Brique pleine 22x10.5x5",
      description: "Brique de terre cuite",
      sku: "MAT-BRI-001",
      barcode: "3000000000041",
      categoryId: categories["Matériaux de construction"].id,
      brandId: brands["Generic"].id,
      unitType: "UNIT",
      unitLabel: "pièce",
      purchasePrice: 80,
      sellingPrice: 150,
      quantity: 1000,
      minThreshold: 200,
      imageUrl: "https://images.unsplash.com/photo-1590767950092-42b8362368da?w=400&h=400&fit=crop",
    },
    {
      name: "Fil de fer recuit (kg)",
      description: "Fil d'attache pour armatures",
      sku: "MAT-FIL-001",
      barcode: "3000000000042",
      categoryId: categories["Matériaux de construction"].id,
      brandId: brands["Generic"].id,
      unitType: "BULK",
      unitLabel: "kg",
      purchasePrice: 1200,
      sellingPrice: 2000,
      quantity: 100,
      minThreshold: 25,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    },
  ]

  console.log("📦 Creating products...")
  let createdCount = 0
  let updatedCount = 0
  for (const product of productsData) {
    // Chercher par SKU ou barcode
    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { sku: product.sku },
          { barcode: product.barcode },
        ]
      }
    })
    
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: product.name,
          description: product.description,
          quantity: product.quantity,
          purchasePrice: product.purchasePrice,
          sellingPrice: product.sellingPrice,
          minThreshold: product.minThreshold,
          unitType: product.unitType as any,
          unitLabel: product.unitLabel,
          imageUrl: (product as any).imageUrl || null,
        },
      })
      updatedCount++
    } else {
      await prisma.product.create({
        data: product as any,
      })
      createdCount++
    }
  }
  console.log(`✅ Products: ${createdCount} créés, ${updatedCount} mis à jour`)

  console.log("\n🎉 Seeding completed!")
  console.log("\n📊 Summary:")
  console.log(`   - ${categoriesData.length} categories`)
  console.log(`   - ${brandsData.length} brands`)
  console.log(`   - ${suppliersData.length} suppliers`)
  console.log(`   - ${clientsData.length} clients`)
  console.log(`   - ${productsData.length} products`)
  console.log(`   - 3 users (admin, stock manager, cashier)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
