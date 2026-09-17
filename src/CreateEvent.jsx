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
        <div className="max-w-lg">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Create Event</h2>
            <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Title
                    </label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Venue
                    </label>
                    <input
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Event Time
                    </label>
                    <input
                        type="datetime-local"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Description
                    </label>
                    <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Seat Numbers
                    </label>
                    <input
                        value={seatNumbers}
                        onChange={(e) => setSeatNumbers(e.target.value)}
                        placeholder="A1, A2, A3"
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Comma-separated seat labels</p>
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
                    Create Event
                </button>
            </form>
        </div>
    );
}

export default CreateEvent;