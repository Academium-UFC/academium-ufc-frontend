import { useState, useEffect } from 'react';

interface ProjectData {
  title: string;
  collaborators?: Array<{
    id: number;
    user: {
      name: string;
      email: string;
      type: string;
    };
    type: string;
  }>;
}

const TestCollaborators = () => {
  const [data, setData] = useState<ProjectData | null>(null);
  
  useEffect(() => {
    fetch('http://localhost:3000/api/v1/projects/11')
      .then(res => res.json())
      .then(project => {
        console.log('Test component - Raw data:', project);
        console.log('Test component - Collaborators:', project.collaborators);
        setData(project);
      })
      .catch(err => console.error('Test component error:', err));
  }, []);
  
  if (!data) return <div>Loading...</div>;
  
  return (
    <div style={{ padding: '20px', border: '2px solid red' }}>
      <h2>TEST COLLABORATORS COMPONENT</h2>
      <div>
        <strong>Project Title:</strong> {data.title}
      </div>
      <div>
        <strong>Collaborators exists:</strong> {data.collaborators ? 'YES' : 'NO'}
      </div>
      <div>
        <strong>Collaborators length:</strong> {data.collaborators?.length || 0}
      </div>
      <div>
        <strong>Collaborators data:</strong>
        <pre>{JSON.stringify(data.collaborators, null, 2)}</pre>
      </div>
      
      {data.collaborators && data.collaborators.length > 0 && (
        <div>
          <h3>Rendered Collaborators:</h3>
          {data.collaborators.map((collab, index) => (
            <div key={index} style={{ border: '1px solid blue', margin: '5px', padding: '10px' }}>
              {collab.user?.name} ({collab.type})
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestCollaborators;
