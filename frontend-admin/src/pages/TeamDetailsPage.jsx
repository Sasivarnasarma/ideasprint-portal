import { useState, useEffect } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { adminDashboardAPI } from '../api/admin';
import TableSkeleton from '../components/TableSkeleton';

const TeamDetailsPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [team, setTeam] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const data = await adminDashboardAPI.getTeamDetails(id);
                setTeam(data);
            } catch (err) {
                setError('Failed to load team details.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTeam();
    }, [id]);

    if (isLoading) return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div className="skeleton skeleton-title" style={{ margin: 0 }}></div>
                <div className="skeleton" style={{ height: '40px', width: '150px', borderRadius: '30px' }}></div>
            </div>
            <div className="auth-card" style={{ padding: '2.5rem' }}>
                <div className="skeleton skeleton-title" style={{ width: '40%', marginBottom: '2rem' }}></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i}>
                            <div className="skeleton skeleton-text" style={{ width: '30%', height: '15px' }}></div>
                            <div className="skeleton skeleton-text" style={{ width: '80%', height: '20px' }}></div>
                        </div>
                    ))}
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                    <div className="skeleton skeleton-title" style={{ width: '25%', height: '24px', marginBottom: '1rem' }}></div>
                    <div className="skeleton skeleton-card" style={{ height: '200px' }}></div>
                </div>
            </div>
        </div>
    );
    if (error) return <div className="error-message">{error}</div>;
    if (!team) return <Navigate to="/teams" replace />;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ color: 'white', margin: 0 }}>Team Details</h2>
                <button onClick={() => navigate('/teams')} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>&larr; Back to Teams</button>
            </div>

            <div className="auth-card" style={{ padding: '2.5rem' }}>
                <h3 style={{ color: 'var(--color-accent)', margin: '0 0 1.5rem 0', fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {team.name}
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2.5rem', color: '#ccc' }}>
                    <div>
                        <p style={{ margin: '0 0 0.5rem 0', color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Team ID</p>
                        <p style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>{team.id}</p>
                    </div>
                    <div>
                        <p style={{ margin: '0 0 0.5rem 0', color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Level</p>
                        <p style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>{team.level}</p>
                    </div>
                    <div>
                        <p style={{ margin: '0 0 0.5rem 0', color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Leader Email</p>
                        <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-accent)' }}>
                            <a href={`mailto:${team.leader?.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{team.leader?.email || 'N/A'}</a>
                        </p>
                    </div>
                    <div>
                        <p style={{ margin: '0 0 0.5rem 0', color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Proposal Status</p>
                        <p style={{ margin: 0, fontSize: '1.1rem' }}>
                            {team.youtube_link && team.pdf_link ? <span style={{ color: '#00ff88' }}>Submitted</span> : <span style={{ color: '#aaa' }}>Pending</span>}
                        </p>
                    </div>
                    {team.youtube_link && (
                        <div>
                            <p style={{ margin: '0 0 0.5rem 0', color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>YouTube Link</p>
                            <a href={`https://www.youtube.com/watch?v=${team.youtube_link}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Watch Video</a>
                        </div>
                    )}
                    {team.pdf_link && (
                        <div>
                            <p style={{ margin: '0 0 0.5rem 0', color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>PDF Proposal</p>
                            <a href={`https://drive.google.com/file/d/${team.pdf_link}/view`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>View Document</a>
                        </div>
                    )}
                    {team.idea && (
                        <div style={{ gridColumn: '1 / -1' }}>
                            <p style={{ margin: '0 0 0.5rem 0', color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Idea Summary</p>
                            <p style={{ margin: 0, fontSize: '1rem', color: 'white', backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                {team.idea}
                            </p>
                        </div>
                    )}
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                    <h4 style={{ color: 'white', margin: '0 0 1rem 0', fontSize: '1.2rem' }}>Team Roster</h4>
                    <div className="responsive-table" style={{ overflowX: 'auto', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ccc', textAlign: 'center' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                                    <th style={{ padding: '1rem' }}>Role</th>
                                    <th style={{ padding: '1rem' }}>Name</th>
                                    <th style={{ padding: '1rem' }}>Phone</th>
                                    <th style={{ padding: '1rem' }}>IM Number</th>
                                </tr>
                            </thead>
                            <tbody>
                                {team.leader && (
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(3, 199, 179, 0.05)' }}>
                                        <td data-label="Role" style={{ padding: '1rem' }}><span style={{ backgroundColor: 'var(--color-accent)', color: 'black', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Leader</span></td>
                                        <td data-label="Name" style={{ padding: '1rem', color: 'var(--color-accent)', fontWeight: 'bold' }}>{team.leader.name}</td>
                                        <td data-label="Phone" style={{ padding: '1rem', color: 'var(--color-accent)' }}>{team.leader.phone}</td>
                                        <td data-label="IM Number" style={{ padding: '1rem', color: 'var(--color-accent)' }}>{team.leader.im_number}</td>
                                    </tr>
                                )}
                                {team.members.map(member => (
                                    <tr key={member.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td data-label="Role" style={{ padding: '1rem' }}><span style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#aaa', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Member</span></td>
                                        <td data-label="Name" style={{ padding: '1rem', color: 'white' }}>{member.name}</td>
                                        <td data-label="Phone" style={{ padding: '1rem' }}>{member.phone}</td>
                                        <td data-label="IM Number" style={{ padding: '1rem' }}>{member.im_number}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamDetailsPage;
