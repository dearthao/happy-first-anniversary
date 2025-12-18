import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import StartPage from './StartPage.tsx'
import Postcard from './Postcard.tsx'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/happy-first-anniversary/" element={<StartPage />} />
      <Route path="/happy-first-anniversary/postcard/" element={<Postcard />} />
    </Routes>
  );
}

export default App
