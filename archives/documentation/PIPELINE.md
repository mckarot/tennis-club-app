# Tennis Club du François — Pipeline de développement IA
> Version 2.0 — Orchestration des agents Qwen pour Firebase Emulator Suite

Ce fichier définit l'ordre d'exécution des agents Qwen pour chaque user story. **Respecter cette séquence sans exception.** Un agent ne doit jamais démarrer sans que le précédent ait terminé et validé son livrable.

---

## Vue d'ensemble

```
US-XXX (user story)
  │
  ▼
[0] prd-audit                → Lire les PRD HTML Stitch AVANT tout code
  │
  ▼
[1] qwen-react-architect     → Plan complet avant tout code
  │
  ▼
[2] qwen-firebase-database-expert → Schéma Firestore avant tout composant
  │
  ▼
[3] qwen-react-developer     → Implémentation selon le plan ET les PRD
  │
  ▼
[4] qwen-react-ts-firebase-reviewer → Audit code + conformité PRD
  │
  ▼
[5] qwen-ui-animator         → Animations 
```

---

## Agents Qwen disponibles

| Agent | Rôle | Quand l'utiliser |
|-------|------|------------------|
| `qwen-react-architect` | Architecture et plan | Étape 1 - Toujours en premier |
| `qwen-firebase-database-expert` | Schéma Firestore, indexes, security rules | Étape 2 - Après l'architecte |
| `qwen-react-developer` | Implémentation React + TypeScript + Firebase | Étape 3 - Après le database expert |
| `qwen-react-ts-firebase-reviewer` | Audit code, TypeScript strict, Firebase patterns | Étape 4 - Après le developer |
| `qwen-ui-animator` | Animations Framer Motion | Étape 5 - Optionnel, si demandé |
| `qwen-design-system-reviewer` | Vérification design system | En parallèle de l'étape 4 |

---

## Étape 0 — Audit PNG *(OBLIGATOIRE — jamais sauter)*

**Quand :** Avant toute autre étape, dès qu'une nouvelle US est lancée.

**Règle absolue :** L'IA ne doit jamais écrire une seule ligne de code avant d'avoir lu et analysé les PNG du prototype Stitch correspondant à la US en cours.

**Prompt type à donner à l'agent :**
```
Avant de commencer US-XXX, lis les PNG de référence suivants et fais un audit visuel :
[liste des PNG ci-dessous]

Pour chaque PNG, liste :
1. Les éléments UI critiques visibles (couleurs, typographie, layout, composants)
2. Les écarts potentiels avec ce qui pourrait être codé sans référence
3. Les détails non-documentés dans DESIGN_SYSTEM.md

Ne commence le pipeline qu'après avoir produit cet audit.
```

**Correspondance US → PNG de référence :**

| US | PNG à lire obligatoirement | Chemin absolu |
|---|---|---|
| US-001 (Setup) | N/A (infrastructure) | - |
| US-002 (Landing Page) | `bienvenue_au_tennis_club_du_fran_ois/screen.png` | `/Users/mathieu/StudioProjects/web_tennis/stitch_prd_tennis_club_du_fran_ois/bienvenue_au_tennis_club_du_fran_ois/screen.png` |
| US-010 à US-014 (Client Dashboard) | `dashboard_client_r_servation/screen.png` + `dashboard_client_dynamique_r_servations_temps_r_el/screen.png` | `/Users/mathieu/StudioProjects/web_tennis/stitch_prd_tennis_club_du_fran_ois/dashboard_client_r_servation/screen.png`<br>`/Users/mathieu/StudioProjects/web_tennis/stitch_prd_tennis_club_du_fran_ois/dashboard_client_dynamique_r_servations_temps_r_el/screen.png` |
| US-020 à US-024 (Admin Dashboard) | `dashboard_admin_supervision_gestion/screen.png` + `dashboard_admin_dynamique_supervision_temps_r_el/screen.png` | `/Users/mathieu/StudioProjects/web_tennis/stitch_prd_tennis_club_du_fran_ois/dashboard_admin_supervision_gestion/screen.png`<br>`/Users/mathieu/StudioProjects/web_tennis/stitch_prd_tennis_club_du_fran_ois/dashboard_admin_dynamique_supervision_temps_r_el/screen.png` |
| US-030 à US-032 (Moniteur) | `dashboard_moniteur_agenda_cours/screen.png` + `dashboard_moniteur_dynamique_gestion_d_agenda/screen.png` | `/Users/mathieu/StudioProjects/web_tennis/stitch_prd_tennis_club_du_fran_ois/dashboard_moniteur_agenda_cours/screen.png`<br>`/Users/mathieu/StudioProjects/web_tennis/stitch_prd_tennis_club_du_fran_ois/dashboard_moniteur_dynamique_gestion_d_agenda/screen.png` |

