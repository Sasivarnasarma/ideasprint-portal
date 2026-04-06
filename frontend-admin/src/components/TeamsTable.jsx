import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminDashboardAPI } from '../api/admin';
import TableSkeleton from './TableSkeleton';

const TeamsTable = () => {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await adminDashboardAPI.getTeams();
        setTeams(data);
      } catch (err) {
        setError('Failed to load teams data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeams();
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedTeams = useMemo(() => {
    let result = [...teams];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (team) =>
          team.name.toLowerCase().includes(lowerQuery) ||
          team.id.toString().toLowerCase().includes(lowerQuery) ||
          (team.leader_name && team.leader_name.toLowerCase().includes(lowerQuery)),
      );
    }

    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return result;
  }, [teams, searchQuery, sortConfig]);

  const renderSortableHeader = (label, key) => (
    <th
      style={{ padding: '1rem', cursor: 'pointer', userSelect: 'none', transition: 'color 0.2s' }}
      onClick={() => handleSort(key)}
      title={`Sort by ${label}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        {label}
        <span style={{ fontSize: '0.8rem', color: sortConfig.key === key ? 'var(--color-accent)' : 'transparent' }}>
          {sortConfig.key === key && sortConfig.direction === 'desc' ? '▼' : '▲'}
        </span>
      </div>
    </th>
  );

  if (isLoading) return <TableSkeleton columns={7} />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div style={{ marginTop: '2rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ flex: '1', minWidth: '250px' }}>
          <input
            type="text"
            placeholder="Search by ID, Team Name, or Leader..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              backgroundColor: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
            }}
          />
        </div>
      </div>
      <div
        className="responsive-table"
        style={{ overflowX: 'auto', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '1rem' }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', textAlign: 'center' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-accent)' }}>
              {renderSortableHeader('ID', 'id')}
              {renderSortableHeader('Team Name', 'name')}
              {renderSortableHeader('Level', 'level')}
              <th style={{ padding: '1rem' }}>Leader</th>
              <th style={{ padding: '1rem' }}>Members</th>
              <th style={{ padding: '1rem' }}>Proposal Status</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTeams.map((team) => (
              <tr
                key={team.id}
                style={{ borderBottom: '1px solid #333', cursor: 'pointer', transition: 'background 0.2s' }}
              >
                <td data-label="ID" style={{ padding: '1rem' }}>
                  {team.id}
                </td>
                <td data-label="Team Name" style={{ padding: '1rem' }}>
                  {team.name}
                </td>
                <td data-label="Level" style={{ padding: '1rem' }}>
                  {team.level}
                </td>
                <td data-label="Leader" style={{ padding: '1rem' }}>
                  {team.leader_name || 'N/A'}
                </td>
                <td data-label="Members" style={{ padding: '1rem' }}>
                  {team.member_count}
                </td>
                <td data-label="Proposal Status" style={{ padding: '1rem' }}>
                  {team.youtube_link && team.pdf_link ? (
                    <span style={{ color: '#00ff88' }}>Submitted</span>
                  ) : (
                    <span style={{ color: '#aaa' }}>Pending</span>
                  )}
                </td>
                <td data-label="Actions" style={{ padding: '1rem' }}>
                  <button
                    onClick={() => navigate(`/teams/${team.id}`)}
                    className="btn-primary"
                    style={{ padding: '0.3rem 0.8rem', fontSize: '0.9rem' }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
            {filteredAndSortedTeams.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>
                  {teams.length === 0 ? 'No teams registered yet.' : 'No matching teams found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamsTable;
