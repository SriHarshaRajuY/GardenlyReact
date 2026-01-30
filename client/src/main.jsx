// src/main.jsx (ASSUMED - MODIFY TO INCLUDE CartProvider)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import AuthProvider from './context/AuthProvider.jsx';
import CartProvider from './context/CartProvider.jsx'; // NEW
import { Provider } from 'react-redux';
import store from './redux/store';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </Provider>
  </React.StrictMode>
);