**Format de l'audit PNG attendu :**
```markdown
## Audit PNG — US-XXX

### PNG analysés
- [nom du fichier] ✓

### Éléments critiques identifiés
1. [élément] — [valeur exacte observée dans le PNG]
2. ...

### Détails non couverts par DESIGN_SYSTEM.md
1. [détail] — à implémenter exactement comme dans le PNG
2. ...

### Écarts à surveiller pendant le développement
1. [risque] — [comment l'éviter]
```

**Condition de passage à l'étape 1 :** L'audit PNG est produit avec au moins 5 éléments critiques identifiés par PNG lu.

> **Leçon apprise :** Sans cette étape, le developer pourrait coder un bouton avec les mauvaises couleurs, une police incorrecte, ou un layout différent — tous des détails visibles immédiatement dans les PNG Stitch mais absents des docs texte. L'audit PNG est la seule source de vérité pour les détails visuels fins.

---

## Étape 1 — `qwen-react-architect`

**Quand :** Au début de chaque user story, avant d'écrire une seule ligne de code.

**Prompt type à donner à l'agent :**
```
Lis les fichiers de documentation/ (README.md, 01_PROJECT_SETUP.md, 02_DATA_MODEL.md, etc.)
et les PNG de l'étape 0 (Audit PNG).

Puis conçois l'architecture complète pour la user story [US-XXX] : [titre].

Fichiers PNG de référence :
- /Users/mathieu/StudioProjects/web_tennis/stitch_prd_tennis_club_du_fran_ois/[dossier]/screen.png
```

**Livrables attendus (les 7 sections obligatoires) :**
- [ ] Structure de dossiers avec rôle de chaque fichier
- [ ] Interfaces TypeScript (entités, inputs, unions discriminées)
- [ ] Schéma Firestore avec justification de chaque index
- [ ] Plan de routing avec loaders React Router v6.4+
- [ ] Error Boundaries (Firebase errors, Network errors)
- [ ] Plan des composants avec props typées
- [ ] Signatures complètes des hooks

**Règle :** L'architecte ne produit **aucun code d'implémentation**. Uniquement des plans et interfaces.

**Condition de passage à l'étape 2 :** Les 7 sections sont présentes et cohérentes avec la documentation.

---

## Étape 2 — `qwen-firebase-database-expert`

**Quand :** Après validation du plan de l'architecte, avant toute implémentation React.

**Prompt type :**
```
Sur la base du plan de l'architecte pour US-XXX, écris les fichiers Firebase :
- firestore.rules (security rules)
- firestore.indexes.json (composite indexes)
- src/scripts/seedData.ts (données de test)

Justifie chaque index par la query Firestore qu'il optimise.
```

**Livrables attendus :**
- [ ] Fichier `firestore.rules` avec security rules par collection
- [ ] Fichier `firestore.indexes.json` avec indexes composites
- [ ] Script de seed pour l'émulateur
- [ ] Justification de chaque index (quelle query il optimise)
- [ ] Fonctions utilitaires de queries communes

