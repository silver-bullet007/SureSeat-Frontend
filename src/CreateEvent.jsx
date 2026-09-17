import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent, addSeats } from './api';

function CreateEvent() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [venue, setVenue] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [description, setDescription] = useState('');
    const [seatNumbers, setSeatNumbers] = useState('');
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        const token = localStorage.getItem('token');

        try {
            const event = await createEvent(
                { title, venue, eventTime, description },
                token
            );

            // Turn "A1, A2, A3" into ["A1", "A2", "A3"] before sending.
            const seatList = seatNumbers
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s.length > 0);

            if (seatList.length > 0) {
                await addSeats(event.id, seatList, token);
            }

            navigate(`/events/${event.id}`);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div>
            <h2>Create Event</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                    <label>Venue</label>
                    <input value={venue} onChange={(e) => setVenue(e.target.value)} required />
                </div>
                <div>
                    <label>Event Time</label>
                    <input
                        type="datetime-local"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Description</label>
                    <input value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div>
                    <label>Seat Numbers (comma-separated, e.g. A1, A2, A3)</label>
                    <input value={seatNumbers} onChange={(e) => setSeatNumbers(e.target.value)} />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Create Event</button>
            </form>
        </div>
    );
}

export default CreateEvent;