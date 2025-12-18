import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as jose from 'jose';
import envelopeImg from './assets/envelope.png';
import './postcard.css'; // Ensure CSS is imported here too if not globally

const StartPage = () => {
  const [isClicked, setIsClicked] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleBlur = () => {
    setTimeout(() => {
      setIsClicked(false);
      setPassword('');
    }, 150); 
  };

  const hashPassword = async (pwd: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 2. Hash what the user typed
    const inputHash = await hashPassword(password);
    // 3. Compare to your secret env variable
    const correctHash = import.meta.env.VITE_PASSWORD_HASH;

    if (inputHash === correctHash) {
      try {
        // 4. Create the JWT token using the Private Key
        const privateKeyRaw = import.meta.env.VITE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const privateKey = await jose.importPKCS8(privateKeyRaw, 'RS256');

        const jwt = await new jose.SignJWT({ authenticated: true })
          .setProtectedHeader({ alg: 'RS256' })
          .setIssuedAt()
          .setExpirationTime('15m')
          .sign(privateKey);

        localStorage.setItem('auth_token', jwt);
        navigate(`${window.location.pathname}postcard`);
      } catch (err) {
        console.error("JWT Signing failed", err);
        alert("Error creating security token.");
      }
    } else {
      alert("Wrong password! Hint: It's my bae's name!");
      setPassword('');
    }
  };

  return (
    <div className="start-container">
      <img 
        src={envelopeImg} 
        alt="Envelope" 
        className={`envelope-trigger ${isClicked ? 'is-active' : ''}`}
        onClick={() => !isClicked && setIsClicked(true)}
        style={{ width: '84vmin', height: '56vmin' }}
      />

      {isClicked && (
        <div className="password-overlay">
          <form onSubmit={handleSubmit}>
            <input 
              type="password" 
              placeholder="Enter Password..." 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              onBlur={handleBlur}
              className="password-input"
            />
          </form>
        </div>
      )}
    </div>
  );
};

export default StartPage;