**Points de vigilance automatiques de l'agent :**
- Security rules basées sur les rôles (admin, moniteur, client)
- Index composites pour les queries avec `where` + `orderBy`
- Transactions Firestore pour les opérations atomiques (réservations)
- `onSnapshot` pour le temps réel
- Gestion des timezone (America/Martinique)

**Condition de passage à l'étape 3 :** La checklist interne de l'agent est cochée. Security rules validées. Index justifiés.

---

## Étape 3 — `qwen-react-developer`

**Quand :** Après validation du schéma Firestore par l'expert DB.

**Prompt type :**
```
Implémente la user story US-XXX en suivant exactement :
- L'audit PNG de l'étape 0 (référence visuelle absolue)
- Le plan de l'architecte (étape 1)
- Le schéma Firestore validé (étape 2)
- Le design system dans documentation/07_DESIGN_SYSTEM.md

Fichiers PNG de référence :
- /Users/mathieu/StudioProjects/web_tennis/stitch_prd_tennis_club_du_fran_ois/[dossier]/screen.png

En cas de conflit entre les docs texte et le PNG, le PNG a toujours raison.
```

**Livrables attendus :**
- [ ] Fichiers créés au format `// chemin/complet/fichier.tsx` en en-tête
- [ ] Diffs pour les fichiers existants modifiés
- [ ] Composants < 100 lignes (sinon décomposer)
- [ ] `try/catch` sur toutes les opérations Firestore
- [ ] Attributs ARIA sur tous les éléments interactifs
- [ ] `onSnapshot` pour toutes les lectures temps réel
- [ ] Loaders React Router pour les données initiales

**Interdictions absolues pour cet agent :**
- Zéro `any` TypeScript
- Zéro `style={{}}` ou fichier `.css` custom (Tailwind uniquement)
- Zéro `useEffect` pour charger des données Firestore (utiliser hooks personnalisés)
- Zéro invention de structure non définie par l'architecte

**Condition de passage à l'étape 4 :** Tous les fichiers listés dans le plan de l'architecte sont produits.

---

## Étape 4 — `qwen-react-ts-firebase-reviewer`

**Quand :** Immédiatement après la livraison du developer. **Jamais sauter cette étape.**

**Prompt type :**
```
Audite le code produit pour US-XXX. Vérifie :
- TypeScript strict (no any, no implicit any)
- Patterns Firebase (transactions, onSnapshot, error handling)
- Accessibilité WCAG 2.1 AA
- Conformité visuelle et fonctionnelle aux PNG de l'étape 0

Fichiers PNG de référence :
- /Users/mathieu/StudioProjects/web_tennis/stitch_prd_tennis_club_du_fran_ois/[dossier]/screen.png

Produis le rapport JSON structuré avec une section "design_conformity".
```

**L'agent produit un rapport JSON avec :**
```json
{
  "status": "PASS" | "FAIL",
  "critical": [],
  "major": [],
  "minor": [],
  "design_conformity": {
    "score": 95,
    "png_reference": "dashboard_client_r_servation/screen.png",
    "ecarts": []
  }
}
```

**Retour en étape 3 si :**
- `critical` non vide (any TypeScript, onSnapshot sans unsubscribe, try/catch manquant sur mutation Firestore)
- `major` non vide (accessibilité manquante sur CTA, security rules non appliquées)

**Passage à l'étape 5 si :**
- `status: "PASS"` — aucun critical ni major

---

## Étape 5 — `test-automation-specialist`

**Quand :** Après `PASS` du reviewer.

**Prompt type :**
```
Écris les tests pour US-XXX. Stack : Vitest + React Testing Library + Firebase Emulator + Playwright.
Coverage minimum 80% sur lines, functions, branches, statements.
```

**Livrables attendus :**
- [ ] `src/test/setup.ts` si inexistant (avec Firebase Emulator setup)
- [ ] Tests unitaires pour chaque hook et fonction utilitaire
- [ ] Tests de composant pour chaque composant UI (rendu, interactions, accessibilité)
- [ ] Au moins 1 test d'intégration couvrant le flux complet de la US
- [ ] Tests E2E Playwright avec seed via `page.evaluate()` avant navigation

