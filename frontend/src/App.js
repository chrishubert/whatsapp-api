import './App.scss';
import "../src/styles/main.scss";
import React, { useEffect, useState } from 'react'
import SocketConnection from './SocketConnection'
import { checkApiKey } from './clients/ApiClient'

function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [enteredApiKey, setEnteredApiKey] = useState('')

  useEffect(() => {
    handleCheckApiKey();
  }, []);

  const handleCheckApiKey = async () => {
    const result = await checkApiKey(enteredApiKey);
    if (result.success) {
      setAuthenticated(true);
    }
  };

  if (authenticated) {
    return (
      <div className="App">
        <SocketConnection apiKey={enteredApiKey}/>
      </div>
    )
  } else {
    return (
      <div className="authorizationPage">
        <div className="authorization">
          <div className="title">
            <h3>This page is protected</h3>
          </div>
          <input
            type="text"
            id="apiKey"
            name="apiKey"
            placeholder="Enter your api key"
            value={enteredApiKey}
            onChange={
              evt => {
                setEnteredApiKey(evt.target.value)
              }
            }/>
          <button onClick={handleCheckApiKey}>Continue</button>
        </div>
      </div>
    )
  }
}

export default App;
