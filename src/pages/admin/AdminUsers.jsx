import React from 'react';
import PageShell from '../../components/common/PageShell';
import { studentMocks, educatorMocks } from '../../data/mockUsers';

const AdminUsers = () => {
  return (
    <PageShell title="Users Management">
      <div className="grid grid-2 gap-md">
        <div className="card">
          <h3 className="mb-md">Students</h3>
          <div className="flex flex-col gap-sm">
            {studentMocks.map(student => (
              <div
                key={student.id}
                className="flex flex-between flex-center"
                style={{ padding: '12px', background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-input)' }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{student.name}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>{student.email}</div>
                </div>
                <span className="badge badge-info">Student</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="mb-md">Educators</h3>
          <div className="flex flex-col gap-sm">
            {educatorMocks.map(educator => (
              <div
                key={educator.id}
                className="flex flex-between flex-center"
                style={{ padding: '12px', background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-input)' }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{educator.name}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>
                    {educator.email} • {educator.specialization}
                  </div>
                </div>
                <span className="badge badge-primary">Educator</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default AdminUsers;


