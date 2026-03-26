/**
 * Test Script - Vérifier les données Firestore
 *
 * Ce script permet de vérifier si les données sont bien présentes dans les émulateurs.
 *
 * Usage:
 *   npx tsx test-firestore.ts
 *
 * Ou avec npm (après avoir ajouté le script dans package.json):
 *   npm run test:firestore
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, getDocs, Timestamp } from 'firebase/firestore';

// Firebase configuration for emulator
const firebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'tennis-francois-dev.firebaseapp.com',
  projectId: 'tennis-francois-dev',
  storageBucket: 'tennis-francois-dev.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456',
};

// Initialize Firebase
console.log('🔍 Initialisation de Firebase...\n');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to Firestore Emulator
console.log('🔌 Connexion aux émulateurs Firestore (localhost:8080)...\n');
connectFirestoreEmulator(db, 'localhost', 8080);

// ==========================================
// TEST FUNCTIONS
// ==========================================

async function testCourts() {
  console.log('🎾 Vérification des courts...\n');
  
  try {
    const querySnapshot = await getDocs(collection(db, 'courts'));
    
    if (querySnapshot.empty) {
      console.log('❌ Aucune donnée trouvée dans la collection "courts"');
      console.log('💡 Conseil : Ajoute des courts via l\'UI des émulateurs (http://localhost:4000)');
      return;
    }
    
    console.log(`✅ ${querySnapshot.size} court(s) trouvé(s)\n`);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   Court #${data.number}: ${data.name}`);
      console.log(`   - Type: ${data.type}`);
      console.log(`   - Surface: ${data.surface}`);
      console.log(`   - Status: ${data.status}`);
      console.log(`   - Active: ${data.is_active ? '✅' : '❌'}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Erreur lors de la lecture des courts:', error);
  }
}

async function testUsers() {
  console.log('👥 Vérification des utilisateurs...\n');
  
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    
    if (querySnapshot.empty) {
      console.log('❌ Aucune donnée trouvée dans la collection "users"');
      console.log('💡 Conseil : Ajoute des utilisateurs via l\'UI des émulateurs');
      return;
    }
    
    console.log(`✅ ${querySnapshot.size} utilisateur(s) trouvé(s)\n`);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   ${data.name} (${data.email})`);
      console.log(`   - Rôle: ${data.role}`);
      console.log(`   - Status: ${data.status}`);
      console.log(`   - UID: ${doc.id}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Erreur lors de la lecture des utilisateurs:', error);
  }
}

async function testReservations() {
  console.log('📅 Vérification des réservations...\n');
  
  try {
    const querySnapshot = await getDocs(collection(db, 'reservations'));
    
    if (querySnapshot.empty) {
      console.log('❌ Aucune donnée trouvée dans la collection "reservations"');
      console.log('💡 Conseil : Ajoute des réservations via l\'UI des émulateurs');
      return;
    }
    
    console.log(`✅ ${querySnapshot.size} réservation(s) trouvée(s)\n`);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const startTime = data.start_time instanceof Timestamp 
        ? data.start_time.toDate().toLocaleString('fr-FR') 
        : 'N/A';
      
      console.log(`   ${data.title || 'Réservation'}`);
      console.log(`   - Court: ${data.court_id}`);
      console.log(`   - User: ${data.user_id}`);
      console.log(`   - Start: ${startTime}`);
      console.log(`   - Type: ${data.type}`);
      console.log(`   - Status: ${data.status}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Erreur lors de la lecture des réservations:', error);
  }
}

// ==========================================
// MAIN TEST FUNCTION
// ==========================================

async function runTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  Firebase Firestore - Test Script      ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  console.log('📊 Project ID: tennis-francois-dev');
  console.log('🔗 Emulator UI: http://localhost:4000\n');
  console.log('─────────────────────────────────────────\n');
  
  await testCourts();
  console.log('─────────────────────────────────────────\n');
  
  await testUsers();
  console.log('─────────────────────────────────────────\n');
  
  await testReservations();
  console.log('─────────────────────────────────────────\n');
  
  console.log('✅ Tests terminés !\n');
  console.log('💡 Si aucune donnée n\'est trouvée :');
  console.log('   1. Vérifie que les émulateurs tournent (npm run emulators)');
  console.log('   2. Ouvre http://localhost:4000');
  console.log('   3. Ajoute des données dans Firestore');
  console.log('   4. Rafraîchis la page de l\'application (localhost:5173)\n');
}

// Run the tests
runTests().catch(console.error);