**Configuration obligatoire :**
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
// Firebase Emulator setup dans les tests d'intégration
```

**Condition de clôture de la US :** `npm run test` passe avec coverage ≥ 80%.

---

## Étape 6 — `qwen-ui-animator` *(optionnel)*

**Quand :** Uniquement si la user story contient explicitement une mention d'animation, de transition, ou de micro-interaction. **Ne pas déclencher par défaut.**

**US qui déclenchent cet agent :**
- US mentionnant "toast", "modal", "animation", "transition", "feedback visuel", "micro-interaction"
- US de polissage dédiées

**Prompt type :**
```
Le code de US-XXX est validé. Ajoute les animations appropriées.
Tailwind pour les états hover/focus. Framer Motion pour les entrées/sorties du DOM.
Produis uniquement des diffs.
```

**Règles strictes de l'agent :**
- Diffs uniquement — jamais de fichier complet sur un fichier existant
- Zéro modification de logique métier, hooks, appels Firestore, types
- `useReducedMotion()` obligatoire sur toute animation Framer Motion
- Uniquement `transform` et `opacity` animés (pas `width`, `height`, `top`, `left`)

---

## Corrections inter-agents

### Quand le reviewer renvoie en étape 3

```
[4] qwen-react-ts-firebase-reviewer → FAIL
  │
  │  rapport JSON avec critical/major
  ▼
[3] qwen-react-developer (itération)
  │
  ▼
[4] qwen-react-ts-firebase-reviewer → re-audit
```

L'itération 3→4 peut se répéter jusqu'à `PASS`. Maximum recommandé : 3 itérations. Si toujours FAIL après 3 itérations, impliquer l'architecte pour revoir le plan.

### Quand les tests échouent

```
[5] test-automation-specialist → tests en échec
  │
  ▼
[3] qwen-react-developer → correction du bug
  │
  ▼
[4] qwen-react-ts-firebase-reviewer → re-audit rapide
  │
  ▼
[5] test-automation-specialist → re-run tests
```

---

## 7.1 Client Dashboard — Pipeline détaillé (Phase 7, Day 25)

**User Story :** US-010 — Client Dashboard  
**Référence TODO_LIST :** Phase 7.1, ligne 430  
**PNG de référence :**
- `/Users/mathieu/StudioProjects/web_tennis/stitch_prd_tennis_club_du_fran_ois/dashboard_client_r_servation/screen.png`
- `/Users/mathieu/StudioProjects/web_tennis/stitch_prd_tennis_club_du_fran_ois/dashboard_client_dynamique_r_servations_temps_r_el/screen.png`

---

### Étape 0 — Audit PNG (OBLIGATOIRE)

**Agent :** `general-purpose` ou `Explore`  
**Prompt :**
```
Avant de commencer US-010 (Client Dashboard), lis les PNG de référence suivants et fais un audit visuel :
- /Users/mathieu/StudioProjects/web_tennis/stitch_prd_tennis_club_du_fran_ois/dashboard_client_r_servation/screen.png
- /Users/mathieu/StudioProjects/web_tennis/stitch_prd_tennis_club_du_fran_ois/dashboard_client_dynamique_r_servations_temps_r_el/screen.png

Pour chaque PNG, liste :
1. Les éléments UI critiques visibles (couleurs, typographie, layout, composants)
2. Les écarts potentiels avec ce qui pourrait être codé sans référence
3. Les détails non-documentés dans DESIGN_SYSTEM.md

Ne commence le pipeline qu'après avoir produit cet audit.
```

**Livrable attendu :** Audit PNG avec ≥10 éléments critiques identifiés (5 par PNG).

---

### Étape 1 — Architecture

**Agent :** `qwen-react-architect`  
**Prompt :**
```
Lis les fichiers de documentation/ (README.md, 01_PROJECT_SETUP.md, 02_DATA_MODEL.md, etc.)
et les PNG de l'étape 0 (Audit PNG).

