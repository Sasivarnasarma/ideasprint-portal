import AdminsTable from '../components/AdminsTable';

const AdminsPage = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: 'white', margin: 0 }}>Portal Administrators</h2>
      </div>

      <AdminsTable />
    </div>
  );
};

export default AdminsPage;
