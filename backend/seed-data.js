require('dotenv').config();
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Store = require('./src/models/Store');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');

const randomSuffix = Math.floor(100000 + Math.random() * 900000);
const vendorTemplates = [
  {
    name: 'Nova Goods',
    storeName: `Nova Goods Hub ${randomSuffix}`,
    description: 'Premium gadgets and design goods for modern living.',
    logo: 'https://dummyimage.com/600x600/ff4d4d/ffffff&text=RED_x+Nova',
  },
  {
    name: 'Luna Studio',
    storeName: `Luna Studio Decor ${randomSuffix}`,
    description: 'Modern home decor, tabletop accents, and lifestyle pieces.',
    logo: 'https://dummyimage.com/600x600/ff6f61/ffffff&text=RED_x+Luna',
  },
  {
    name: 'Green Basket',
    storeName: `Green Basket Market ${randomSuffix}`,
    description: 'Farm-fresh groceries, pantry essentials, and eco-friendly staples.',
    logo: 'https://dummyimage.com/600x600/fc5c65/ffffff&text=RED_x+Basket',
  },
  {
    name: 'Pixel Pantry',
    storeName: `Pixel Pantry Shop ${randomSuffix}`,
    description: 'Daily essentials and snack collections for busy shoppers.',
    logo: 'https://dummyimage.com/600x600/ff7f50/ffffff&text=RED_x+Pantry',
  },
  {
    name: 'Echo Essentials',
    storeName: `Echo Essentials Store ${randomSuffix}`,
    description: 'Everyday essentials, tech accessories, and gift-ready items.',
    logo: 'https://dummyimage.com/600x600/ff3f6f/ffffff&text=RED_x+Echo',
  },
  {
    name: 'Crimson Curations',
    storeName: `Crimson Curations ${randomSuffix}`,
    description: 'Designer fashion pieces and curated seasonal collections.',
    logo: 'https://dummyimage.com/600x600/ff2f3f/ffffff&text=RED_x+Crimson',
  },
  {
    name: 'Ruby Runners',
    storeName: `Ruby Runners Shop ${randomSuffix}`,
    description: 'High-performance activewear and running gear with bold finishes.',
    logo: 'https://dummyimage.com/600x600/ff5a6f/ffffff&text=RED_x+Ruby',
  },
  {
    name: 'Velvet Vantage',
    storeName: `Velvet Vantage ${randomSuffix}`,
    description: 'Luxury lifestyle goods, home accents, and premium gifting.',
    logo: 'https://dummyimage.com/600x600/ff6675/ffffff&text=RED_x+Velvet',
  },
  {
    name: 'Scarlet Station',
    storeName: `Scarlet Station ${randomSuffix}`,
    description: 'Urban tech accessories, travel essentials, and everyday carry.',
    logo: 'https://dummyimage.com/600x600/ff3b44/ffffff&text=RED_x+Scarlet',
  },
];

const adminTemplates = [
  { name: 'Super Admin One', emailPrefix: 'admin-one' },
  { name: 'Super Admin Two', emailPrefix: 'admin-two' },
  { name: 'Super Admin Three', emailPrefix: 'admin-three' },
];

const customerTemplates = [
  { name: 'Alice Shopper', emailPrefix: 'customer-alice' },
  { name: 'Bob Buyer', emailPrefix: 'customer-bob' },
  { name: 'Cathy Cart', emailPrefix: 'customer-cathy' },
  { name: 'Derek Deals', emailPrefix: 'customer-derek' },
  { name: 'Emma Essentials', emailPrefix: 'customer-emma' },
  { name: 'Fiona Finds', emailPrefix: 'customer-fiona' },
];

