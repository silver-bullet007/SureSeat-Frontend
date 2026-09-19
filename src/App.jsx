import { useState, useEffect } from 'react';
import { login } from './api';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { FaLinkedin, FaReact, FaDocker } from 'react-icons/fa';
import { SiSpringboot, SiPostgresql, SiRedis, SiApachekafka } from 'react-icons/si';
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
    return (
      <div className="min-h-screen bg-gray-900">
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-100">SeatSure</h1>
          <div className="flex items-center gap-4">
            {(role === 'ORGANIZER' || role === 'ADMIN') && (
              <Link
                to="/create-event"
                className="text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                + Create Event
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-400 hover:text-gray-100"
            >
              Log Out
            </button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<EventList />} />
            <Route path="/events/:id" element={<SeatMap />} />
            <Route path="/create-event" element={<CreateEvent />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative">

      <a href="https://www.linkedin.com/in/lokeshsun"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-6 right-6 flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-blue-400 transition-colors"
      >
        <FaLinkedin className="w-5 h-5" />
        Built By Lokesh
      </a>

      <div className="w-full max-w-sm">
        <div className="bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700">
          <h1 className="text-2xl font-bold text-gray-100 mb-6 text-center">
            SeatSure
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && (
              <p className="text-sm text-red-400 bg-red-900/30 px-3 py-2 rounded-md">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-500 transition-colors"
            >
              Log In
            </button>
          </form>
          <div className="mt-4 text-xs text-gray-500 text-center space-y-1">
            <p>
              <span className="text-gray-400">User account</span>{' '}
              (browse & book seats): demo@seatsure.com / demo1234
            </p>
            <p>
              <span className="text-gray-400">Organizer account</span>{' '}
              (create events): organizer@seatsure.com / organizer1234
            </p>
            <p className="text-gray-600 pt-1">
              Only organizers can create events — this ensures
              role-based access control.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 mb-2">Built with</p>
          <div className="flex items-center justify-center gap-4 text-gray-500">
            <SiSpringboot className="w-6 h-6" title="Spring Boot" />
            <FaReact className="w-6 h-6" title="React" />
            <SiPostgresql className="w-6 h-6" title="PostgreSQL" />
            <SiRedis className="w-6 h-6" title="Redis" />
            <SiApachekafka className="w-6 h-6" title="Kafka" />
            <FaDocker className="w-6 h-6" title="Docker" />
          </div>
        </div>
      </div>
    </div >
  );
}

export default App;