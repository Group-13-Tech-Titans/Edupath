import React from 'react';
import PageShell from '../../components/common/PageShell';
import { useAuth } from '../../context/AuthContext';

const EducatorProfile = () => {
  const { currentUser } = useAuth();

  return (
    <PageShell title="My Profile">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="text-center mb-md">
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary)', margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: 'white', fontWeight: 900 }}>
            {currentUser?.name?.charAt(0) || 'E'}
          </div>
          <h2>{currentUser?.name}</h2>
          <p className="text-muted">{currentUser?.email}</p>
        </div>

        <div className="flex flex-col gap-md">
          <div>
            <label>Role</label>
            <div className="badge badge-primary mt-sm">Educator</div>
          </div>
          <div>
            <label>Specialization</label>
            <p className="mt-sm">{currentUser?.specialization || 'Not specified'}</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default EducatorProfile;


