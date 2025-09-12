import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../../lib/firebaseAdmin";
import { CustomRecipe } from "@/types/recipe"; // Update path to your type

// AJG - Export an async API route handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Destructure the HTTP method and recipe ID from the request object
  const {
    query: { id },
    method,
  } = req;

  // Handle DELETE requests
  if (req.method === "DELETE") {
    try {
      // Delete the document with the specified ID from the 'recipes' collection
      await db
        .collection("recipes")
        .doc(id as string)
        .delete();

      // Respond with success message
      return res.status(200).json({ message: "Recipe deleted" });

    } catch (error) {
      // Log and respond with an error if deletion fails
      console.error("Error deleting recipe:", error);
      return res.status(500).json({ error: "Failed to delete recipe" });
    }

  // Handle PUT requests (for updating a recipe)
  } else if (req.method === "PUT") {
    try {
      // Extract updated recipe data from the request body
      const updatedRecipe = req.body;

      // Validate that the body is a valid object (not an array or null)
      if (
        !updatedRecipe ||
        typeof updatedRecipe !== "object" ||
        Array.isArray(updatedRecipe)
      ) {
        return res.status(400).json({ error: "Invalid recipe data" });
      }

      // Perform the update operation in Firestore
      await db
        .collection("recipes")
        .doc(id as string)
        .update(updatedRecipe); // Only updates fields provided

      // Respond with success message
      return res.status(200).json({ message: "Recipe updated successfully" });

    } catch (error) {
      // Log and respond with error if update fails
      console.error("Error updating recipe:", error);
      return res.status(500).json({ error: "Failed to update recipe" });
    }

  } else {
    // If the method is not PUT or DELETE, return Method Not Allowed
    res.setHeader("Allow", ["PUT", "DELETE"]); // Inform the client what methods are allowed
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}