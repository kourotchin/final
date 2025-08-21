​vous​
import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const HomePage = () => {
  useEffect(() => {
    // S'assure que la carte est initialisée une seule fois
    const map = L.map('map').setView([48.8566, 2.3522], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const parisMarker = L.marker([48.8566, 2.3522]).addTo(map)
      .bindPopup('Un bar à Paris')
      .openPopup();

    return () => {
      map.remove();
    };
  }, []);
  
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-yellow-400">T'CHIN</h1>
      <p className="text-gray-300 mt-2">Trouvez votre bar parfait.</p>
      <div className="mt-8">
        <h2 className="text-2xl text-white">Carte des bars</h2>
        <div id="map" style={{ height: '500px', width: '100%' }} className="mt-4 rounded-lg"></div>
      </div>
    </div>
  );
};

const AdminPage = ({ onLogout }) => (
  <div className="p-8 bg-zinc-900 text-white min-h-screen">
    <div className="flex justify-between items-center">
      <h1 className="text-3xl text-yellow-400">Dashboard Admin</h1>
      <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">Déconnexion</button>
    </div>
    <div className="mt-8">
      <p>Bienvenue sur le tableau de bord. Ici, vous pourrez gérer vos bars et menus.</p>
      <p>Cette version n'est qu'une maquette. Le backend est nécessaire pour qu'elle fonctionne.</p>
    </div>
  </div>
);

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const ADMIN_PASSWORD = 'tchin2025';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError('Mot de passe incorrect.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900">
      <div className="bg-zinc-800 p-8 rounded-lg shadow-xl text-white">
        <h2 className="text-2xl text-yellow-400 mb-4">Accès Admin</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 rounded bg-zinc-700 text-white"
            required
          />
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded">Connexion</button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/admin')) {
      setCurrentPage('admin');
    } else {
      setCurrentPage('home');
    }
  }, []);

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    setCurrentPage('admin');
    window.history.pushState({}, '', '/admin');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentPage('home');
    window.history.pushState({}, '', '/');
  };

  let content;
  if (currentPage === 'admin') {
    content = isAdminLoggedIn ? <AdminPage onLogout={handleAdminLogout} /> : <AdminLogin onLogin={handleAdminLogin} />;
  } else {
    content = <HomePage />;
  }

  return (
    <div className="bg-zinc-900 text-white min-h-screen">
      <nav className="p-4 bg-zinc-800 flex justify-between">
        <div className="text-2xl font-bold text-yellow-400">T'CHIN</div>
        <div className="space-x-4">
          <button onClick={() => setCurrentPage('home')} className="hover:text-yellow-400">Accueil</button>
          <button onClick={() => setCurrentPage('admin')} className="hover:text-yellow-400">Admin</button>
        </div>
      </nav>
      {content}
    </div>
  );
}

export default App;
