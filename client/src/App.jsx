import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [smth, setSmth] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [main, setMain] = useState("")
  const [level, setLevel] = useState("beginner")
  const [depth, setDepth] = useState("standard")
  const [topic, setTopic] = useState("")
  const [sub, setSub] = useState([])
  const [goal, setGoal] = useState("")
  const [ans, setAns] = useState([])
  const [backSub, setBackSub] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAutoLoading, setIsAutoLoading] = useState(false)
  const [error, setError] = useState("")
  const [learnError, setLearnError] = useState("")
  

  useEffect(() => {
    if (isLoading) {
      setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
          loader.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [isLoading]);

  const handleLevel = (e) => setLevel(e.target.value);
  const handleDepth = (e) => setDepth(e.target.value);

  const add = () => {
    if (topic.trim() !== "") {
      setSub([...sub, topic]);
      setTopic("");
    }
  }

  const removeTopic = (index) => {
    setSub(sub.filter((_, i) => i !== index));
  }

  const generateLearningPath = async () => {
    setIsLoading(true);
    setLearnError("");
    try {
      const response = await fetch("/api/learn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level,
          main,
          depth,
          sub,
          goal,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("line 68", typeof data, data)
      if (data.length === 0){
        console.log("Setting learnError - empty data");
        setLearnError("Please try again with valid topics.");
        setIsLoading(false);
        return;
      }
      console.log(data);
      // Handle the response data here
      
      // Clear error only on successful response with valid data
      
      // Clear all form fields
      setMain("");
      setLevel("beginner");
      setDepth("standard");
      setBackSub([...sub]);
      setSub([]);
      setGoal("");
      setAns([...data]);
      
    } catch (error) {
      console.error("Error generating learning path:", error);
      console.log("Setting learnError - catch block");
      setLearnError("Failed to generate learning path. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const autoGenerate = async () => {
    if (!main || main.trim() === "") {
      setError("Please enter a main topic first!");
      return;
    }
    
    setError("");
    setIsAutoLoading(true);
    try {
      const response = await fetch("/api/auto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level,
          main,
          depth,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Handle the response data here
      if (data.length === 0){
        console.log("Setting learnError - empty data");
        setError("Please try again with valid topics.");
        setIsAutoLoading(false);
        return;
      }
      
      // Clear all form fields
      setSub([...sub, ...data]);
    } catch (error) {
      console.error("Error auto-generating topics:", error);
      setError("Failed to generate topics. Please try again.");
    } finally {
      setIsAutoLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch("/api/learn");
      const data = await response.json();
      setSmth(data);
      console.log(data);
    } catch (error) {
      console.log(error)
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <>
      <div id="container" className={isDarkMode ? 'dark-mode' : ''}>
        <header className="header">
          <div className="logo-section">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            </div>
            <div>
              <h1 className="app-title">LearnFast</h1>
              <p className="app-subtitle">Optimized Learning</p>
            </div>
          </div>
          
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {isDarkMode ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
        </header>

        <main className="main-content">
          <h2 className="main-heading">Discover Optimal Resources</h2>
          <p className="main-description">
            Generate curated resources ranked by quality,
            comprehensiveness, and usefulness.
          </p>

          <div className="form-container">
            <div className="form-group">
              <label className="form-label">What do you want to learn?</label>
              <div className="input-with-icon">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="text-input"
                  placeholder="e.g., React, Machine Learning, Python..."
                  id = "main"
                  value = {main}
                  onChange={(e) => {
                    setMain(e.target.value);
                    if (error) setError("");
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Current Knowledge Level</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" name="knowledge" value="beginner" onChange = {handleLevel} checked={level === "beginner"} />
                  <span>Beginner</span>
                </label>
                <label className="radio-label">
                  <input type="radio" name="knowledge" value="intermediate" onChange = {handleLevel} checked={level === "intermediate"} />
                  <span>Intermediate</span>
                </label>
                <label className="radio-label">
                  <input type="radio" name="knowledge" value="advanced" onChange = {handleLevel} checked={level === "advanced"} />
                  <span>Advanced</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Depth Level</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" name="depth" value="overview" onChange = {handleDepth} checked={depth === "overview"} />
                  <span>Overview</span>
                </label>
                <label className="radio-label">
                  <input type="radio" name="depth" value="standard" onChange = {handleDepth} checked={depth === "standard"} />
                  <span>Standard</span>
                </label>
                <label className="radio-label">
                  <input type="radio" name="depth" value="deep-dive" onChange = {handleDepth} checked={depth === "deep-dive"} />
                  <span>Deep Dive</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <div className="label-with-button">
                <label className="form-label">Learning Topics</label>
                <button 
                  className="auto-generate-btn" 
                  onClick={autoGenerate}
                  disabled={isAutoLoading}
                >
                  {isAutoLoading ? (
                    <>
                      <span className="auto-generate-spinner"></span>
                      <span>Generating...</span>
                    </>
                  ) : (
                    '✨ Auto-Generate'
                  )}
                </button>
              </div>
              <p className="help-text">
                Click auto-generate to create topics based on your knowledge level and depth
                preference
              </p>
              {error && (
                <p className="error-message">{error}</p>
              )}
              <div className="topic-input-container">
                <input
                  type="text"
                  className="text-input"
                  placeholder="Add a topic..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      add();
                    }
                  }}
                />
                <button className="add-btn" onClick={add}>+</button>
              </div>
              {sub.length > 0 && (
                <>
                  <div className="topics-list">
                    {sub.map((topic, index) => (
                      <div key={index} className="topic-tag">
                        <span className="topic-text">{topic}</span>
                        <span className="topic-remove" onClick={() => removeTopic(index)}>×</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    className="clear-btn" 
                    onClick={() => setSub([])}
                    style={{ marginTop: '8px' }}
                  >
                    Clear All Topics
                  </button>
                </>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Learning Goal (Optional)</label>
              <textarea
                className="textarea-input"
                placeholder="e.g., Build a portfolio website, Pass certification exam, Switch careers..."
                rows="4"
                value = {goal}
                onChange = {(e) => setGoal(e.target.value)}
              />
              <p className="character-count">0 characters</p>
            </div>
            {learnError && (
              <p className="error-message" style={{ marginTop: '0px', marginBottom: '4px' }}>{learnError}</p>
            )}
            <button 
              className="generate-btn" 
              onClick={generateLearningPath}
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Learning Path'}
            </button>
          </div>
          <div id = "answers">
            {isLoading ? (
              <div className="loading-container" id="loader">
                <div className="loading-spinner"></div>
                <p className="loading-text">Generating resources...</p>
                <p className = "loading-text"  style={{ marginTop: '0px', marginBottom: '4px' }}>It will take some time.</p>
              </div>
            ) : ans.length > 0 ? (
              <div className="numbered-list-container">
                <h3 className="answers-title">Resources</h3>
                <ol className="numbered-list">
                  {ans.map((item, index) => {
                    // Extract link from "topic: link" format
                    const linkPart = item.includes(': ') ? item.split(': ').slice(1).join(': ') : item;
                    // Add https:// if link doesn't start with http:// or https://
                    const fullLink = linkPart.startsWith('http://') || linkPart.startsWith('https://') 
                      ? linkPart 
                      : `https://${linkPart}`;
                    
                    return (
                      <li key={index} className="numbered-list-item">
                        <a 
                          href={fullLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="resource-link"
                        >
                          {backSub[index]}
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </>
  )
}

{/* <div>
{smth || "Loading..."}
<button id = "learn" onClick = {fetchData}>Click Me</button>
</div> */}

export default App