const fs = require('fs');
const path = require('path');

/**
 * Simple test generator that creates basic test files for all entities
 */
const generateSimpleTests = () => {
  console.log('🚀 Starting simple test generation...');

  // List of entities found in the project
  const entities = [
    'apartment',
    'apartmentbuyer',
    'apartmentvip',
    'client',
    'clientuniversal',
    'commercial',
    'commercialbuyer',
    'commercialvip',
    'customer',
    'employee',
    'investor',
    'investorvip',
    'invoice',
    'jointventure',
    'land',
    'landbuyer',
    'landvip',
    'lead',
    'payment',
    'paymentmode',
    'project',
    'property',
    'quote',
    'shop',
    'shopbuyer',
    'shopvip',
    'supplier',
    'task',
    'taxes',
    'visit',
  ];

  console.log(`📋 Found ${entities.length} entities:`, entities.join(', '));

  let generatedCount = 0;

  // Generate basic test files for each entity
  for (const entity of entities) {
    try {
      const testFileName = `${entity}.test.js`;
      const testFilePath = path.join(__dirname, testFileName);

      const testContent = `const request = require('supertest');
const app = require('../../app');
const { generateAuthToken, getAuthHeaders, testEndpoint } = require('./testUtils');

describe('${entity.charAt(0).toUpperCase() + entity.slice(1)} API', () => {
  let authToken;
  let authHeaders;

  beforeAll(async () => {
    try {
      authToken = await generateAuthToken();
      authHeaders = await getAuthHeaders();
    } catch (error) {
      console.error('Error setting up auth for ${entity} tests:', error.message);
    }
  });

  describe('POST /${entity}/create', () => {
    it('should create a new ${entity}', async () => {
      const testCases = [
        {
          name: 'Valid ${entity} creation',
          expectedStatus: 201,
          headers: authHeaders,
          body: {
            name: 'Test ${entity}',
            description: 'Test ${entity} description'
          }
        },
        {
          name: 'Validation error - missing required fields',
          expectedStatus: 400,
          headers: authHeaders,
          body: {}
        },
        {
          name: 'Unauthorized access',
          expectedStatus: 401,
          headers: { 'Content-Type': 'application/json' },
          body: {
            name: 'Test ${entity}',
            description: 'Test ${entity} description'
          }
        }
      ];

      const results = await testEndpoint(app, 'POST', '/${entity}/create', testCases);

      results.forEach(result => {
        expect(result.passed).toBe(true);
      });
    });
  });

  describe('GET /${entity}/read/:id', () => {
    it('should read a ${entity} by id', async () => {
      const testCases = [
        {
          name: 'Valid ${entity} read',
          expectedStatus: 200,
          headers: authHeaders
        },
        {
          name: 'Not found - invalid id',
          expectedStatus: 404,
          headers: authHeaders
        },
        {
          name: 'Unauthorized access',
          expectedStatus: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      ];

      const results = await testEndpoint(app, 'GET', '/${entity}/read/507f1f77bcf86cd799439011', testCases);

      results.forEach(result => {
        expect(result.passed).toBe(true);
      });
    });
  });

  describe('GET /${entity}/list', () => {
    it('should list ${entity}s', async () => {
      const testCases = [
        {
          name: 'Valid list',
          expectedStatus: 200,
          headers: authHeaders
        },
        {
          name: 'Unauthorized access',
          expectedStatus: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      ];

      const results = await testEndpoint(app, 'GET', '/${entity}/list', testCases);

      results.forEach(result => {
        expect(result.passed).toBe(true);
      });
    });
  });

  describe('GET /${entity}/search', () => {
    it('should search ${entity}s', async () => {
      const testCases = [
        {
          name: 'Valid search',
          expectedStatus: 200,
          headers: authHeaders,
          query: { q: 'test' }
        },
        {
          name: 'Unauthorized access',
          expectedStatus: 401,
          headers: { 'Content-Type': 'application/json' },
          query: { q: 'test' }
        }
      ];

      const results = await testEndpoint(app, 'GET', '/${entity}/search', testCases);

      results.forEach(result => {
        expect(result.passed).toBe(true);
      });
    });
  });

  describe('GET /${entity}/summary', () => {
    it('should get ${entity} summary', async () => {
      const testCases = [
        {
          name: 'Valid summary',
          expectedStatus: 200,
          headers: authHeaders
        },
        {
          name: 'Unauthorized access',
          expectedStatus: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      ];

      const results = await testEndpoint(app, 'GET', '/${entity}/summary', testCases);

      results.forEach(result => {
        expect(result.passed).toBe(true);
      });
    });
  });

  // Special routes for specific entities
  ${
    entity === 'invoice' || entity === 'quote' || entity === 'payment'
      ? `describe('POST /${entity}/mail', () => {
      it('should send ${entity} email', async () => {
        const testCases = [
          {
            name: 'Valid email sending',
            expectedStatus: 200,
            headers: authHeaders,
            body: { id: '507f1f77bcf86cd799439011' }
          },
          {
            name: 'Not found - invalid id',
            expectedStatus: 404,
            headers: authHeaders,
            body: { id: '507f1f77bcf86cd799439011' }
          },
          {
            name: 'Unauthorized access',
            expectedStatus: 401,
            headers: { 'Content-Type': 'application/json' },
            body: { id: '507f1f77bcf86cd799439011' }
          }
        ];

        const results = await testEndpoint(app, 'POST', '/${entity}/mail', testCases);

        results.forEach(result => {
          expect(result.passed).toBe(true);
        });
      });
    });`
      : ''
  }

  ${
    entity === 'quote'
      ? `describe('GET /${entity}/convert/:id', () => {
      it('should convert quote to invoice', async () => {
        const testCases = [
          {
            name: 'Valid quote conversion',
            expectedStatus: 200,
            headers: authHeaders
          },
          {
            name: 'Not found - invalid id',
            expectedStatus: 404,
            headers: authHeaders
          },
          {
            name: 'Unauthorized access',
            expectedStatus: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        ];

        const results = await testEndpoint(app, 'GET', '/${entity}/convert/507f1f77bcf86cd799439011', testCases);

        results.forEach(result => {
          expect(result.passed).toBe(true);
        });
      });
    });`
      : ''
  }
});
`;

      fs.writeFileSync(testFilePath, testContent);
      console.log(`✅ Generated test file: ${testFileName}`);
      generatedCount++;
    } catch (error) {
      console.error(`❌ Failed to generate test for ${entity}:`, error.message);
    }
  }

  // Generate property-specific tests
  try {
    const propertyTestContent = `const request = require('supertest');
const app = require('../../app');
const { generateAuthToken, getAuthHeaders, testEndpoint } = require('./testUtils');

describe('Property API (Extended)', () => {
  let authToken;
  let authHeaders;

  beforeAll(async () => {
    try {
      authToken = await generateAuthToken();
      authHeaders = await getAuthHeaders();
    } catch (error) {
      console.error('Error setting up auth for property tests:', error.message);
    }
  });

  describe('POST /property/:id/visit', () => {
    it('should add a visit to property', async () => {
      const testCases = [
        {
          name: 'Valid visit creation',
          expectedStatus: 201,
          headers: authHeaders,
          body: {
            visitorName: 'Test Visitor',
            visitorEmail: 'visitor@test.com',
            visitDate: new Date().toISOString(),
            notes: 'Test visit notes'
          }
        },
        {
          name: 'Validation error - missing required fields',
          expectedStatus: 400,
          headers: authHeaders,
          body: {}
        },
        {
          name: 'Not found - invalid property id',
          expectedStatus: 404,
          headers: authHeaders,
          body: {
            visitorName: 'Test Visitor',
            visitorEmail: 'visitor@test.com'
          }
        },
        {
          name: 'Unauthorized access',
          expectedStatus: 401,
          headers: { 'Content-Type': 'application/json' },
          body: {
            visitorName: 'Test Visitor',
            visitorEmail: 'visitor@test.com'
          }
        }
      ];

      const results = await testEndpoint(app, 'POST', '/property/507f1f77bcf86cd799439011/visit', testCases);

      results.forEach(result => {
        expect(result.passed).toBe(true);
      });
    });
  });

  describe('GET /property/:id/visits', () => {
    it('should list property visits', async () => {
      const testCases = [
        {
          name: 'Valid visits list',
          expectedStatus: 200,
          headers: authHeaders
        },
        {
          name: 'Not found - invalid property id',
          expectedStatus: 404,
          headers: authHeaders
        },
        {
          name: 'Unauthorized access',
          expectedStatus: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      ];

      const results = await testEndpoint(app, 'GET', '/property/507f1f77bcf86cd799439011/visits', testCases);

      results.forEach(result => {
        expect(result.passed).toBe(true);
      });
    });
  });
});
`;

    const propertyTestPath = path.join(__dirname, 'property-extended.test.js');
    fs.writeFileSync(propertyTestPath, propertyTestContent);
    console.log(`✅ Generated property extended test file: property-extended.test.js`);
    generatedCount++;
  } catch (error) {
    console.error('❌ Failed to generate property tests:', error.message);
  }

  // Generate core tests
  try {
    const coreTestContent = `const request = require('supertest');
const app = require('../../app');
const { generateAuthToken, getAuthHeaders, testEndpoint } = require('./testUtils');

describe('Core API Routes', () => {
  let authToken;
  let authHeaders;

  beforeAll(async () => {
    try {
      authToken = await generateAuthToken();
      authHeaders = await getAuthHeaders();
    } catch (error) {
      console.error('Error setting up auth for core tests:', error.message);
    }
  });

  describe('POST /login', () => {
    it('should authenticate admin user', async () => {
      const testCases = [
        {
          name: 'Valid login',
          expectedStatus: 200,
          body: {
            email: 'test@test.com',
            password: 'test123'
          }
        },
        {
          name: 'Invalid credentials',
          expectedStatus: 400,
          body: {
            email: 'test@test.com',
            password: 'wrongpassword'
          }
        },
        {
          name: 'Missing credentials',
          expectedStatus: 400,
          body: {}
        }
      ];

      const results = await testEndpoint(app, 'POST', '/login', testCases);

      results.forEach(result => {
        expect(result.passed).toBe(true);
      });
    });
  });

  describe('POST /logout', () => {
    it('should logout admin user', async () => {
      const testCases = [
        {
          name: 'Valid logout',
          expectedStatus: 200,
          headers: authHeaders
        },
        {
          name: 'Unauthorized logout',
          expectedStatus: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      ];

      const results = await testEndpoint(app, 'POST', '/logout', testCases);

      results.forEach(result => {
        expect(result.passed).toBe(true);
      });
    });
  });

  describe('GET /admin/read/:id', () => {
    it('should read admin profile', async () => {
      const testCases = [
        {
          name: 'Valid admin read',
          expectedStatus: 200,
          headers: authHeaders
        },
        {
          name: 'Not found - invalid id',
          expectedStatus: 404,
          headers: authHeaders
        },
        {
          name: 'Unauthorized access',
          expectedStatus: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      ];

      const results = await testEndpoint(app, 'GET', '/admin/read/507f1f77bcf86cd799439011', testCases);

      results.forEach(result => {
        expect(result.passed).toBe(true);
      });
    });
  });

  describe('GET /setting/list', () => {
    it('should list settings', async () => {
      const testCases = [
        {
          name: 'Valid settings list',
          expectedStatus: 200,
          headers: authHeaders
        },
        {
          name: 'Unauthorized access',
          expectedStatus: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      ];

      const results = await testEndpoint(app, 'GET', '/setting/list', testCases);

      results.forEach(result => {
        expect(result.passed).toBe(true);
      });
    });
  });
});
`;

    const coreTestPath = path.join(__dirname, 'core.test.js');
    fs.writeFileSync(coreTestPath, coreTestContent);
    console.log(`✅ Generated core test file: core.test.js`);
    generatedCount++;
  } catch (error) {
    console.error('❌ Failed to generate core tests:', error.message);
  }

  console.log(`🎉 Test generation completed! Generated ${generatedCount} test files.`);
  console.log(`📂 Test files location: ${path.join(__dirname)}`);
};

// Run the generator if this file is executed directly
if (require.main === module) {
  generateSimpleTests();
}

module.exports = { generateSimpleTests };
