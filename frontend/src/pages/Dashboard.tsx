import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSessions, bookSession } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/dateUtils';
import type { Session } from '../types/index';

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: sessions, isLoading, error } = useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: getSessions,
  });

  const { mutate: book } = useMutation({
    mutationFn: (sessionId: string) => bookSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const handleBook = (sessionId: string) => {
    book(sessionId);
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
            <p>Error loading sessions: {error.message}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="no-scroll-container">
      <div className="content-area">
        <div className="box-container">
          <div className="box-header">
            <h1 style={{ margin: 0, color: '#2c3e50' }}>
              {user?.role === 'Admin' ? 'Hello Admin' : 'Upcoming Sessions'}
            </h1>
          </div>
          
          <div className="box-content">
            {sessions && sessions.length > 0 ? (
              <div className="dashboard-row">
                {sessions.map((session) => (
                  <div key={session.id} className="dashboard-item">
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>
                      {session.class.name}
                    </h3>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                      {formatDateTime(session.dateTime)}
                    </p>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
                      Capacity: {session.bookedSeats}/{session.capacity}
                    </p>
                    {user?.role !== 'Admin' && (
                      <button
                        onClick={() => handleBook(session.id)}
                        disabled={session.bookedSeats >= session.capacity}
                        style={{
                          width: '100%',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: session.bookedSeats >= session.capacity ? 'not-allowed' : 'pointer',
                          background: session.bookedSeats >= session.capacity ? '#ccc' : '#e74c3c',
                          color: '#fff',
                          fontWeight: 500,
                          transition: 'all 0.2s ease-in-out',
                        }}
                        onMouseEnter={(e) => {
                          if (!(session.bookedSeats >= session.capacity)) {
                            e.currentTarget.style.background = '#c0392b';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!(session.bookedSeats >= session.capacity)) {
                            e.currentTarget.style.background = '#e74c3c';
                          }
                        }}
                      >
                        {session.bookedSeats >= session.capacity ? 'Full' : 'Book'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                <p>No upcoming sessions available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
