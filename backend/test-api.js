const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const makeRequest = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('🚀 Starting API integration test suite...');
  console.log(`📡 Targeting URL: http://localhost:${PORT}/api`);
  console.log('--------------------------------------------------');

  const randomSuffix = Math.floor(Math.random() * 100000);
  const testEmail = `merchant-${randomSuffix}@test.com`;
  const customerEmail = `buyer-${randomSuffix}@test.com`;
  const storeName = `Aura Store ${randomSuffix}`;

  let vendorToken = null;
  let customerToken = null;
  let storeId = null;
  let productId = null;
  let orderId = null;
  let paymentIntentId = null;

  try {
    // 1. Check API Health
    console.log('👉 [Test 1] Verifying System Health API...');
    const health = await makeRequest('GET', '/health');
    console.log(`   Health check returned status: ${health.status} (${health.body?.message || 'OK'})`);

    if (health.status !== 200) {
      throw new Error('API server is offline. Please make sure the Express server is running first!');
    }

    // 2. Register Vendor (Creates Store in Pending)
    console.log('\n👉 [Test 2] Registering merchant account with store config...');
    const registerVendor = await makeRequest('POST', '/auth/register', {
      name: 'Aura Merchant',
      email: testEmail,
      password: 'password123',
      role: 'vendor',
      storeName,
      storeDescription: 'High-end aura retail products',
    });

    if (registerVendor.status === 201) {
      console.log(`   SUCCESS: Merchant created. Role: ${registerVendor.body.user.role}`);
      vendorToken = registerVendor.body.token;
      storeId = registerVendor.body.user.store;
      console.log(`   Tenant store ID generated: ${storeId}`);
    } else {
      console.error('   FAIL:', registerVendor.body);
      throw new Error('Merchant registration failed');
    }

    // 3. Register Customer
    console.log('\n👉 [Test 3] Registering customer buyer account...');
    const registerCustomer = await makeRequest('POST', '/auth/register', {
      name: 'Jane Buyer',
      email: customerEmail,
      password: 'password123',
      role: 'customer',
    });

    if (registerCustomer.status === 201) {
      console.log(`   SUCCESS: Customer registered. JWT assigned.`);
      customerToken = registerCustomer.body.token;
    } else {
      console.error('   FAIL:', registerCustomer.body);
      throw new Error('Customer registration failed');
    }

    // 4. Retrieve Profile Info
    console.log('\n👉 [Test 4] Authenticating JWT access validation via Profile (/auth/me)...');
    const profile = await makeRequest('GET', '/auth/me', null, vendorToken);
    if (profile.status === 200) {
      console.log(`   SUCCESS: User verified: ${profile.body.user.name} | Store Name: ${profile.body.user.storeInfo?.name}`);
    } else {
      console.error('   FAIL:', profile.body);
      throw new Error('Profile validation failed');
    }

    // 5. Simulate Super Admin Approval (Workaround using database updates via API since we don't have an admin token, or let's create an admin account, or we can mock/admin override)
    // For local verification, let's create a Super Admin account to test approval flow!
    console.log('\n👉 [Test 5] Bootstrapping Admin account & approving merchant storefront...');
    const adminEmail = `admin-${Math.floor(Math.random() * 10000)}@test.com`;
    const registerAdmin = await makeRequest('POST', '/auth/register', {
      name: 'Super Admin',
      email: adminEmail,
      password: 'password123',
      role: 'admin',
    });
    
    if (registerAdmin.status === 201) {
      const adminToken = registerAdmin.body.token;
      console.log('   Admin registered. Triggering store storefront activation...');
      
      const approve = await makeRequest('PUT', `/admin/stores/${storeId}/approve`, null, adminToken);
      if (approve.status === 200) {
        console.log(`   SUCCESS: Storefront status activated to: ${approve.body.data.status}`);
      } else {
        console.error('   Approval failed:', approve.body);
        throw new Error('Store approval failed');
      }
    } else {
      console.error('   Admin creation failed:', registerAdmin.body);
      throw new Error('Admin setup failed');
    }

    // 6. Create Product
    console.log('\n👉 [Test 6] Creating new product listing...');
    const createProduct = await makeRequest('POST', '/products', {
      name: 'Quantum Sneakers',
      description: 'Futuristic performance footwear with hover cushion soles.',
      price: 120.00,
      compareAtPrice: 150.00,
      inventory: 15,
      category: 'Footwear',
      variants: [
        { name: 'Size', values: ['8', '9', '10'] },
        { name: 'Color', values: ['Neon Black', 'Glow Pink'] },
      ],
    }, vendorToken);

    if (createProduct.status === 201) {
      productId = createProduct.body.data._id;
      console.log(`   SUCCESS: Product listed. ID: ${productId} | Price: $${createProduct.body.data.price}`);
    } else {
      console.error('   FAIL:', createProduct.body);
      throw new Error('Product creation failed');
    }

    // 7. Search storefront catalog
    console.log('\n👉 [Test 7] Querying storefront catalog with filters (Category = Footwear)...');
    const catalog = await makeRequest('GET', `/products/store/${storeId}?category=Footwear`);
    if (catalog.status === 200 && catalog.body.data.length > 0) {
      console.log(`   SUCCESS: Catalog products found: ${catalog.body.data.length} | Items matching: ${catalog.body.data[0].name}`);
    } else {
      console.error('   FAIL:', catalog.body);
      throw new Error('Catalog retrieval failed');
    }

    // 8. Place Checkout Order
    console.log('\n👉 [Test 8] Generating checkout order (triggers Stripe Intent)...');
    const order = await makeRequest('POST', '/orders', {
      storeId: storeId,
      customerInfo: {
        name: 'Jane Buyer',
        email: customerEmail,
        shippingAddress: '123 Cyberpunk Blvd, Apt 404, Megacity NY',
      },
      items: [
        {
          product: productId,
          quantity: 2,
          variant: 'Size: 9, Color: Neon Black',
        },
      ],
    }, customerToken);

    if (order.status === 201) {
      orderId = order.body.orderId;
      paymentIntentId = order.body.paymentIntentId;
      console.log(`   SUCCESS: Order created: ${order.body.orderNumber} | Total: $${order.body.total}`);
      console.log(`   Payment gateway clientSecret generated. ID: ${paymentIntentId}`);
    } else {
      console.error('   FAIL:', order.body);
      throw new Error('Order creation failed');
    }

    // 9. Confirm Payment Transaction
    console.log('\n👉 [Test 9] Processing payment confirmation endpoint...');
    const confirm = await makeRequest('POST', '/orders/confirm', {
      orderId: orderId,
      paymentIntentId: paymentIntentId,
    }, customerToken);

    if (confirm.status === 200) {
      console.log(`   SUCCESS: Transaction completed. Order paymentStatus updated to: ${confirm.body.order.paymentStatus}`);
    } else {
      console.error('   FAIL:', confirm.body);
      throw new Error('Payment confirmation failed');
    }

    // 10. Check stock level deductions
    console.log('\n👉 [Test 10] Checking stock level deductions...');
    const updatedProduct = await makeRequest('GET', `/products/${productId}`);
    if (updatedProduct.status === 200) {
      console.log(`   Original stock: 15 | Updated stock: ${updatedProduct.body.data.inventory}`);
      if (updatedProduct.body.data.inventory === 13) {
        console.log('   SUCCESS: Stock deducted by 2 units correctly.');
      } else {
        throw new Error('Inventory deduction mismatch!');
      }
    } else {
      throw new Error('Failed to retrieve updated product');
    }

    console.log('\n==================================================');
    console.log('🟢 ALL API INTEGRATION TESTS PASSED SUCCESSFULLY! 🟢');
    console.log('==================================================');

  } catch (err) {
    console.log('\n==================================================');
    console.log(`🔴 TEST SUITE FAILED: ${err.message}`);
    console.log('==================================================');
  }
};

runTests();
