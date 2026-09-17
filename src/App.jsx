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
      setRole(storeRole);
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
    <div style={{ maxWidth: 400, margin: '50px auto' }}>
      <h1>SeatSure Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <div>
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Log In</button>
      </form>
      <p style={{ marginTop: 10, color: 'gray' }}>
        Demo account: demo@seatsure.com / demo1234
      </p>
    </div>
  );
}

export default App;