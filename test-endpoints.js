// Test script to verify API endpoints are working
const BASE_URL = 'http://localhost:5000';

async function testAPI() {
  console.log('Testing API endpoints...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    console.log('Health:', await healthResponse.json());
    
    // Test projects endpoint
    console.log('\n2. Testing projects endpoint');
    const projectsResponse = await fetch(`${BASE_URL}/api/projects`);
    const projects = await projectsResponse.json();
    console.log('Projects:', projects);
    
    if (projects.length > 0) {
      const projectId = projects[0].id;
      
      // Test single project endpoint
      console.log('\n3. Testing single project endpoint');
      const projectResponse = await fetch(`${BASE_URL}/api/projects/${projectId}`);
      const project = await projectResponse.json();
      console.log('Single project:', project);
      
      // Test characters endpoint
      console.log('\n4. Testing characters endpoint');
      const charactersResponse = await fetch(`${BASE_URL}/api/projects/${projectId}/characters`);
      const characters = await charactersResponse.json();
      console.log('Characters:', characters);
      
      // Test AI completion
      console.log('\n5. Testing AI completion');
      const aiResponse = await fetch(`${BASE_URL}/api/ai/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'キャラクターの性格を補完してください',
          type: 'character'
        })
      });
      const aiResult = await aiResponse.json();
      console.log('AI completion:', aiResult);
    }
    
    console.log('\n✅ All API tests completed successfully!');
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Run the test
testAPI();