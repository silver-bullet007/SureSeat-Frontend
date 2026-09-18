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
    const [demoRunning, setDemoRunning] = useState(false);
    const [demoPanels, setDemoPanels] = useState(null);
    const [showTechNotes, setShowTechNotes] = useState(false);
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

    async function handleConcurrencyDemo() {
        const availableSeat = seats.find((seat) => seat.status === 'AVAILABLE');
        if (!availableSeat) {
            setDemoPanels({ error: 'No available seat to demo with right now' });
            return;
        }
        setDemoRunning(true);
        setDemoPanels({
            seatNumber: availableSeat.seatNumber,
            customerA: { status: 'pending' },
            customerB: { status: 'pending' }
        });

        const token = localStorage.getItem('token');

        const [resultA, resultB] = await Promise.allSettled([
            holdSeat(availableSeat.id, token),
            holdSeat(availableSeat.id, token),
        ]);

        setDemoPanels({
            seatNumber: availableSeat.seatNumber,
            customerA: resultA.status === 'fulfilled'
                ? { status: 'success' }
                : { status: 'failed', message: resultA.reason.message },
            customerB: resultB.status === 'fulfilled'
                ? { status: 'success' }
                : { status: 'failed', message: resultB.reason.message },
        });

        setDemoRunning(false);

        const updated = await getSeats(id);
        setSeats(updated);
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

            <div className="mb-6 bg-gray-800 border border-gray-700 rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-100">
                        Live Concurrency Demo
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleConcurrencyDemo}
                            disabled={demoRunning}
                            className="text-sm font-medium bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-500 transition-colors disabled:opacity-50"
                        >
                            {demoRunning ? 'Booking...' : '⚡ Run Demo'}
                        </button>
                        {demoPanels && (
                            <button
                                onClick={() => setDemoPanels(null)}
                                className="text-gray-400 hover:text-gray-100 text-lg px-2"
                                title="Close demo"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                    Fires two real, simultaneous hold requests at the backend for the same
                    seat — proving the database lock allows exactly one to succeed.
                </p>

                {demoPanels?.error && (
                    <p className="text-sm text-red-400">{demoPanels.error}</p>
                )}

                {demoPanels && !demoPanels.error && (
                    <>
                        <p className="text-xs text-gray-400 mb-3">
                            Two customers both try to book seat{' '}
                            <strong className="text-gray-200">{demoPanels.seatNumber}</strong>{' '}
                            at the exact same moment:
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Customer A', data: demoPanels.customerA },
                                { label: 'Customer B', data: demoPanels.customerB },
                            ].map(({ label, data }) => (
                                <div
                                    key={label}
                                    className={`
              rounded-md border p-4 text-center transition-colors
              ${data.status === 'pending' ? 'border-gray-600 bg-gray-900' : ''}
              ${data.status === 'success' ? 'border-green-600 bg-green-900/20' : ''}
              ${data.status === 'failed' ? 'border-red-600 bg-red-900/20' : ''}
            `}
                                >
                                    <p className="text-sm font-medium text-gray-300 mb-2">{label}</p>
                                    {data.status === 'pending' && <p className="text-2xl">⏳</p>}
                                    {data.status === 'success' && (
                                        <>
                                            <p className="text-2xl">✅</p>
                                            <p className="text-xs text-green-400 mt-1">Seat Held</p>
                                        </>
                                    )}
                                    {data.status === 'failed' && (
                                        <>
                                            <p className="text-2xl">❌</p>
                                            <p className="text-xs text-red-400 mt-1">{data.message} ( Held by Another Customer )</p>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <div className="mt-4 pt-4 border-t border-gray-700">
                    <button
                        onClick={() => setShowTechNotes(!showTechNotes)}
                        className="text-xs font-medium text-purple-400 hover:text-purple-300"
                    >
                        {showTechNotes ? '▾ Hide technical notes' : '▸ How does this work?'}
                    </button>

                    {showTechNotes && (
                        <div className="mt-3 text-xs text-gray-400 leading-relaxed space-y-3">
                            <p>
                                Both requests hit the same backend endpoint at the same time. The
                                database query locks the seat row before checking its status:
                            </p>
                            <pre className="bg-gray-900 border border-gray-700 rounded-md p-3 overflow-x-auto text-gray-300">
                                {`@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT s FROM Seat s WHERE s.id = :id")
Optional<Seat> findByIdForUpdate(Long id);`}
                            </pre>
                            <p>
                                The second request physically waits for the first transaction to
                                commit — so it sees the seat's true, updated status instead of
                                stale data, and is rejected cleanly.
                            </p>
                            <p>
                                On the frontend, both attempts are fired at once using{' '}
                                <code className="bg-gray-900 px-1 py-0.5 rounded text-gray-300">
                                    Promise.allSettled
                                </code>
                                , so we can observe both outcomes even though one of them fails:
                            </p>
                            <pre className="bg-gray-900 border border-gray-700 rounded-md p-3 overflow-x-auto text-gray-300">
                                {`const [resultA, resultB] = await Promise.allSettled([
  holdSeat(seatId, token),
  holdSeat(seatId, token),
]);`}
                            </pre>
                        </div>
                    )}
                </div>
            </div>

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