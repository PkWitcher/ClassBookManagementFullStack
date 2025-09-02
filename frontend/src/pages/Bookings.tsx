// src/pages/Bookings.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookings, getAllBookings, cancelBooking } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/dateUtils';

type Booking = {
  id: string;
  session: {
    class: {
      name: string;
    };
    dateTime: string;
  };
  user: {
    email: string;
    role: string;
  };
  bookedAt: string;
};

export default function Bookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading, error } = useQuery<Booking[]>({
    queryKey: ['bookings', user?.role],
    queryFn: () => user?.role === 'Admin' ? getAllBookings() : getBookings(),
  });

  const { mutate: cancel } = useMutation({
    mutationFn: (bookingId: string) => cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const handleCancel = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      cancel(bookingId);
    }
  };

  if (isLoading) return (
    <div className="no-scroll-container">
      <div className="content-area">
        <div className="box-container">
          <div className="box-header">
            <h1 style={{ margin: 0, color: '#2c3e50' }}>Loading...</h1>
          </div>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="no-scroll-container">
      <div className="content-area">
        <div className="box-container">
          <div className="box-header">
            <h1 style={{ margin: 0, color: '#2c3e50' }}>Error</h1>
          </div>
          <div className="box-content">
            <p>Error loading bookings: {error.message}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="no-scroll-container">
      <div className="content-area">
        <div className="box-container" style={{
          border: user?.role === 'Admin' 
            ? '2px solid rgba(231, 76, 60, 0.6)' 
            : '2px solid rgba(52, 152, 219, 0.6)',
        }}>
          <div className="box-header">
            <h1 style={{ margin: 0, color: '#2c3e50' }}>
              {user?.role === 'Admin' ? '📊 Bookings' : '📚 Bookings'}
            </h1>
          </div>

          <div className="box-content">
            {bookings && bookings.length > 0 ? (
              <div className="scrollable-content">
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      style={{
                        padding: '1.5rem',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        background: '#f8f9fa',
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ 
                            color: '#2c3e50', 
                            margin: '0 0 0.5rem 0',
                            fontSize: '1.2rem'
                          }}>
                            {booking.session.class.name}
                          </h3>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div>
                              <strong>Date & Time:</strong>
                              <br />
                              {formatDateTime(booking.session.dateTime)}
                            </div>
                            <div>
                              <strong>Booked At:</strong>
                              <br />
                              {formatDateTime(booking.bookedAt)}
                            </div>
                            {user?.role === 'Admin' && (
                              <div>
                                <strong>User:</strong>
                                <br />
                                {booking.user.email} ({booking.user.role})
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleCancel(booking.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: '#e74c3c',
                            color: '#fff',
                            cursor: 'pointer',
                            fontWeight: 500,
                            transition: 'all 0.2s ease-in-out',
                            whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#c0392b';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#e74c3c';
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                <p>No bookings found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
