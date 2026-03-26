# 🤖 Agents IA — L'Atelier POS

**Version :** 2.0 (Firebase Emulator Suite)  
**Dernière mise à jour :** 23 Mars 2026

---

## 📋 Vue d'Ensemble

Ce dossier contient les configurations des agents IA spécialisés utilisés pour le développement de L'Atelier POS.

Chaque agent a un rôle précis dans le pipeline de développement et produit des rapports structurés pour l'orchestration.

---

## 🔥 Agents Disponibles

### 1. `react-architect.md`

**Rôle :** Architecture et planification avant tout développement

**Quand l'utiliser :**
- Avant de commencer une nouvelle user story
- Pour planifier un refactoring majeur
- Pour concevoir la structure d'une nouvelle feature

**Sortie :**
- Structure de dossiers
- Interfaces TypeScript
- Schéma Firebase Firestore
- Plan de routing
- Hiérarchie des composants

---

### 2. `firebase-database-expert.md`

**Rôle :** Expert base de données Firebase Firestore

**Quand l'utiliser :**
- Création/modification de collections
- Changements de schéma
- Optimisation de requêtes
- Rules de sécurité
- Index composites

**Sortie :**
- Configuration Firebase (`src/firebase/config.ts`)
- Rules (`firestore.rules`)
- Index (`firestore.indexes.json`)
- Fonctions CRUD typées

---

### 3. `react-developer.md`

**Rôle :** Implémentation React + TypeScript + Firebase

**Quand l'utiliser :**
- Après l'architecture (react-architect)
- Pour créer des composants/hooks
- Pour modifier du code existant

**Exigences :**
- TypeScript strict (zéro `any`)
- Firebase singleton pattern
- Try/catch sur mutations Firestore
- onSnapshot avec unsubscribe
- Accessibilité WCAG 2.1 AA

---

### 4. `react-ts-firebase-reviewer.md`

**Rôle :** Audit de code avant validation

**Quand l'utiliser :**
- Après avoir écrit un hook/composant
- Avant de merger une PR
- Pour valider la conformité

**Exigences :**
- ✅ TypeScript strict
- ✅ Firebase singleton
- ✅ Try/catch sur mutations
- ✅ onSnapshot avec unsubscribe
- ✅ Accessibilité WCAG 2.1 AA
- ✅ Design System conforme

**Sortie :** Rapport JSON avec status PASS/FAIL

---

### 5. `test-automation-specialist.md`

**Rôle :** Tests automatisés avec Firebase Emulator

**Quand l'utiliser :**
- Après implémentation d'une feature
- Pour créer des tests unitaires
- Pour tests d'intégration/E2E

**Stack :**
- Vitest (tests unitaires)
- React Testing Library (composants)
- Firebase Emulator (Firestore + Auth)
- Playwright (E2E)

---

### 6. `design-system-reviewer.md`

**Rôle :** Audit fidélité Design System

**Quand l'utiliser :**
- Après implémentation UI
- Avant react-ts-firebase-reviewer
- Pour vérifier tokens/couleurs/typo

**Sortie :** Rapport avec score de conformité

---

### 7. `ui-animator.md`

**Rôle :** Animations UI (Framer Motion)

**Quand l'utiliser :**
- Après validation du code
- Pour ajouter hover/click/enter animations
- UNIQUEMENT si la feature le demande

**Exigences :**
- Zéro modification de logique
- Uniquement UI/UX
- Framer Motion pour animations

---

## 🚀 Pipeline de Développement

### Workflow Typique

```
1. [react-architect] → Plan et architecture
2. [firebase-database-expert] → Schéma Firestore + Rules
3. [react-developer] → Implémentation
4. [design-system-reviewer] → Audit Design System
5. [react-ts-firebase-reviewer] → Audit code complet
6. [test-automation-specialist] → Tests automatisés
7. [ui-animator] → Animations (si requis)
```

### Critères de Validation

Un code est validé si :
- ✅ `design-system-reviewer` score >= 90
- ✅ `react-ts-firebase-reviewer` retourne `status: "PASS"`
- ✅ Aucun problème `critical` ou `major`
- ✅ `firebase_audit` tous à `true`
- ✅ Tests passent à 100%

---

## 📊 Standards de Qualité

### TypeScript Strict

- ❌ Zéro `any`
- ✅ Types et interfaces explicites
- ✅ Generics correctement utilisés
- ✅ Unions discriminées

### Firebase Emulator

- ✅ Singleton pattern (`appInstance`, `dbInstance`)
- ✅ `getApps().length` check avant `initializeApp()`
- ✅ Émulateurs connectés une seule fois
- ✅ Try/catch sur toutes les mutations
- ✅ onSnapshot avec unsubscribe dans cleanup
- ✅ `Timestamp.now()` pas `Date.now()`

### Tailwind CSS

- ✅ Tokens Design System (`surface-container-*`, `primary`, etc.)
- ✅ Typographie conforme (Space Grotesk, Inter)
- ✅ Responsive avec breakpoints
- ✅ Hover/Focus/Active states

### Accessibilité (WCAG 2.1 AA)

- ✅ ARIA labels sur boutons et inputs
- ✅ Focus trap dans modals
- ✅ Escape handler
- ✅ Navigation clavier fonctionnelle
- ✅ Focus visible

---

## 🔧 Configuration des Agents

### Format des Fichiers

Chaque fichier agent `.md` contient :

