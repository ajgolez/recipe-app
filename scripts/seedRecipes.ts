import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { recipes } from '../src/data/recipes'; 
import * as dotenv from 'dotenv';
dotenv.config();

initializeApp({
  credential: applicationDefault(), // Use service account if needed
});

const db = getFirestore();

async function seedRecipes() {
  const batch = db.batch();

  recipes.forEach((recipe) => {
    const ref = db.collection('recipes').doc(recipe.id);
    batch.set(ref, recipe);
  });

  await batch.commit();
  console.log('Recipes uploaded to Firestore');
}

seedRecipes().catch(console.error);