Puis conçois l'architecture complète pour la user story US-010 : Client Dashboard.

Fichiers PNG de référence :
- /Users/mathieu/StudioProjects/web_tennis/stitch_prd_tennis_club_du_fran_ois/dashboard_client_r_servation/screen.png
- /Users/mathieu/StudioProjects/web_tennis/stitch_prd_tennis_club_du_fran_ois/dashboard_client_dynamique_r_servations_temps_r_el/screen.png

Tâches à couvrir (Phase 7.1 du TODO_LIST) :
- [ ] Create src/pages/client/ClientDashboard.tsx
- [ ] Implement stats cards
- [ ] Implement upcoming reservations
- [ ] Implement quick booking

Produis les 7 sections obligatoires :
1. Structure de dossiers avec rôle de chaque fichier
2. Interfaces TypeScript (entités, inputs, unions discriminées)
3. Schéma Firestore avec justification de chaque index
4. Plan de routing avec loaders React Router v6.4+
5. Error Boundaries (Firebase errors, Network errors)
6. Plan des composants avec props typées
7. Signatures complètes des hooks
```

**Livrables attendus :**
- [ ] `src/pages/client/ClientDashboard.tsx` (planifié)
- [ ] `src/components/dashboard/StatsCard/StatsCard.tsx` (si pas déjà créé en Phase 3.6)
- [ ] `src/components/dashboard/UpcomingReservations/UpcomingReservations.tsx`
- [ ] `src/components/dashboard/QuickBooking/QuickBooking.tsx`
- [ ] Hooks : `useDashboardStats`, `useUpcomingReservations`
- [ ] Types : `DashboardStats`, `UpcomingReservation`

**Condition de passage :** Les 7 sections sont présentes et cohérentes.

---

### Étape 2 — Firebase Schema

**Agent :** `qwen-firebase-database-expert`  
**Prompt :**
```
Sur la base du plan de l'architecte pour US-010 (Client Dashboard), écris/mets à jour les fichiers Firebase :
- firestore.rules (security rules pour dashboard)
- firestore.indexes.json (composite indexes pour les queries du dashboard)
- src/scripts/seedData.ts (données de test pour le dashboard client)

Justifie chaque index par la query Firestore qu'il optimise.

Queries à optimiser pour le Client Dashboard :
- Réservations à venir par user_id + date (orderBy)
- Stats de réservation par user_id (count)
- Courts disponibles (where status == 'active')
```

**Livrables attendus :**
- [ ] Security rules pour `reservations` (lecture par user_id)
- [ ] Security rules pour `courts` (lecture seule pour client)
- [ ] Index composites pour les queries du dashboard
- [ ] Seed data avec réservations futures et passées

**Condition de passage :** Security rules validées, index justifiés.

---

### Étape 3 — Implémentation

**Agent :** `qwen-react-developer`  
**Prompt :**
```
Implémente la user story US-010 (Client Dashboard) en suivant exactement :
- L'audit PNG de l'étape 0 (référence visuelle absolue)
- Le plan de l'architecte (étape 1)
- Le schéma Firestore validé (étape 2)
- Le design system dans documentation/07_DESIGN_SYSTEM.md

Fichiers PNG de référence :
- /Users/mathieu/StudioProjects/web_tennis/stitch_prd_tennis_club_du_fran_ois/dashboard_client_r_servation/screen.png
- /Users/mathieu/StudioProjects/web_tennis/stitch_prd_tennis_club_du_fran_ois/dashboard_client_dynamique_r_servations_temps_r_el/screen.png

En cas de conflit entre les docs texte et le PNG, le PNG a toujours raison.

