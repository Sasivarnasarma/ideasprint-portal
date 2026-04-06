import TeamsTable from '../components/TeamsTable';

const TeamsPage = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: 'white', margin: 0 }}>Registered Teams</h2>
      </div>

      <TeamsTable />
    </div>
  );
};

export default TeamsPage;
