const base = 'http://localhost:5000/api';

(async () => {
  try {
    const storesRes = await fetch(`${base}/stores`);
    const stores = await storesRes.json();
    console.log('storesStatus', storesRes.status);
    console.log('storesCount', (stores.data || stores).length);
    if ((stores.data || stores).length === 0) return;
    const store = (stores.data || stores)[0];
    console.log('firstStore', { _id: store._id, name: store.name, slug: store.slug, status: store.status });

    const productsRes = await fetch(`${base}/products/store/${store.slug}`);
    const products = await productsRes.json();
    console.log('productsStatus', productsRes.status);
    console.log('productsCount', (products.data || products).length);
    if ((products.data || products).length === 0) return;

    const product = (products.data || products)[0];
    console.log('firstProduct', {
      _id: product._id,
      name: product.name,
      price: product.price,
      inventory: product.inventory,
      category: product.category,
      variants: product.variants,
      images: product.images,
    });

    const detailRes = await fetch(`${base}/products/${product._id}`);
    const detail = await detailRes.json();
    console.log('detailStatus', detailRes.status);
    console.log('detailData', detail.data ? detail.data : detail.message);
  } catch (e) {
    console.error('ERROR', e);
  }
})();