Tâches à implémenter (Phase 7.1 du TODO_LIST) :
- [ ] Create src/pages/client/ClientDashboard.tsx
- [ ] Implement stats cards (total reservations, upcoming, completed, cancelled)
- [ ] Implement upcoming reservations list (next 7 days)
- [ ] Implement quick booking CTA (redirect vers BookingPage)

Interdictions absolues :
- Zéro `any` TypeScript
- Zéro `style={{}}` ou fichier `.css` custom (Tailwind uniquement)
- Zéro `useEffect` pour charger des données Firestore (utiliser hooks personnalisés)
- Zéro invention de structure non définie par l'architecte
```

**Livrables attendus :**
- [ ] `src/pages/client/ClientDashboard.tsx` (page principale)
- [ ] `src/components/dashboard/StatsCard/StatsCard.tsx` (4 cartes : total, upcoming, completed, cancelled)
- [ ] `src/components/dashboard/UpcomingReservations/UpcomingReservations.tsx` (liste des réservations à venir)
- [ ] `src/components/dashboard/QuickBooking/QuickBooking.tsx` (CTA vers réservation)
- [ ] `src/hooks/useDashboardStats.ts` (hook pour les stats)
- [ ] `src/hooks/useUpcomingReservations.ts` (hook pour les réservations à venir)
- [ ] `src/types/dashboard.types.ts` (types spécifiques au dashboard)

**Condition de passage :** Tous les fichiers sont produits.

---

### Étape 4 — Audit Code

**Agent :** `qwen-react-ts-firebase-reviewer`  
**Prompt :**
```
Audite le code produit pour US-010 (Client Dashboard). Vérifie :
- TypeScript strict (no any, no implicit any)
- Patterns Firebase (transactions, onSnapshot, error handling)
- Accessibilité WCAG 2.1 AA
- Conformité visuelle et fonctionnelle aux PNG de l'étape 0

Fichiers PNG de référence :
- /Users/mathieu/StudioProjects/web_tennis/stitch_prd_tennis_club_du_fran_ois/dashboard_client_r_servation/screen.png
- /Users/mathieu/StudioProjects/web_tennis/stitch_prd_tennis_club_du_fran_ois/dashboard_client_dynamique_r_servations_temps_r_el/screen.png

Produis le rapport JSON structuré avec une section "design_conformity".
```

**Livrable :** Rapport JSON avec `status: "PASS" | "FAIL"`, listes `critical`, `major`, `minor`, et `design_conformity`.

**Condition de passage :** `status: "PASS"` (aucun critical ni major).

---

### Étape 5 — Tests

**Agent :** `general-purpose` (test-automation-specialist non disponible)  
**Prompt :**
```
Écris les tests pour US-010 (Client Dashboard). Stack : Vitest + React Testing Library + Firebase Emulator + Playwright.
Coverage minimum 80% sur lines, functions, branches, statements.

Tâches :
- [ ] Tests unitaires pour useDashboardStats
- [ ] Tests unitaires pour useUpcomingReservations
- [ ] Tests de composant pour StatsCard (rendu, props, accessibilité)
- [ ] Tests de composant pour UpcomingReservations (rendu, empty state, interactions)
- [ ] Tests de composant pour QuickBooking (rendu, click, redirect)
- [ ] Test d'intégration couvrant le flux complet du dashboard
- [ ] Test E2E Playwright avec seed via page.evaluate() avant navigation
```

**Livrables attendus :**
- [ ] `src/pages/client/ClientDashboard.test.tsx`
- [ ] `src/components/dashboard/StatsCard/StatsCard.test.tsx`
- [ ] `src/components/dashboard/UpcomingReservations/UpcomingReservations.test.tsx`
- [ ] `src/components/dashboard/QuickBooking/QuickBooking.test.tsx`
- [ ] `src/hooks/useDashboardStats.test.ts`
- [ ] `src/hooks/useUpcomingReservations.test.ts`
- [ ] `e2e/client-dashboard.spec.ts` (Playwright)

**Condition de clôture :** `npm run test` passe avec coverage ≥ 80%.

---

### Étape 6 — Animations (OPTIONNEL)

**Agent :** `qwen-ui-animator`  
**Déclencheur :** Uniquement si mention explicite d'animations dans les PNG ou le design.

**Prompt :**
```
Le code de US-010 (Client Dashboard) est validé. Ajoute les animations appropriées.
Tailwind pour les états hover/focus. Framer Motion pour les entrées/sorties du DOM.
Produis uniquement des diffs.

