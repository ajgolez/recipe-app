import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../lib/firebaseAdmin";
import { CustomRecipe } from "@/types/recipe"; // Update path to your type

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const newRecipe: CustomRecipe = req.body;

      const docRef = await db.collection("recipes").add(newRecipe);

      res.status(201).json({ ...newRecipe, id: docRef.id });
    } catch (error) {
      console.error("Error saving recipe:", error);
      res.status(500).json({ error: "Failed to save recipe" });
    }
  } else if (req.method === "GET") {
    // your existing fetch logic here
    const snapshot = await db.collection("recipes").get();
    const recipes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(recipes);
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
