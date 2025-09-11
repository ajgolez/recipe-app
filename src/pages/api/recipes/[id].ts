import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../../lib/firebaseAdmin";
import { CustomRecipe } from "@/types/recipe"; // Update path to your type

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { id },
    method,
  } = req;

  if (req.method === "DELETE") {
    try {
      await db
        .collection("recipes")
        .doc(id as string)
        .delete();
      return res.status(200).json({ message: "Recipe deleted" });
    } catch (error) {
      console.error("Error deleting recipe:", error);
      return res.status(500).json({ error: "Failed to delete recipe" });
    }
  } else {
    res.setHeader("Allow", ["PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