1. **Front matter YAML**
   - `name`: Nom de l'agent
   - `description`: Description et exemples d'usage
   - `color`: Couleur dans l'interface (automatique)

2. **Mission et Rôle**
   - Objectif principal
   - Domaines d'expertise

3. **Critères d'Audit** (pour les reviewers)
   - Checklist détaillée
   - Exemples de problèmes

4. **Format de Sortie**
   - Structure JSON attendue
   - Critères PASS/FAIL

5. **Exemples de Corrections**
   - ❌ MAUVAIS
   - ✅ BON

---

## 📚 Documentation Associée

- `doc technique/AUDIT_MIGRATION_FIREBASE.md` — Audit complet migration Firebase
- `doc technique/FIREBASE_DEPANNAGE.md` — Guide de dépannage Firebase
- `doc technique/DESIGN_SYSTEM.md` — Design System complet
- `doc technique/PIPELINE.md` — Pipeline de développement IA

---

## 🎯 Bonnes Pratiques

### Pour les Développeurs IA

1. **Toujours lancer l'agent d'audit** après avoir écrit du code
2. **Corriger tous les problèmes CRITICAL et MAJOR** avant de continuer
3. **Respecter le format JSON** des rapports pour l'orchestration
4. **Être intransigeant** sur TypeScript strict et Firebase best practices

### Pour l'Orchestration

1. **Consulter les rapports JSON** pour décider des corrections
2. **Bloquer le merge** si `status: "FAIL"`
3. **Prioriser les corrections** : CRITICAL > MAJOR > MINOR
4. **Vérifier `firebase_audit`** pour la configuration Firebase

---

## 🔄 Historique des Versions

### Version 2.0 (23 Mars 2026) — Firebase Emulator Suite

- ✅ Migration Dexie.js → Firebase Emulator Suite
- ✅ Nouvel agent `firebase-database-expert`
- ✅ Nouvel agent `react-ts-firebase-reviewer`
- ✅ Mise à jour `test-automation-specialist` (Firebase Emulator)
- ✅ Mise à jour `react-developer` (Firestore patterns)
- ✅ Mise à jour `react-architect` (Firebase schema)

### Version 1.0 (Archive) — Dexie.js

- ❌ Utilisait Dexie.js (obsolète)
- ❌ Ancien agent `dexie-database-expert` (supprimé)
- ❌ Ancien agent `react-ts-dexie-reviewer` (supprimé)

---

## 📞 Support

En cas de problème avec un agent :

1. Vérifier le fichier de configuration `.md`
2. Consulter `doc technique/FIREBASE_DEPANNAGE.md`
3. Vérifier que le code respecte les critères d'audit

---

## 📋 Liste des Agents

### Agents Originaux (Configuration L'Atelier POS)

| Agent | Fichier | Rôle |
|-------|---------|------|
| **Architecte** | `react-architect.md` | Architecture et planification |
| **Database Expert** | `firebase-database-expert.md` | Schéma Firestore + Rules |
| **Developer** | `react-developer.md` | Implémentation React + Firebase |
| **Code Reviewer** | `react-ts-firebase-reviewer.md` | Audit de code |
| **Test Specialist** | `test-automation-specialist.md` | Tests automatisés |
| **Design Reviewer** | `design-system-reviewer.md` | Audit Design System |
| **UI Animator** | `ui-animator.md` | Animations UI |

### Agents Qwen Code (Ma Configuration)

| Agent | Fichier | Rôle |
|-------|---------|------|
| **Architecte** | `qwen-react-architect.md` | Architecture et planification |
| **Database Expert** | `qwen-firebase-database-expert.md` | Schéma Firestore + Rules |
| **Developer** | `qwen-react-developer.md` | Implémentation React + Firebase |
| **Code Reviewer** | `qwen-react-ts-firebase-reviewer.md` | Audit de code |
| **Design Reviewer** | `qwen-design-system-reviewer.md` | Audit Design System |
| **UI Animator** | `qwen-ui-animator.md` | Animations UI |

---

## 🤖 Configuration Qwen Code

### Différences avec la Configuration Originale

Les agents `qwen-*` sont des versions adaptées pour ma configuration personnelle en tant que Qwen Code. Les principales différences sont :

1. **Langue de réponse** : Les agents qwen répondent en **English** par défaut (ou French si demandé), tandis que les agents originaux répondent en Français
2. **Contexte projet** : Les agents qwen sont configurés pour le projet **Web Tennis Club** au lieu de L'Atelier POS
3. **Exemples métier** : Les exemples utilisent des réservations de courts de tennis au lieu de commandes de restaurant

### Quand Utiliser les Agents qwen-*

Utilisez les agents `qwen-*` lorsque :
- Vous travaillez sur le projet Web Tennis Club
- Vous préférez des réponses en English
- Vous voulez une configuration alignée avec mes standards personnels

### Pipeline de Développement Qwen Code

```
1. [qwen-react-architect] → Plan et architecture
2. [qwen-firebase-database-expert] → Schéma Firestore + Rules
3. [qwen-react-developer] → Implémentation
4. [qwen-design-system-reviewer] → Audit Design System
5. [qwen-react-ts-firebase-reviewer] → Audit code complet
6. [qwen-ui-animator] → Animations (si requis)
```

---

**Projet :** L'Atelier POS / Web Tennis Club  
**Stack :** React + TypeScript + Firebase Emulator + Tailwind CSS  
**Agents :** 7 (tous mis à jour Firebase)
