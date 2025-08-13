import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// import './App.css';

console.log('main.jsx is executing!');

const container = document.getElementById('root');
console.log('Container element:', container);

const root = createRoot(container);
root.render(<App />);