const productSamples = [
  {
    name: 'Quantum Sneakers',
    description: 'Futuristic performance footwear with hover cushion soles.',
    price: 120,
    compareAtPrice: 150,
    inventory: 20,
    category: 'Footwear',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop'],
    variants: [
      { name: 'Size', values: ['8', '9', '10'] },
      { name: 'Color', values: ['Neon Black', 'Glow Pink'] },
    ],
  },
  {
    name: 'Aurora Laptop Sleeve',
    description: 'Water-resistant laptop sleeve with premium quilted lining.',
    price: 42,
    compareAtPrice: 55,
    inventory: 35,
    category: 'Accessories',
    images: ['https://images.unsplash.com/photo-1580910051073-4c58018a1b4a?w=500&auto=format&fit=crop'],
    variants: [
      { name: 'Size', values: ['13 inch', '15 inch'] },
      { name: 'Color', values: ['Midnight Blue', 'Slate Grey'] },
    ],
  },
  {
    name: 'Mosaic Candle Set',
    description: 'Hand-poured natural soy candles with artisan scent blends.',
    price: 34,
    compareAtPrice: 44,
    inventory: 28,
    category: 'Home',
    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&auto=format&fit=crop'],
    variants: [
      { name: 'Scent', values: ['Citrus Grove', 'Vanilla Woods'] },
    ],
  },
  {
    name: 'Vivid Planner',
    description: 'Yearly productivity planner with monthly and weekly layouts.',
    price: 22,
    compareAtPrice: 28,
    inventory: 50,
    category: 'Stationery',
    images: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop'],
    variants: [
      { name: 'Cover', values: ['Matte Black', 'Soft Beige'] },
    ],
  },
  {
    name: 'Solar Backpack',
    description: 'USB-charging backpack with durable water-resistant fabric.',
    price: 79,
    compareAtPrice: 99,
    inventory: 18,
    category: 'Travel',
    images: ['https://images.unsplash.com/photo-1516116216624-53e697fedbe0?w=500&auto=format&fit=crop'],
    variants: [
      { name: 'Color', values: ['Forest Green', 'Charcoal'] },
    ],
  },
  {
    name: 'Bloom Tea Collection',
    description: 'Curated tea gift set with floral and herbal blends.',
    price: 29,
    compareAtPrice: 39,
    inventory: 40,
    category: 'Gifts',
    images: ['https://images.unsplash.com/photo-1510627498534-cf7e9002facc?w=500&auto=format&fit=crop'],
    variants: [
      { name: 'Box', values: ['Classic', 'Deluxe'] },
    ],
  },
  {
    name: 'Cobalt Wireless Charger',
    description: 'Fast wireless charging pad with anti-slip silicone finish.',
    price: 26,
    compareAtPrice: 35,
    inventory: 60,
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1510552776732-41a65d80b5b6?w=500&auto=format&fit=crop'],
    variants: [
      { name: 'Color', values: ['Stone', 'Ivory'] },
    ],
  },
  {
    name: 'Horizon Desk Lamp',
    description: 'Minimalist LED desk lamp with adjustable warm light.',
    price: 48,
    compareAtPrice: 62,
    inventory: 22,
    category: 'Home',
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&auto=format&fit=crop'],
    variants: [
      { name: 'Finish', values: ['Matte White', 'Satin Black'] },
    ],
  },
  {
    name: 'Canvas Travel Tote',
    description: 'Durable canvas tote for weekend essentials and work carry.',
    price: 34,
    compareAtPrice: 45,
    inventory: 30,
    category: 'Bags',
    images: ['https://images.unsplash.com/photo-1495121605193-b116b5b9c5d4?w=500&auto=format&fit=crop'],
    variants: [
      { name: 'Color', values: ['Sand', 'Navy'] },
    ],
  },
  {
    name: 'Zen Garden Kit',
    description: 'Desktop zen garden with sand, stones, and calming accessories.',
    price: 19,
    compareAtPrice: 24,
    inventory: 35,
    category: 'Gifts',
    images: ['https://images.unsplash.com/photo-1494526585095-c41746248156?w=500&auto=format&fit=crop'],
    variants: [
      { name: 'Style', values: ['Classic', 'Modern'] },
    ],
  },
  {
    name: 'Nomad Coffee Grinder',
    description: 'Compact manual coffee grinder for the brewed-on-the-go lifestyle.',
    price: 65,
    compareAtPrice: 84,
    inventory: 15,
    category: 'Kitchen',
    images: ['https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500&auto=format&fit=crop'],
    variants: [
      { name: 'Finish', values: ['Black', 'Silver'] },
    ],
  },
  {
    name: 'Peak Performance Hoodie',
    description: 'Soft fleece hoodie designed for comfort and active days.',
    price: 55,
    compareAtPrice: 70,
    inventory: 25,
    category: 'Apparel',
    images: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=500&auto=format&fit=crop'],
    variants: [
      { name: 'Size', values: ['S', 'M', 'L'] },
      { name: 'Color', values: ['Heather Grey', 'Ocean Blue'] },
    ],
  },
  {
    name: 'Canvas Storage Bins',
    description: 'Set of canvas storage bins for closet, shelf, and desk organization.',
    price: 30,
    compareAtPrice: 40,
    inventory: 36,
    category: 'Home',
    images: ['https://images.unsplash.com/photo-1598300055923-dce25b5e4922?w=500&auto=format&fit=crop'],
    variants: [
      { name: 'Size', values: ['Small', 'Medium', 'Large'] },
    ],
  },
  {
    name: 'Luminous Sleep Mask',
    description: 'Soft contoured sleep mask with an adjustable strap and cooling gel pads.',
    price: 18,
    compareAtPrice: 24,
    inventory: 48,
    category: 'Wellness',
    images: ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&auto=format&fit=crop'],
    variants: [
      { name: 'Style', values: ['Classic', 'Deluxe'] },
    ],
  },
  {
    name: 'Evergreen Herb Kit',
    description: 'Indoor herb gardening kit with seeds, soil pods, and planter.',
    price: 38,
    compareAtPrice: 48,
    inventory: 20,
    category: 'Garden',
    images: ['https://images.unsplash.com/photo-1524594154900-c0f0e0a2f7d5?w=500&auto=format&fit=crop'],
    variants: [
      { name: 'Kit', values: ['Classic', 'Premium'] },
    ],
  },
  {
    name: 'Sonic Bluetooth Earbuds',
    description: 'Wireless noise-isolating earbuds with long battery life and charging case.',
    price: 89,
    compareAtPrice: 109,
    inventory: 42,
    category: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517430816045-df4b7de164d7?w=500&auto=format&fit=crop',
    ],
    variants: [
      { name: 'Color', values: ['Black', 'Pearl'] },
    ],
  },
  {
    name: 'Marble Serving Tray',
    description: 'Elegant marble serving tray perfect for coffee tables or breakfast in bed.',
    price: 52,
    compareAtPrice: 69,
    inventory: 30,
    category: 'Home',
    images: [
      'https://images.unsplash.com/photo-1496412705862-e0088f16f791?w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&auto=format&fit=crop',
    ],
    variants: [
      { name: 'Style', values: ['Matte', 'Gloss'] },
    ],
  },
  {
    name: 'Urban Cycle Water Bottle',
    description: 'Leakproof stainless steel bottle with double-wall insulation for commuters.',
    price: 26,
    compareAtPrice: 35,
    inventory: 55,
    category: 'Travel',
    images: [
      'https://images.unsplash.com/photo-1529440124557-f2972008c2f7?w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517002168037-8e7c6d7b96d6?w=500&auto=format&fit=crop',
    ],
    variants: [
      { name: 'Color', values: ['Slate', 'Lime', 'Ocean'] },
    ],
  },
  {
    name: 'Neon Sketch Journal',
    description: 'Hardcover sketch journal with thick art paper for drawing and note taking.',
    price: 24,
    compareAtPrice: 32,
    inventory: 48,
    category: 'Stationery',
    images: [
      'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop',
    ],
    variants: [
      { name: 'Cover', values: ['Neon Pink', 'Midnight'] },
    ],
  },
  {
    name: 'Serene Aromatherapy Diffuser',
    description: 'USB-powered diffuser with LED mood lighting and natural essential oil blends.',
    price: 39,
    compareAtPrice: 49,
    inventory: 29,
    category: 'Wellness',
    images: [
      'https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590221942886-2b49da3f753c?w=500&auto=format&fit=crop',
    ],
    variants: [
      { name: 'Mode', values: ['Continuous', 'Intermittent'] },
    ],
  },
  {
    name: 'Polar Fleece Throw',
    description: 'Soft fleece throw blanket for cozy evenings and couch lounging.',
    price: 34,
    compareAtPrice: 42,
    inventory: 40,
    category: 'Home',
    images: [
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=500&auto=format&fit=crop',
    ],
    variants: [
      { name: 'Color', values: ['Cream', 'Charcoal'] },
    ],
  },
  {
    name: 'Crafted Cheese Board',
    description: 'Handmade wooden cheese board with serving utensils and groove details.',
    price: 44,
    compareAtPrice: 58,
    inventory: 26,
    category: 'Kitchen',
    images: [
      'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518552929256-1e8913eeaf15?w=500&auto=format&fit=crop',
    ],
    variants: [
      { name: 'Finish', values: ['Natural', 'Dark'] },
    ],
  },
  {
    name: 'Echo Voice Smart Speaker',
    description: 'Voice-enabled smart speaker with clear audio and hands-free controls.',
    price: 69,
    compareAtPrice: 85,
    inventory: 33,
    category: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1518449039515-0f883c7cb8c4?w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518552929256-1e8913eeaf15?w=500&auto=format&fit=crop',
    ],
    variants: [
      { name: 'Color', values: ['Chrome', 'Midnight'] },
    ],
  },
  {
    name: 'Terrain Running Socks',
    description: 'Breathable cushioned socks built for trail running and active movement.',
    price: 16,
    compareAtPrice: 22,
    inventory: 65,
    category: 'Apparel',
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=500&auto=format&fit=crop',
    ],
    variants: [
      { name: 'Size', values: ['S', 'M', 'L'] },
    ],
  },
  {
    name: 'Solar Picnic Lantern',
    description: 'Collapsible solar lantern with warm light and long runtime for outdoor evenings.',
    price: 29,
    compareAtPrice: 38,
    inventory: 44,
    category: 'Outdoor',
    images: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=500&auto=format&fit=crop',
    ],
    variants: [
      { name: 'Mode', values: ['Low', 'High'] },
    ],
  },
]; 

