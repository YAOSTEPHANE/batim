# Guide d'Installation

## Prérequis

- Node.js 18+ et npm
- MongoDB (local ou Atlas) - Voir [MONGODB_SETUP.md](MONGODB_SETUP.md) pour l'installation
- Git (optionnel)

## Installation

1. **Installer les dépendances**

```bash
npm install
```

2. **Installer et configurer MongoDB**

Assurez-vous que MongoDB est installé et en cours d'exécution sur votre machine, ou utilisez MongoDB Atlas (cloud).

**Option 1: MongoDB Local**
- Installez MongoDB depuis [mongodb.com](https://www.mongodb.com/try/download/community)
- Démarrez le service MongoDB
- Utilisez la connexion : `mongodb://localhost:27017/batim`

**Option 2: MongoDB Atlas (Recommandé pour production)**
- Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Créez un cluster gratuit
- Obtenez votre chaîne de connexion

3. **Configurer les variables d'environnement**

Créez un fichier `.env.local` à la racine du projet :

```env
# Pour MongoDB local
DATABASE_URL="mongodb://localhost:27017/batim?retryWrites=true&w=majority"

# Ou pour MongoDB Atlas
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/batim?retryWrites=true&w=majority"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-cle-secrete-aleatoire-ici"
```

Pour générer une clé secrète, vous pouvez utiliser :
```bash
openssl rand -base64 32
```

4. **Initialiser la base de données**

```bash
# Générer le client Prisma
npm run db:generate

# Créer la base de données et les collections
npm run db:push

# Remplir avec des données de test
npm run db:seed
```

5. **Lancer l'application**

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Comptes par défaut

Après avoir exécuté le seed, vous pouvez vous connecter avec :

- **Administrateur**
  - Email: `admin@quincaillerie.com`
  - Mot de passe: `admin123`

- **Gestionnaire de Stock**
  - Email: `stock@quincaillerie.com`
  - Mot de passe: `stock123`

- **Caissier**
  - Email: `cashier@quincaillerie.com`
  - Mot de passe: `cashier123`

⚠️ **Important**: Changez ces mots de passe en production !

## Structure du Projet

```
batim/
├── app/                    # Pages Next.js (App Router)
│   ├── api/               # Routes API
│   ├── dashboard/         # Tableau de bord
│   ├── products/          # Gestion des produits
│   ├── pos/               # Point de vente
│   ├── suppliers/         # Fournisseurs
│   └── ...
├── components/            # Composants React
│   ├── ui/               # Composants UI de base
│   ├── layout/           # Layout et navigation
│   └── ...
├── lib/                   # Utilitaires et configuration
├── prisma/               # Schéma de base de données
└── types/                # Définitions TypeScript
```

## Commandes Disponibles

- `npm run dev` - Lancer le serveur de développement
- `npm run build` - Construire pour la production
- `npm run start` - Lancer le serveur de production
- `npm run db:generate` - Générer le client Prisma
- `npm run db:push` - Pousser le schéma vers la DB
- `npm run db:migrate` - Créer une migration
- `npm run db:studio` - Ouvrir Prisma Studio
- `npm run db:seed` - Remplir la DB avec des données de test

## Déploiement

### Vercel (Recommandé)

1. Poussez votre code sur GitHub
2. Importez le projet sur Vercel
3. Configurez les variables d'environnement
4. Pour la base de données, utilisez PostgreSQL avec Prisma

### Autres plateformes

L'application peut être déployée sur n'importe quelle plateforme supportant Next.js. Assurez-vous de :

1. Configurer les variables d'environnement
2. Utiliser une base de données PostgreSQL en production (modifiez `schema.prisma`)
3. Exécuter les migrations : `npm run db:migrate`

## Support

Pour toute question ou problème, consultez la documentation ou créez une issue.

