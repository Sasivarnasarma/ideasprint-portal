import SubmissionsTable from '../components/SubmissionsTable';

const SubmissionsPage = () => {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ color: 'white', margin: 0 }}>Proposal Submissions</h2>
            </div>
            
            <SubmissionsTable />
        </div>
    );
};

export default SubmissionsPage;