Éléments à animer (si visible dans les PNG) :
- Entry fade des stats cards (stagger)
- Hover scale sur les StatsCard
- Entry slide de la liste UpcomingReservations
- Hover sur le CTA QuickBooking
```

**Règles :**
- Diffs uniquement
- `useReducedMotion()` obligatoire
- Uniquement `transform` et `opacity` animés

---

### Résumé des fichiers à créer/modifier

```
src/
├── pages/
│   └── client/
│       ├── ClientDashboard.tsx (CRÉER)
│       └── ClientDashboard.test.tsx (CRÉER)
├── components/
│   └── dashboard/
│       ├── StatsCard/
│       │   ├── StatsCard.tsx (CRÉER ou utiliser Phase 3.6)
│       │   └── StatsCard.test.tsx (CRÉER)
│       ├── UpcomingReservations/
│       │   ├── UpcomingReservations.tsx (CRÉER)
│       │   └── UpcomingReservations.test.tsx (CRÉER)
│       └── QuickBooking/
│           ├── QuickBooking.tsx (CRÉER)
│           └── QuickBooking.test.tsx (CRÉER)
├── hooks/
│   ├── useDashboardStats.ts (CRÉER)
│   ├── useDashboardStats.test.ts (CRÉER)
│   ├── useUpcomingReservations.ts (CRÉER)
│   └── useUpcomingReservations.test.ts (CRÉER)
├── types/
│   └── dashboard.types.ts (CRÉER)
└── test/
    └── setup.ts (VÉRIFIER/METTRE À JOUR)

e2e/
└── client-dashboard.spec.ts (CRÉER)
```

---

### Commandes de validation

```bash
# 1. Build
npm run build

# 2. Type-check
npm run type-check

# 3. Tests
npm run test

# 4. E2E (optionnel)
npm run test:e2e

# 5. Lint
npm run lint
```

---

### Critères d'acceptation (Definition of Done)

- [ ] Audit PNG produit (≥10 éléments critiques)
- [ ] Plan architecte validé (7 sections)
- [ ] Security rules Firestore validées
- [ ] Index Firestore justifiés
- [ ] Tous les composants implémentés
- [ ] TypeScript strict (zéro `any`)
- [ ] Tailwind uniquement (zéro `style={{}}`)
- [ ] Hooks personnalisés pour les données Firestore
- [ ] Audit reviewer : `status: "PASS"`
- [ ] Tests unitaires : coverage ≥ 80%
- [ ] Test E2E : flux complet fonctionnel
- [ ] Animations ajoutées (si étape 6 déclenchée)
- [ ] Build successful
- [ ] Type-check passed
- [ ] Audit PASS (0 critical, 0 major)

---

## Ordre de traitement des user stories

Respecter l'ordre MoSCoW défini dans `documentation/10_TODO_LIST.md`. Ne jamais commencer une US "Should Have" si des US "Must Have" sont encore en cours.

**Sprint 1 recommandé (Setup & Infrastructure) :**
- Phase 1.1 → 1.5 (Project Setup complet)

**Sprint 2 recommandé (Client Features — le cœur du produit) :**
- Landing Page (US-002)
- Client Dashboard (US-010 à US-015)
- Réservation de courts (US-016 à US-019)

**Sprint 3 recommandé (Admin Features) :**
- Admin Dashboard (US-020 à US-024)
- Gestion des utilisateurs (US-025 à US-029)

**Sprint 4 recommandé (Moniteur Features) :**
- Agenda moniteur (US-030 à US-032)
- Gestion des créneaux (US-033 à US-039)

Chaque US est traitée séquentiellement dans la pipeline — ne pas paralléliser les agents sur une même US.

---

## Configuration Firebase Emulator

### Ports par défaut
| Service | Port | URL |
|---------|------|-----|
| Firestore Emulator | 8080 | localhost:8080 |
| Auth Emulator | 9099 | localhost:9099 |
| Emulator UI | 4000 | http://localhost:4000 |

### Commandes de démarrage
```bash
# Terminal 1 - Démarrer les émulateurs
npx firebase emulators:start

