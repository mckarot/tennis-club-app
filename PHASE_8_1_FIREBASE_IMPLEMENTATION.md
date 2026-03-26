# Phase 8.1 — Admin Dashboard Firebase Implementation

**Date:** 25 mars 2026  
**Status:** ✅ COMPLÉTÉ  
**Étape du PIPELINE.md:** Étape 2 — Firebase Database Expert

---

## Vue d'ensemble

Cette implémentation fournit l'infrastructure Firebase complète pour l'Admin Dashboard du Tennis Club du François, incluant:

- **5 indexes composites** pour les requêtes critiques
- **Security rules** pour l'accès admin (read/write all)
- **Seed script** pour peupler l'émulateur avec des données de test
- **Service layer** avec fonctions utilitaires typées

---

## 1. Firestore Indexes (`firestore.indexes.json`)

### Index ajoutés pour l'Admin Dashboard

| # | Collection | Champs | Justification | Query optimisée |
|---|------------|--------|---------------|-----------------|
| 1 | `reservations` | `start_time` + `status` + `type` | **CRITIQUE** — Stats today's bookings | `where('start_time', '>=', start).where('start_time', '<=', end).where('status', 'in', [...]).orderBy('type')` |
| 2 | `reservations` | `court_id` + `start_time` + `type` | **CRITIQUE** — Court utilization chart | `where('court_id', '==', id).where('start_time', '>=', start).orderBy('type')` |
| 3 | `users` | `role` + `name` | User directory filter by role | `where('role', '==', 'admin').orderBy('name')` |
| 4 | `users` | `status` + `email` | User directory filter by status | `where('status', '==', 'online').orderBy('email')` |
| 5 | `reservations` | `type` + `start_time` + `status` | Maintenance reservations tracking | `where('type', '==', 'maintenance').where('start_time', '>=', start).orderBy('status')` |

### Fichier complet

**Chemin:** `C:\Users\sapag\projet_flutter\tennis-club-app\firestore.indexes.json`

**Total indexes:** 21 (16 existants + 5 nouveaux)

---

## 2. Security Rules (`firestore.rules`)

### Règles mises à jour pour l'Admin Dashboard

#### Collection `reservations`
```javascript
match /reservations/{reservationId} {
  // ADMIN: read ALL reservations (supervision, stats)
  allow read: if isAdmin() || ...;
  
  // ADMIN: create any reservation (maintenance blocks)
  allow create: if isAdmin() || ...;
  
  // ADMIN: update ANY reservation
  allow update: if isAdmin() || ...;
  
  // ADMIN: delete ANY reservation
  allow delete: if isAdmin() || ...;
}
```

#### Collection `courts`
```javascript
match /courts/{courtId} {
  // ADMIN: read ANY court
  allow read: if isAuthenticated();
  
  // ADMIN: write ONLY (create, update, delete)
  allow create, update, delete: if isAdmin() && isValidCourtData();
}
```

#### Collection `users`
```javascript
match /users/{userId} {
  // ADMIN: read ANY user profile (user directory)
  allow read: if isAdmin() || isOwner(userId);
  
  // ADMIN: create ONLY
  allow create: if isAdmin() && isValidUserData();
  
  // ADMIN: update ANY user (including role changes)
  allow update: if isAdmin() && isValidUserData() || ...;
  
  // ADMIN: delete ONLY
  allow delete: if isAdmin();
}
```

### Fichier complet

**Chemin:** `C:\Users\sapag\projet_flutter\tennis-club-app\firestore.rules`

**Version:** `rules_version = '2'`

---

## 3. Seed Script (`src/scripts/seedData.ts`)

### Fonction `seedAdminDashboard()`

**Signature:**
```typescript
export async function seedAdminDashboard(options?: { force?: boolean }): Promise<ServiceResult<{
  users: number;
  reservations: number;
  maintenanceCourts: number;
}>>
```

### Données générées

| Type | Quantité | Détails |
|------|----------|---------|
| **Admin users** | 2 | `admin_001` (existant) + `admin_002` (nouveau) |
| **Moniteurs** | 3 | `moniteur_003`, `moniteur_004`, `moniteur_005` |
| **Clients** | 5 | `client_admin_001` à `client_admin_005` avec statuts variés |
| **Réservations** | 50+ | Pour aujourd'hui, réparties sur 12 heures (7:00-19:00) |
| **Courts en maintenance** | 3 | `court_04`, `court_05`, `court_06` |

### Utilisation

```typescript
import { seedAdminDashboard } from '@scripts/seedData';

// Seed normal
await seedAdminDashboard();

// Force re-seed
await seedAdminDashboard({ force: true });
```

### Credentials de test

```
Admin 1:
- Email: admin@tennis.mq
- Password: Admin123!

Admin 2:
- Email: sophie.admin@tennis.mq
- Password: Admin123!
```

