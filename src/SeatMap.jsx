import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSeats, holdSeat, confirmBooking } from './api';

function SeatMap() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [seats, setSeats] = useState([]);
    const [message, setMessage] = useState('');
    const [heldSeatId, setHeldSeatId] = useState(null);
    const [heldBookingId, setHeldBookingId] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        async function getAllSeats() {
            try {
                const data = await getSeats(id);
                setSeats(data);

                if (heldSeatId) {
                    const currSeat = data.find((s) => s.id === heldSeatId);
                    if (currSeat && currSeat.status !== 'HELD') {
                        setMessage('');
                        setHeldSeatId(null);
                        setHeldBookingId(null);
                    }
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        getAllSeats();

        const timerId = setInterval(getAllSeats, 5000);
        return () => clearInterval(timerId);
    }, [id, heldSeatId]);

    async function handleClick(seatId) {
        setMessage('');
        setError('');
        const token = localStorage.getItem('token');
        try {
            const result = await holdSeat(seatId, token);
            setMessage(`Held Seat !! Expires at ${result.expiresAt}`);
            setHeldSeatId(seatId);
            setHeldBookingId(result.id);
            const updated = await getSeats(id);
            setSeats(updated);
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleConfirm() {
        setError('');
        const token = localStorage.getItem('token');
        try {
            await confirmBooking(heldBookingId, token);
            setMessage('Booking confirmed!');
            setHeldSeatId(null);
            setHeldBookingId(null);
            const updated = await getSeats(id);
            setSeats(updated);
        } catch (err) {
            setError(err.message);
        }
    }

    if (loading) return <p className="text-gray-400">Loading seats...</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">
                Seats for Event {id}
            </h2>
            {message && (
                <p className="text-sm text-green-400 bg-green-900/30 px-3 py-2 rounded-md mb-4 inline-block">
                    {message}
                </p>
            )}
            {error && (
                <p className="text-sm text-red-400 bg-red-900/30 px-3 py-2 rounded-md mb-4 inline-block">
                    {error}
                </p>
            )}
            {heldBookingId && (
                <div className="mb-4">
                    <button
                        onClick={handleConfirm}
                        className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-green-500 transition-colors"
                    >
                        Confirm Booking
                    </button>
                </div>
            )}

            <div className="flex gap-4 mb-4 text-sm text-gray-300">
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-gray-800 border border-gray-600"></span>
                    Available
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-yellow-500"></span>
                    Held
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-gray-600"></span>
                    Booked
                </span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
                {seats.map((seat) => {
                    const isAvailable = seat.status === 'AVAILABLE';
                    const isHeld = seat.status === 'HELD';
                    const isBooked = seat.status === 'BOOKED';

                    return (
                        <button
                            key={seat.id}
                            disabled={!isAvailable}
                            onClick={() => handleClick(seat.id)}
                            className={`
                aspect-square rounded-md text-sm font-medium border transition-colors
                ${isAvailable ? 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-blue-900/40 hover:border-blue-500 cursor-pointer' : ''}
                ${isHeld ? 'bg-yellow-500/20 border-yellow-600 text-yellow-300 cursor-not-allowed' : ''}
                ${isBooked ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed' : ''}
              `}
                        >
                            {seat.seatNumber}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default SeatMap;