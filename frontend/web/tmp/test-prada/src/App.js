import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import AnnouncementBar from './components/AnnouncementBar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <div className="app">
      <AnnouncementBar />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/collection/:slug" element={<ProductListingPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/collections" element={<ProductListingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </div>
  );
}
