# Configuration MongoDB

## Installation de MongoDB

### Option 1: MongoDB Community Edition (Local)

1. **Windows:**
   - Téléchargez depuis [mongodb.com/download](https://www.mongodb.com/try/download/community)
   - Installez avec l'installateur
   - MongoDB démarre automatiquement comme service Windows

2. **macOS:**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   ```

3. **Linux (Ubuntu/Debian):**
   ```bash
   sudo apt-get install -y mongodb
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```

### Option 2: MongoDB Atlas (Cloud - Recommandé)

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit (M0)
3. Configurez l'accès réseau (ajoutez 0.0.0.0/0 pour le développement)
4. Créez un utilisateur de base de données
5. Obtenez votre chaîne de connexion

## Configuration de la connexion

### MongoDB Local

Dans votre `.env.local`:
```env
DATABASE_URL="mongodb://localhost:27017/batim?retryWrites=true&w=majority"
```

### MongoDB Atlas

Dans votre `.env.local`:
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/batim?retryWrites=true&w=majority"
```

Remplacez:
- `username`: Votre nom d'utilisateur MongoDB
- `password`: Votre mot de passe MongoDB
- `cluster`: L'URL de votre cluster

## Vérification

Pour vérifier que MongoDB fonctionne:

```bash
# Vérifier que MongoDB est en cours d'exécution
mongosh

# Ou avec l'ancien client
mongo
```

Dans le shell MongoDB:
```javascript
use batim
db.users.find()
```

## Commandes utiles

```bash
# Démarrer MongoDB (si installé localement)
# Windows: Le service démarre automatiquement
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongodb

# Arrêter MongoDB
# macOS: brew services stop mongodb-community
# Linux: sudo systemctl stop mongodb

# Vérifier le statut
# macOS: brew services list
# Linux: sudo systemctl status mongodb
```

## Prisma avec MongoDB

Prisma supporte MongoDB depuis la version 3.12+. Les principales différences:

1. **IDs**: Utilise `@db.ObjectId` au lieu de `@default(cuid())`
2. **Relations**: Supportées mais sans contraintes de clé étrangère
3. **Transactions**: Supportées dans MongoDB 4.0+
4. **Recherche**: Utilise `contains` sans `mode: "insensitive"` (MongoDB est case-insensitive par défaut)

## Dépannage

### Erreur de connexion

1. Vérifiez que MongoDB est en cours d'exécution
2. Vérifiez votre `DATABASE_URL`
3. Pour Atlas, vérifiez que votre IP est autorisée

### Erreur "Database does not exist"

C'est normal ! Prisma créera automatiquement la base de données lors du premier `db:push`.

### Erreur de permissions

Assurez-vous que l'utilisateur MongoDB a les permissions nécessaires (readWrite au minimum).




