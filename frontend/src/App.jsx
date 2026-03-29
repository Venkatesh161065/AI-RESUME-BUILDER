import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Builder from './pages/Builder';
import Premium from './pages/Premium';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/builder/:id" element={<Builder />} />
          <Route path="/premium" element={<Premium />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