const getProductImageSet = (baseImages, productIndex) => {
  return baseImages.map((img) => {
    if (img.includes('unsplash.com')) {
      return `${img}&w=700&auto=format&fit=crop&sat=80&sig=${productIndex}`;
    }
    return img;
  });
};

const createStoreProducts = (store, count = 100) => {
  const result = [];
  for (let index = 0; index < count; index += 1) {
    const base = productSamples[index % productSamples.length];
    const batch = Math.floor(index / productSamples.length) + 1;
    const suffix = batch === 1 ? '' : ` Series ${batch}`;
    const productName = `${base.name}${suffix} #${index + 1}`;
    const price = Math.max(9, Math.round(base.price * (0.85 + Math.random() * 0.3)));
    const compareAtPrice = Math.max(price + 10, Math.round(base.compareAtPrice * (0.9 + Math.random() * 0.25)));
    const inventory = Math.max(0, Math.floor(base.inventory * (0.6 + Math.random() * 1.2)));
    const images = getProductImageSet(base.images, index + 1);
    const description = `${base.description} ${batch > 1 ? `Edition ${batch} adds refreshed RED_x styling and premium accessories.` : ''}`.trim();

    result.push({
      ...base,
      name: productName,
      description,
      price,
      compareAtPrice,
      inventory,
      images,
      store: store._id,
    });
  }
  return result;
};

