

import { useState, useEffect } from 'react';
import { getEvents } from "./api";
n

function EventList() {

    const [error, setError] = useState('');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const data = await getEvents();
                setEvents(data);
            }
            catch (err) {
                setError(err.message);
            }
            finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);

    if (loading) return <p>Loading Events ...</p>;
    if (error) return <p>Error : {error}</p>;

    return (
        <div>
            <h2>Upcoming Events</h2>
            {events.length === 0 && <p>No Events Found.</p>}
            <ul>
                {events.map((event) => (
                    <li key={event.id}>
                        <strong>{event.title}</strong> — {event.venue}
                        <br />
                        {event.availableSeats} / {event.totalSeats} seats available
                    </li>
                ))
                }
            </ul>
        </div>
    );
}
export default EventList;