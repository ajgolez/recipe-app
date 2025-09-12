import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../../lib/firebaseAdmin";
import { CustomRecipe } from "@/types/recipe"; // Update path to your type

// AJG - Define an API route handler function for GET and POST requests
export default async function handler(
  req: NextApiRequest, // Incoming request object with query, body, method, etc.
  res: NextApiResponse // Response object to send data back to the client
) {
  // Destructure the 'id' from the query string and extract the HTTP method
  const {
    query: { id },
    method,
  } = req;

  // Handle POST request — used to create a new recipe
  if (req.method === "POST") {
    try {
      // Extract the new recipe data from the request body
      const newRecipe: CustomRecipe = req.body;

      // Add the new recipe to the 'recipes' collection in Firestore
      const docRef = await db.collection("recipes").add(newRecipe);

      // After Firestore generates a unique document ID, store that ID inside the document itself
      await docRef.update({ id: docRef.id });

      // Respond with the created recipe (including the generated ID)
      res.status(201).json({ ...newRecipe, id: docRef.id });
    } catch (error) {
      // Log any errors that occur and return a 500 Internal Server Error
      console.error("Error saving recipe:", error);
      res.status(500).json({ error: "Failed to save recipe" });
    }

    // Handle GET request — used to fetch all recipes
  } else if (req.method === "GET") {
    // NOTE: uses a snapshot to get all documents in the collection because
    // Firestore does not have a simple .getAll() method for collections.
    // This is the correct way to fetch all documents from a collection.

    // Fetch all documents from the 'recipes' collection in Firestore
    const snapshot = await db.collection("recipes").get();

    // Map each document into an object with its ID and data
    const recipes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Send the list of recipes as a JSON response
    res.status(200).json(recipes);

    // Handle unsupported HTTP methods
  } else {
    // Set the allowed methods in the response header
    res.setHeader("Allow", ["GET", "POST"]);

    // Return 405 Method Not Allowed
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