const randomEmail = (prefix) => `${prefix}-${randomSuffix}@example.com`;
const randomCustomerInfo = (name, email) => ({
  name,
  email,
  shippingAddress: `${Math.floor(100 + Math.random() * 900)} Market Street, Suite ${Math.floor(100 + Math.random() * 900)}`,
});

const seed = async () => {
  await connectDB();

  console.log('\n=== Seeding new sample data for the SaaS e-commerce app ===\n');

  const createdAdmins = [];
  for (const admin of adminTemplates) {
    const email = randomEmail(admin.emailPrefix);
    const user = new User({ name: admin.name, email, password: 'AdminPass123', role: 'admin' });
    await user.save();
    createdAdmins.push(user);
    console.log(`Created admin: ${user.email}`);
  }

  const createdVendors = [];
  const createdStores = [];
  for (const vendorTemplate of vendorTemplates) {
    const email = randomEmail(vendorTemplate.name.toLowerCase().replace(/\s+/g, '-'));
    const vendor = new User({
      name: vendorTemplate.name,
      email,
      password: 'VendorPass123',
      role: 'vendor',
    });
    await vendor.save();

    const store = new Store({
      name: vendorTemplate.storeName,
      description: vendorTemplate.description,
      logo: vendorTemplate.logo || '',
      vendor: vendor._id,
      status: 'approved',
    });
    await store.save();

    vendor.store = store._id;
    await vendor.save();

    createdVendors.push(vendor);
    createdStores.push(store);
    console.log(`Created vendor/store: ${vendor.email} -> ${store.slug}`);
  }

  const createdCustomers = [];
  for (const customerTemplate of customerTemplates) {
    const email = randomEmail(customerTemplate.emailPrefix);
    const customer = new User({
      name: customerTemplate.name,
      email,
      password: 'CustomerPass123',
      role: 'customer',
    });
    await customer.save();
    createdCustomers.push(customer);
    console.log(`Created customer: ${customer.email}`);
  }

  const createdProducts = [];
  for (const store of createdStores) {
    const storeProducts = createStoreProducts(store, 100);
    for (const productTemplate of storeProducts) {
      const product = new Product({
        ...productTemplate,
      });
      await product.save();
      createdProducts.push(product);
      console.log(`Created product: ${product.name} for store ${store.slug}`);
    }
  }

  const orderStatusOptions = [
    { status: 'paid', paymentStatus: 'paid' },
    { status: 'processing', paymentStatus: 'paid' },
    { status: 'shipped', paymentStatus: 'paid' },
    { status: 'delivered', paymentStatus: 'paid' },
    { status: 'cancelled', paymentStatus: 'refunded' },
  ];

  const createdOrders = [];
  for (const customer of createdCustomers) {
    const numberOfOrders = 2;
    for (let orderIndex = 0; orderIndex < numberOfOrders; orderIndex += 1) {
      const orderProducts = createdProducts.sort(() => 0.5 - Math.random()).slice(0, 2);
      const store = await Store.findById(orderProducts[0].store);
      const items = orderProducts.map((product) => ({
        product: product._id,
        name: product.name,
        quantity: Math.floor(1 + Math.random() * 3),
        price: product.price,
        variant: product.variants && product.variants.length > 0
          ? `${product.variants[0].name}: ${product.variants[0].values[0]}`
          : '',
      }));
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const orderStatus = orderStatusOptions[Math.floor(Math.random() * orderStatusOptions.length)];

      const order = new Order({
        customer: customer._id,
        customerInfo: randomCustomerInfo(customer.name, customer.email),
        store: store._id,
        items,
        total,
        status: orderStatus.status,
        paymentStatus: orderStatus.paymentStatus,
        paymentIntentId: `pi_seed_${randomSuffix}_${Math.floor(Math.random() * 10000)}`,
      });
      await order.save();
      createdOrders.push(order);
      console.log(`Created ${order.status} order ${order.orderNumber} for customer ${customer.email}`);
    }
  }

  const guestOrderCount = 3;
  for (let guestIndex = 1; guestIndex <= guestOrderCount; guestIndex += 1) {
    const orderProducts = createdProducts.sort(() => 0.5 - Math.random()).slice(0, 2);
    const store = await Store.findById(orderProducts[0].store);
    const items = orderProducts.map((product) => ({
      product: product._id,
      name: product.name,
      quantity: Math.floor(1 + Math.random() * 3),
      price: product.price,
      variant: product.variants && product.variants.length > 0
        ? `${product.variants[0].name}: ${product.variants[0].values[0]}`
        : '',
    }));
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderStatus = orderStatusOptions[Math.floor(Math.random() * orderStatusOptions.length)];

    const order = new Order({
      customer: null,
      customerInfo: {
        name: `Guest Shopper ${guestIndex}`,
        email: `guest-${guestIndex}-${randomSuffix}@example.com`,
        shippingAddress: `${Math.floor(100 + Math.random() * 900)} Oak Avenue, Apt ${Math.floor(1 + Math.random() * 99)}`,
      },
      store: store._id,
      items,
      total,
      status: orderStatus.status,
      paymentStatus: orderStatus.paymentStatus,
      paymentIntentId: `pi_seed_guest_${randomSuffix}_${guestIndex}`,
    });
    await order.save();
    createdOrders.push(order);
    console.log(`Created ${order.status} guest order ${order.orderNumber}`);
  }

  console.log('\n=== Seed complete ===');
  console.log(`Admins created: ${createdAdmins.length}`);
  console.log(`Vendors created: ${createdVendors.length}`);
  console.log(`Stores created: ${createdStores.length}`);
  console.log(`Customers created: ${createdCustomers.length}`);
  console.log(`Products created: ${createdProducts.length}`);
  console.log(`Orders created: ${createdOrders.length}\n`);

  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
