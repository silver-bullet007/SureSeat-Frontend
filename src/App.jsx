import { useState, useEffect } from 'react';
import { login } from './api';
import { Routes, Route } from 'react-router-dom';
import EventList from './EventList';
import SeatMap from './SeatMap';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const result = await login(email, password);
      localStorage.setItem('token', result.token);
      setToken(result.token);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem(null);
    setToken(null);
  }

  if (token) {
    return (<div>
      <p>Logged in! Token: {token.substring(0, 20)}...</p>
      <button onClick={handleLogout}>Log Out</button>
      <Routes>
        <Route path="/" element={<EventList />}></Route>
        <Route path="/events/:id" element={<SeatMap />}></Route>
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
    </div>
  );
}

export default App;