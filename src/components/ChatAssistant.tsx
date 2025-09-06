import { Recipe } from '@/types/recipe';
import { useState } from 'react';

export default function ChatAssistant() {
  // Local state to track the user's input in the text box
  const [input, setInput] = useState('');

  // Local state to track loading state during API call
  const [loading, setLoading] = useState(false);

  // Local state to store AI-generated recipe results
  const [results, setResults] = useState<Recipe[]>([]);

  // Function to send the user's message to the AI backend
  const sendMessage = async () => {
    setLoading(true); // Show loading state while waiting for response

    try {
      // Call the API route that processes AI chat logic
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: input }), // Send user input as body
        headers: { 'Content-Type': 'application/json' },
      });

      // Parse the response from the API
      const data = await res.json();

      // Update the result list with new recipes
      setResults(data.recipes);
    } catch (err) {
      console.error('Failed to fetch AI results:', err);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="border p-4 rounded shadow bg-white">
      {/* Textarea input for user's prompt */}
      <textarea
        className="w-full border p-2"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Ask me anything about food..."
      />

      {/* Submit button to trigger sendMessage */}
      <button
        onClick={sendMessage}
        disabled={loading}
        className="mt-2 px-4 py-2 bg-blue-600 text-white"
      >
        {loading ? 'Thinking...' : 'Ask'}
      </button>

      {/* Display AI-generated recipe suggestions */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {results?.map((recipe, index) => (
          <div key={recipe.id || index} className="border p-4 rounded">
           <h3 className="font-semibold mb-1">{recipe.title || 'Untitled Recipe'}</h3>
            <p className="text-sm text-gray-600">{recipe.description || 'No description available.'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}