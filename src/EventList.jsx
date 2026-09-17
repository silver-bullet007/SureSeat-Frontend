import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from './api';

function EventList() {
    const [error, setError] = useState('');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const data = await getEvents();
                setEvents(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);

    if (loading) return <p className="text-gray-400">Loading events...</p>;
    if (error) {
        return (
            <p className="text-sm text-red-400 bg-red-900/30 px-3 py-2 rounded-md inline-block">
                Error: {error}
            </p>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Upcoming Events</h2>
            {events.length === 0 && <p className="text-gray-400">No events found.</p>}
            <div className="grid gap-4 sm:grid-cols-2">
                {events.map((event) => (
                    <Link
                        key={event.id}
                        to={`/events/${event.id}`}
                        className="block bg-gray-800 border border-gray-700 rounded-lg p-5 hover:border-blue-500 hover:shadow-lg transition-all"
                    >
                        <h3 className="text-lg font-semibold text-gray-100">
                            {event.title}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">{event.venue}</p>
                        <p className="text-sm text-gray-300 mt-3">
                            <span className="font-medium text-gray-100">{event.availableSeats}</span>
                            {' / '}
                            {event.totalSeats} seats available
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default EventList;