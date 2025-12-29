# Module de Gestion des Crédits Clients

## Fonctionnalités Implémentées

### 1. Règles Métier (Business Rules)

#### Blocage Automatique
- **Règle**: Un client est automatiquement bloqué s'il a une facture impayée depuis plus de X jours (par défaut 90 jours)
- **Implémentation**: 
  - Vérification automatique lors de chaque tentative de vente à crédit
  - Mise à jour automatique du statut du client
  - Configuration personnalisable par client (`autoBlockDays`)

#### Validation Admin
- **Règle**: Toute vente à crédit dépassant 500 000 FCFA nécessite une validation admin
- **Implémentation**:
  - Vente créée en attente d'approbation
  - Stock non déduit tant que non approuvée
  - Solde client non mis à jour tant que non approuvée
  - Page dédiée pour les approbations (`/sales/pending`)

### 2. KPIs (Indicateurs de Performance)

#### DSO (Days Sales Outstanding)
- **Définition**: Délai moyen de recouvrement des créances clients
- **Calcul**: Moyenne des jours entre la vente et le dernier paiement
- **Affichage**: Tableau de bord principal

#### Taux d'Impayés
- **Définition**: Pourcentage des créances irrécouvrables (factures > 180 jours)
- **Objectif**: Maintenir en dessous de 2% du CA
- **Affichage**: Tableau de bord avec alerte si > 2%

### 3. Fonctionnalités Détaillées

#### Fiche Client (CRM)
- ✅ Profil complet (nom, téléphone, email, adresse, photo)
- ✅ Limite de crédit configurable
- ✅ Statut (Actif, Bloqué, Contentieux)
- ✅ Suivi du solde actuel en temps réel
- ✅ Indicateur visuel d'utilisation du crédit

#### Processus de Vente à Crédit
- ✅ Paiement partiel (apport initial)
- ✅ Échéancier (date limite de remboursement)
- ✅ Sélection de client existant ou création rapide
- ✅ Vérification automatique de la limite de crédit
- ✅ Blocage des clients avec retards

#### Suivi et Recouvrement
- ✅ Tableau de bord des impayés
- ✅ Tri par montant dû ou jours de retard
- ✅ Filtres par période (30, 60, 90 jours)
- ✅ Historique complet des versements par client
- ✅ Enregistrement de paiements avec reçus

### 4. Pages et Interfaces

#### `/clients`
- Liste des clients avec statut et solde
- CRUD complet des clients
- Accès rapide à l'historique et aux versements

#### `/clients/[id]/payments`
- Historique détaillé des versements
- Liste des ventes impayées du client
- Enregistrement de nouveaux paiements

#### `/unpaid`
- Tableau de bord des impayés
- Statistiques (total, nombre, retards)
- Tri et filtres avancés
- Enregistrement de paiements

#### `/sales/pending` (Admin uniquement)
- Liste des ventes en attente d'approbation
- Détails complets de chaque vente
- Actions d'approbation/rejet

### 5. Configuration

#### Seuils Configurables
- **Seuil validation admin**: 500 000 FCFA (défini dans `lib/business-rules.ts`)
- **Jours avant blocage auto**: 90 jours par défaut (configurable par client)
- **Créances irrécouvrables**: 180 jours

### 6. Sécurité

- Validation admin requise pour les gros montants
- Blocage automatique des clients à risque
- Vérification des limites de crédit en temps réel
- Historique complet et traçable

## Utilisation

### Créer un Client
1. Aller dans `/clients`
2. Cliquer sur "Nouveau client"
3. Remplir les informations (limite de crédit, etc.)

### Vente à Crédit
1. Dans le POS, sélectionner "Crédit" comme méthode de paiement
2. Rechercher ou créer le client
3. Optionnel: définir un paiement partiel
4. Optionnel: définir une date d'échéance
5. Finaliser la vente

### Enregistrer un Paiement
1. Aller dans `/unpaid` ou `/clients/[id]/payments`
2. Cliquer sur "Enregistrer Paiement"
3. Saisir le montant et la méthode
4. Le solde du client est automatiquement mis à jour

### Approuver une Vente (Admin)
1. Aller dans `/sales/pending`
2. Examiner les détails de la vente
3. Cliquer sur "Approuver"
4. Le stock et le solde client sont mis à jour

## Prochaines Améliorations

- [ ] Génération automatique de reçus PDF
- [ ] Notifications email/SMS pour les échéances
- [ ] Rappels automatiques pour les retards
- [ ] Export de rapports de recouvrement
- [ ] Graphiques d'évolution du DSO
- [ ] Prévisions de trésorerie basées sur les échéances