---

## 4. Admin Service (`src/services/adminService.ts`)

### Fonctions utilitaires créées

#### Stats & Monitoring

| Fonction | Description | Index utilisé |
|----------|-------------|---------------|
| `getTodaysActiveBookings()` | Stats active bookings (total, confirmed, pending, maintenance) | `reservations:start_time+status+type` |
| `getMaintenanceCount()` | Count courts en maintenance | `courts:status+type` |
| `getCourtUtilizationData(date)` | Données pour chart d'utilisation | `reservations:court_id+start_time+type` |
| `getAdminDashboardStats()` | Stats complètes (combinaison des 3 précédentes) | Multiple |

#### Court Deployment Grid

| Fonction | Description | Index utilisé |
|----------|-------------|---------------|
| `getAllCourtsForDeployment(date)` | Courts avec réservations actuelles/suivantes | `courts:is_active+number` |

#### User Directory

| Fonction | Description | Index utilisé |
|----------|-------------|---------------|
| `searchUsers(query, filters)` | Recherche users avec filtres (role, status) | `users:role+name` ou `users:status+email` |

#### Temps réel

| Fonction | Description | Index utilisé |
|----------|-------------|---------------|
| `subscribeToTodaysReservations(callback)` | onSnapshot pour réservations du jour | `reservations:start_time+status+type` |
| `subscribeToCourtUtilization(date, callback)` | onSnapshot pour utilization chart | `reservations:court_id+start_time` |

#### Maintenance Operations

| Fonction | Description | Transaction |
|----------|-------------|-------------|
| `blockCourtForMaintenance(input)` | Bloquer un court (création réservation + update court) | ✅ Oui |
| `unblockCourt(courtId)` | Débloquer un court | ❌ Non (simple update) |

### Exemple d'utilisation

```typescript
import {
  getTodaysActiveBookings,
  getCourtUtilizationData,
  subscribeToTodaysReservations,
  blockCourtForMaintenance,
} from '@services/adminService';

// Get stats
const statsResult = await getTodaysActiveBookings();
if (statsResult.success) {
  console.log('Today\'s bookings:', statsResult.data);
}

// Get utilization data for chart
const utilizationResult = await getCourtUtilizationData(new Date());
if (utilizationResult.success) {
  console.log('Court utilization:', utilizationResult.data);
}

// Real-time subscription
const unsubscribe = subscribeToTodaysReservations((reservations) => {
  console.log('Today\'s reservations updated:', reservations.length);
});

// Block court for maintenance
const blockResult = await blockCourtForMaintenance({
  courtId: 'court_04',
  startTime: new Date('2026-03-25T06:00:00-04:00'),
  endTime: new Date('2026-03-25T12:00:00-04:00'),
  title: 'Court 4 - Surface Maintenance',
  description: 'Regular surface maintenance and cleaning',
});
```

---

## 5. Checklist de validation

### ✅ Security rules
- [x] Admin peut TOUT lire sur `reservations`
- [x] Admin peut TOUT lire sur `courts`
- [x] Admin peut TOUT lire sur `users`
- [x] Admin peut créer/mettre à jour/supprimer sur toutes les collections
- [x] Validation des données avec `isValidReservation()`, `isValidCourtData()`, `isValidUserData()`

### ✅ Index composites
- [x] `reservations:start_time+status+type` — today's bookings stats
- [x] `reservations:court_id+start_time+type` — utilization chart
- [x] `users:role+name` — user directory by role
- [x] `users:status+email` — user directory by status
- [x] `reservations:type+start_time+status` — maintenance tracking

### ✅ Seed script
- [x] Fonction `seedAdminDashboard()` exportée
- [x] 10 users variés (2 admin, 3 moniteurs, 5 clients)
- [x] 50+ réservations pour aujourd'hui
- [x] 3 courts en maintenance
- [x] Utilisation de `writeBatch` pour opérations atomiques
- [x] Gestion des erreurs avec `ServiceResult`

### ✅ Admin service
- [x] `getTodaysActiveBookings()` — stats
- [x] `getMaintenanceCount()` — courts en maintenance
- [x] `getCourtUtilizationData(date)` — données pour chart
- [x] `getAllCourtsForDeployment(date)` — courts pour deployment grid
- [x] `searchUsers(query, filters)` — recherche users
- [x] `subscribeToTodaysReservations(callback)` — temps réel
- [x] `blockCourtForMaintenance(input)` — transaction atomique
- [x] `unblockCourt(courtId)` — déblocage court
- [x] `getAdminDashboardStats()` — stats complètes
- [x] Gestion d'erreurs avec `ServiceResult`
- [x] Timezone: `America/Martinique`

---

## 6. Justification des indexes

