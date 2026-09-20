import { useState } from 'react';
import CodeEditor from './components/CodeEditor';

export default function App() {
  // Initialize state with some default C++ code
  const [code, setCode] = useState(
    '// Write your C++ code here\n#include <iostream>\n\nint main() {\n    std::cout << "Hello AI Assistant!";\n    return 0;\n}'
  );

  const [review, setReview] = useState("AI feedback and suggested fixes will appear here...");

  const handleReviewRequest = async () => {
    setReview("Analyzing code...");
    
    try {
      const response = await fetch('http://localhost:5000/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code })
      });
      
      const data = await response.json();
      setReview(data.review);
    } catch (error) {
      setReview("Error: Could not connect to the backend server.");
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#1e1e1e', color: '#fff' }}>
      
      {/* Left Side: Code Editor */}
      <div style={{ width: '50%', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px 15px', backgroundColor: '#252526', borderBottom: '1px solid #333', fontWeight: 'bold' }}>
          main.cpp
        </div>
        <div style={{ flexGrow: 1 }}>
          <CodeEditor code={code} setCode={setCode} />
        </div>
      </div>

      {/* Right Side: AI Review Panel */}
      <div style={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px 15px', backgroundColor: '#252526', borderBottom: '1px solid #333', fontWeight: 'bold' }}>
          AI Debugging Panel
        </div>
        
        <div style={{ flexGrow: 1, padding: '20px', overflowY: 'auto', color: '#cccccc' }}>
          <p>AI feedback and suggested fixes will stream here...</p>
        </div>
        
        <div style={{ padding: '15px', backgroundColor: '#252526', borderTop: '1px solid #333' }}>
          <button 
            onClick={handleReviewRequest}
            style={{ 
              width: '100%', padding: '10px', backgroundColor: '#007acc', 
              color: 'white', border: 'none', borderRadius: '4px', 
              cursor: 'pointer', fontWeight: 'bold' 
            }}
          >
            Review Code
          </button>
        </div>
      </div>

    </div>
  );
}