const BASE_URL = 'http://localhost:8081/api';

export async function login(email, password) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
    }

    return response.json();
}

export async function register(email, password, fullName) {
    const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
    }

    return response.json();
}

export async function getEvents() {
    const response = await fetch(`${BASE_URL}/events`);

    if (!response.ok) {
        throw new Error('Failed to Load Events');
    }

    return response.json();
}

export async function getSeats(eventId) {
    const response = await fetch(`${BASE_URL}/events/${eventId}/seats`);

    if (!response.ok) {
        throw new Error('Failed to load seats');
    }
    return response.json();
}

export async function holdSeat(seatId, token) {
    const response = await fetch(`${BASE_URL}/bookings/hold`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ seatId })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to hold seat');
    }

    return response.json();
}

export async function confirmBooking(bookingId, token) {
    const response = await fetch(`${BASE_URL}/bookings/${bookingId}/confirm`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to confirm booking');
    }

    return response.json();
}

export async function createEvent(eventData, token) {
    const response = await fetch(`${BASE_URL}/events`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create event');
    }

    return response.json();
}

export async function addSeats(eventId, seatNumbers, token) {
    const response = await fetch(`${BASE_URL}/events/${eventId}/seats`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ seatNumbers }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add seats');
    }

    return response.json();
}