# Terminal 2 - Démarrer le dev server
npm run dev

# Terminal 3 - Tests en watch mode
npm run test:watch
```

### Seed des données de test
```typescript
// Dans le navigateur ou un script
import { seedDatabase } from './scripts/seedData';
await seedDatabase();
```

---

## Spécificités Firebase Firestore

### Patterns recommandés

**Lecture temps réel :**
```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(
    query(collection(db, 'reservations'), where('user_id', '==', userId)),
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReservations(data);
    }
  );
  return () => unsubscribe();
}, [userId]);
```

**Écriture avec transaction :**
```typescript
const createReservation = async (data) => {
  try {
    await runTransaction(db, async (transaction) => {
      // Vérifier disponibilité
      const doc = await transaction.get(reservationRef);
      if (doc.exists()) throw new Error('Already booked');
      
      // Créer réservation
      transaction.set(reservationRef, data);
    });
  } catch (error) {
    console.error('Transaction failed:', error);
  }
};
```

**Security rules par rôle :**
```javascript
function isAdmin() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}

match /reservations/{id} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
  allow update, delete: if isAdmin() || resource.data.user_id == request.auth.uid;
}
```

---

## 📝 Commit et Push — Instructions

### ⚠️ IMPORTANT — Aucun commit/push automatique

**Règle absolue :** L'IA ne doit **JAMAIS** exécuter de commit ou push Git automatiquement à la fin d'une user story.

**Pourquoi :**
- L'utilisateur veut réviser les changements avant de committer
- Plusieurs US peuvent être regroupées en un seul commit
- L'utilisateur veut contrôler le message de commit

**Ce que l'IA doit faire à la fin d'une US :**
1. ✅ Produire un rapport de synthèse (fichiers créés/modifiés, tests, coverage)
2. ✅ Afficher la commande `git status` pour voir les changements
3. ✅ **Attendre l'instruction explicite de l'utilisateur** pour commit/push

**Commandes à NE PAS exécuter automatiquement :**
```bash
❌ git add -A
❌ git commit -m "..."
❌ git push origin main
```

**Commandes à exécuter uniquement sur demande explicite :**
```bash
✅ git add -A          # Seulement si l'utilisateur dit "commit les changements"
✅ git commit -m "..." # Seulement si l'utilisateur dit "commit avec ce message"
✅ git push            # Seulement si l'utilisateur dit "push vers GitHub"
```

**Exception :** Si l'utilisateur demande explicitement "commit et push" à la fin de l'US, alors l'IA peut le faire.

---

## Résumé des différences avec L'Atelier POS

| Aspect | L'Atelier POS | Tennis Club du François |
|--------|---------------|-------------------------|
| Base de données | Dexie.js (IndexedDB) | Firebase Firestore (Cloud + Emulator) |
| Agents | Claude Code / Cursor | Qwen Agents |
| Référence visuelle | PNG Stitch | HTML Stitch + Documentation |
| Security | N/A (local) | Firestore Security Rules |
| Temps réel | Polling | onSnapshot (WebSocket) |
| Auth | N/A | Firebase Auth |
| Timezone | Europe/Paris | America/Martinique |

---

*Tennis Club du François — PIPELINE v2.0 — Document destiné au développement IA autonome avec Qwen Agents*
