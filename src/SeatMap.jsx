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
            setMessage('');
            try {
                const data = await getSeats(id);
                setSeats(data);
            }
            catch (err) {
                setError(err.message);
            }
            finally {
                setLoading(false);
            }
            if (heldSeatId) {
                const currSeat = data.find((s) => s.id === heldSeatId)
                if (currSeat && currSeat.status !== 'HELD') {
                    setMessage('');
                    setHeldSeatId(null);
                    setHeldBookingId(null);
                }
            }
        }
        getAllSeats();

        const timerId = setInterval(getAllSeats, 5000);

        return (() => clearInterval(timerId));
    }, [id]);

    async function handleClick(seatId) {
        setMessage('');
        setError('');
        const token = localStorage.getItem('token');
        try {
            const result = await holdSeat(seatId, token);
            setMessage(`Held Seat !! Expires at ${result.expiresAt}`);
            setHeldSeatId(seatId);
            const updated = await getSeats(id);
            setSeats(updated);
        }
        catch (err) {
            setError(err.messsage);
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

    if (loading) return <p>Loading Seats...</p>

    return (
        <div>
            <h2>Seats for Event {id}</h2>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {heldSeatId && <button onClick={handleConfirm}>Confirm Booking</button>}
            <div>
                {seats.map((seat) => (<button key={seat.id} disabled={seat.status !== 'AVAILABLE'} onClick={() => handleClick(seat.id)} >
                    {seat.seatNumber} ({seat.status})
                </button>))}
            </div>
        </div>
    );
}

export default SeatMap;