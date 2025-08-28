import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/firebaseAdmin';

export default async function handler(_req: NextApiRequest,
  res: NextApiResponse) {
  const snapshot = await db.collection('recipes').get();
  const recipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.status(200).json(recipes);
}