import React from 'react';
import logo from './logo.svg';
import Text from './Text.jsx';
import Text1 from './Text1.jsx';
import './App.css';

const App = () => {
  return (
    <div className='App'>
      <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo' />
        <p>Hello Vite + React!</p>
        <Text />
        <Text1 />
        <p></p>
        <p>
          Edit <code>App.jsx</code> and save to test HMR updates.
        </p>
        <p>
          <a
            className='App-link'
            href='https://reactjs.org'
            target='_blank'
            rel='noopener noreferrer'
          >
            Learn React
          </a>
          {' | '}
          <a
            className='App-link'
            href='https://vitejs.dev/guide/features.html'
            target='_blank'
            rel='noopener noreferrer'
          >
            Vite Docs
          </a>
        </p>
      </header>
    </div>
  );
};

export default App;
