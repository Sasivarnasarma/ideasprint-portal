const TableSkeleton = ({ columns = 5 }) => {
  return (
    <div style={{ marginTop: '2rem' }}>
      <div
        className="responsive-table"
        style={{ overflowX: 'auto', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '1rem' }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', textAlign: 'center' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-accent)' }}>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} style={{ padding: '1rem' }}>
                  <div className="skeleton skeleton-text" style={{ width: '60%', margin: '0 auto' }}></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={rowIndex} style={{ borderBottom: '1px solid #333' }}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} style={{ padding: '1rem' }}>
                    <div
                      className="skeleton skeleton-text"
                      style={{ margin: '0 auto', width: `${Math.random() * 40 + 40}%` }}
                    ></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableSkeleton;