### Index 1: `reservations:start_time+status+type`

**Query:**
```typescript
const q = query(
  collection(db, 'reservations'),
  where('start_time', '>=', startOfDay),
  where('start_time', '<=', endOfDay),
  where('status', 'in', ['confirmed', 'pending', 'pending_payment']),
  orderBy('start_time', 'asc')
);
```

**Usage:** `getTodaysActiveBookings()` — Compte les réservations actives pour aujourd'hui

**Pourquoi composite:** Firestore nécessite un index composite pour combiner 2 `where()` + 1 `orderBy()`

---

### Index 2: `reservations:court_id+start_time+type`

**Query:**
```typescript
const q = query(
  collection(db, 'reservations'),
  where('court_id', '==', courtId),
  where('start_time', '>=', startOfDay),
  where('start_time', '<=', endOfDay),
  orderBy('start_time', 'asc')
);
```

**Usage:** `getCourtUtilizationData(date)` — Récupère les réservations par court pour le chart

**Pourquoi composite:** Combinaison de `where(court_id)` + `where(start_time)` + `orderBy`

---

### Index 3: `users:role+name`

**Query:**
```typescript
const q = query(
  collection(db, 'users'),
  where('role', '==', 'admin'),
  orderBy('name', 'asc')
);
```

**Usage:** `searchUsers(undefined, { role: 'admin' })` — Filtre les users par rôle, triés par nom

**Pourquoi composite:** Combinaison de `where(role)` + `orderBy(name)`

---

### Index 4: `users:status+email`

**Query:**
```typescript
const q = query(
  collection(db, 'users'),
  where('status', '==', 'online'),
  orderBy('email', 'asc')
);
```

**Usage:** `searchUsers(undefined, { status: 'online' })` — Filtre les users par statut, triés par email

**Pourquoi composite:** Combinaison de `where(status)` + `orderBy(email)`

---

### Index 5: `reservations:type+start_time+status`

**Query:**
```typescript
const q = query(
  collection(db, 'reservations'),
  where('type', '==', 'maintenance'),
  where('start_time', '>=', startOfDay),
  orderBy('start_time', 'asc')
);
```

**Usage:** Suivi des réservations de maintenance pour le dashboard admin

**Pourquoi composite:** Combinaison de `where(type)` + `where(start_time)` + `orderBy`

---

## 7. Prochaines étapes (Étape 3 — qwen-react-developer)

Après validation de cette étape 2, le developer implémentera:

1. **Page Admin Dashboard** (`src/pages/admin/AdminDashboard.tsx`)
2. **Composants:**
   - `StatsCard` (4 cartes: total bookings, confirmed, pending, maintenance)
   - `CourtUtilizationChart` (graphique d'utilisation par court)
   - `AdminCourtGrid` (grille de déploiement avec réservations en temps réel)
   - `UserDirectory` (tableau des users avec recherche et filtres)
3. **Hooks:**
   - `useAdminDashboardStats()`
   - `useCourtUtilization(date)`
   - `useUserDirectory(filters)`
4. **Temps réel:**
   - `onSnapshot` pour les réservations du jour
   - `onSnapshot` pour l'utilisation des courts

---

## 8. Fichiers modifiés/créés

| Fichier | Action | Description |
|---------|--------|-------------|
| `firestore.indexes.json` | ✏️ Modifié | +5 indexes composites |
| `firestore.rules` | ✏️ Modifié | Rules admin read/write all |
| `src/scripts/seedData.ts` | ✏️ Modifié | +fonction `seedAdminDashboard()` |
| `src/services/adminService.ts` | ✅ Créé | Service layer complet |
| `src/services/index.ts` | ✏️ Modifié | Export des fonctions adminService |

---

## 9. Commandes de test

```bash
# 1. Démarrer les émulateurs
npx firebase emulators:start

# 2. Démarrer le dev server
npm run dev

# 3. Seeder les données Admin Dashboard
# Dans la console du navigateur:
import { seedAdminDashboard } from './src/scripts/seedData';
await seedAdminDashboard();

# 4. View data
# http://localhost:4000/firestore
```

---

## 10. Critères d'acceptation

- [x] Security rules validées (admin read/write all)
- [x] Index justifiés par des queries réelles
- [x] Seed script fonctionnel pour l'émulateur
- [x] Queries utilitaires avec gestion d'erreurs
- [x] Transactions Firestore pour opérations atomiques (block court)
- [x] `onSnapshot` avec `unsubscribe()` pour temps réel
- [x] Gestion du timezone (America/Martinique)
- [x] TypeScript strict (zéro `any`)
- [x] ServiceResult pattern pour erreurs typées

---

**Condition de passage à l'Étape 3:** ✅ REMPLIE

Le code est prêt pour l'implémentation React par `qwen-react-developer`.
