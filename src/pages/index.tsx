import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch(`/api/ask?q=${encodeURIComponent(input)}`);
      const data = await res.json();
      setResponse(data.answerText || 'No answer found.');
    } catch (err) {
      setResponse('Error fetching answer.');
    }

    setLoading(false);
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h1>🤖 DejnyGPT</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          style={{
            flex: 1,
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
          }}
        />
        <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem' }}>
          {loading ? 'Thinking...' : 'Ask'}
        </button>
      </form>

      {response && (
        <div style={{ marginTop: '2rem', whiteSpace: 'pre-wrap', fontSize: '1.1rem' }}>
          <strong>Answer:</strong>
          <p>{response}</p>
        </div>
      )}
    </main>
  );
}
