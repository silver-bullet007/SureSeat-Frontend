import { useState, useEffect } from 'react';
import { login } from './api';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import EventList from './EventList';
import SeatMap from './SeatMap';
import CreateEvent from './CreateEvent';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    if (storedToken) {
      setToken(storedToken);
      setRole(storedRole);
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const result = await login(email, password);
      localStorage.setItem('token', result.token);
      localStorage.setItem('role', result.role);
      setToken(result.token);
      setRole(result.role);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
    navigate('/');
  }

  if (token) {
    return (<div>
      <p>Logged in! Token: {token.substring(0, 20)}...</p>
      <button onClick={handleLogout}>Log Out</button>
      {(role === 'ORGANIZER' || role === 'ADMIN') && (
        <Link to="/create-event">Create Event</Link>
      )}
      <Routes>
        <Route path="/" element={<EventList />} />
        <Route path="/events/:id" element={<SeatMap />} />
        <Route path="/create-event" element={<CreateEvent />} />
      </Routes>
    </div>);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          SeatSure Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Log In
          </button>
        </form>
        <p className="mt-4 text-xs text-gray-400 text-center">
          Demo account: demo@seatsure.com / demo1234
        </p>
      </div>
    </div>
  );
}

export default App;