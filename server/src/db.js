import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { products as seedProducts } from "./data/products.js";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, "../db/schema.sql");

export const hasDatabaseConfig = Boolean(process.env.DATABASE_URL);

export const pool = hasDatabaseConfig
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("railway.app")
        || process.env.DATABASE_URL.includes("rlwy.net")
        ? { rejectUnauthorized: false }
        : false
    })
  : null;

function categoryIdFromName(name) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function mapRowsByProduct(rows, key, valueSelector) {
  const grouped = new Map();

  for (const row of rows) {
    if (!grouped.has(row.product_id)) {
      grouped.set(row.product_id, []);
    }
    grouped.get(row.product_id).push(valueSelector ? valueSelector(row) : row[key]);
  }

  return grouped;
}

async function loadProductRelations(productIds) {
  if (!pool || !productIds.length) {
    return {
      imagesByProduct: new Map(),
      offersByProduct: new Map(),
      highlightsByProduct: new Map(),
      specsByProduct: new Map()
    };
  }

  const imageRows = await pool.query(
    `SELECT product_id, image_url
     FROM product_images
     WHERE product_id = ANY($1::text[])
     ORDER BY sort_order ASC`,
    [productIds]
  );

  const offerRows = await pool.query(
    `SELECT product_id, offer_text
     FROM product_offers
     WHERE product_id = ANY($1::text[])
     ORDER BY sort_order ASC`,
    [productIds]
  );

  const highlightRows = await pool.query(
    `SELECT product_id, highlight_text
     FROM product_highlights
     WHERE product_id = ANY($1::text[])
     ORDER BY sort_order ASC`,
    [productIds]
  );

  const specRows = await pool.query(
    `SELECT product_id, label, value
     FROM product_specifications
     WHERE product_id = ANY($1::text[])`,
    [productIds]
  );

  const imagesByProduct = mapRowsByProduct(imageRows.rows, "image_url");
  const offersByProduct = mapRowsByProduct(offerRows.rows, "offer_text");
  const highlightsByProduct = mapRowsByProduct(highlightRows.rows, "highlight_text");

  const specsByProduct = new Map();
  for (const row of specRows.rows) {
    if (!specsByProduct.has(row.product_id)) {
      specsByProduct.set(row.product_id, {});
    }
    specsByProduct.get(row.product_id)[row.label] = row.value;
  }

  return {
    imagesByProduct,
    offersByProduct,
    highlightsByProduct,
    specsByProduct
  };
}

function normalizeProducts(baseRows, relations) {
  return baseRows.map((row) => ({
    id: row.id,
    brand: row.brand,
    title: row.title,
    category: row.category_name,
    rating: String(row.rating),
    reviews: row.reviews_summary,
    assured: row.assured_badge,
    seller: row.seller_name,
    price: {
      current: Number(row.current_price),
      original: Number(row.original_price)
    },
    delivery: row.delivery_text,
    inStock: row.in_stock,
    images: relations.imagesByProduct.get(row.id) ?? [],
    offers: relations.offersByProduct.get(row.id) ?? [],
    highlights: relations.highlightsByProduct.get(row.id) ?? [],
    description: row.description,
    specifications: relations.specsByProduct.get(row.id) ?? {}
  }));
}

export async function initializeDatabase() {
  if (!pool) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const schemaSql = await fs.readFile(schemaPath, "utf8");
  const statements = schemaSql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await pool.query(statement);
  }

  await seedDatabase();
}

async function seedDatabase() {
  const countResult = await pool.query("SELECT COUNT(*)::int AS count FROM products");
  if (countResult.rows[0].count > 0) {
    return;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO users (id, full_name, email, phone)
       VALUES ('default-user', 'Default User', 'demo@flipkartclone.local', '9999999999')
       ON CONFLICT (id) DO NOTHING`
    );

    const categories = [...new Set(seedProducts.map((product) => product.category))];
    for (const category of categories) {
      const categoryId = categoryIdFromName(category);
      await client.query(
        `INSERT INTO categories (id, name, slug)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug`,
        [categoryId, category, categoryId]
      );
    }

    for (const product of seedProducts) {
      await client.query(
        `INSERT INTO products (
          id, category_id, brand, title, description,
          current_price, original_price, rating, reviews_summary, assured_badge,
          seller_name, delivery_text, in_stock
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13
        )`,
        [
          product.id,
          categoryIdFromName(product.category),
          product.brand,
          product.title,
          product.description,
          product.price.current,
          product.price.original,
          product.rating,
          product.reviews,
          product.assured,
          product.seller,
          product.delivery,
          product.inStock
        ]
      );

      for (const [index, image] of product.images.entries()) {
        await client.query(
          `INSERT INTO product_images (product_id, image_url, sort_order)
           VALUES ($1, $2, $3)`,
          [product.id, image, index]
        );
      }

      for (const [index, offer] of product.offers.entries()) {
        await client.query(
          `INSERT INTO product_offers (product_id, offer_text, sort_order)
           VALUES ($1, $2, $3)`,
          [product.id, offer, index]
        );
      }

      for (const [index, highlight] of product.highlights.entries()) {
        await client.query(
          `INSERT INTO product_highlights (product_id, highlight_text, sort_order)
           VALUES ($1, $2, $3)`,
          [product.id, highlight, index]
        );
      }

      for (const [label, value] of Object.entries(product.specifications)) {
        await client.query(
          `INSERT INTO product_specifications (product_id, label, value)
           VALUES ($1, $2, $3)`,
          [product.id, label, value]
        );
      }
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getProducts() {
  if (!pool) {
    throw new Error("Database connection is not available.");
  }

  const rowsResult = await pool.query(
    `SELECT
      p.id,
      p.brand,
      p.title,
      c.name AS category_name,
      p.rating,
      p.reviews_summary,
      p.assured_badge,
      p.seller_name,
      p.current_price,
      p.original_price,
      p.delivery_text,
      p.in_stock,
      p.description
     FROM products p
     JOIN categories c ON c.id = p.category_id
     ORDER BY p.title ASC`
  );

  const relations = await loadProductRelations(rowsResult.rows.map((row) => row.id));
  return normalizeProducts(rowsResult.rows, relations);
}

export async function getProductById(productId) {
  if (!pool) {
    throw new Error("Database connection is not available.");
  }

  const rowsResult = await pool.query(
    `SELECT
      p.id,
      p.brand,
      p.title,
      c.name AS category_name,
      p.rating,
      p.reviews_summary,
      p.assured_badge,
      p.seller_name,
      p.current_price,
      p.original_price,
      p.delivery_text,
      p.in_stock,
      p.description
     FROM products p
     JOIN categories c ON c.id = p.category_id
     WHERE p.id = $1`,
    [productId]
  );

  if (!rowsResult.rows.length) {
    return null;
  }

  const relations = await loadProductRelations([productId]);
  return normalizeProducts(rowsResult.rows, relations)[0];
}

export async function createOrder({ address, items }) {
  if (!pool) {
    throw new Error("Database connection is not available.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const productIds = items.map((item) => item.productId);
    const priceRows = await client.query(
      `SELECT id, current_price FROM products WHERE id = ANY($1::text[])`,
      [productIds]
    );

    const priceMap = new Map(
      priceRows.rows.map((row) => [row.id, Number(row.current_price)])
    );
    const orderId = `OD${Date.now()}`;
    const total = items.reduce(
      (sum, item) => sum + (priceMap.get(item.productId) ?? 0) * item.quantity,
      0
    );

    await client.query(
      `INSERT INTO orders (
        id, user_id, total_amount, full_name, phone, pincode, city, state, address_line
      ) VALUES (
        $1, 'default-user', $2, $3, $4, $5, $6, $7, $8
      )`,
      [
        orderId,
        total,
        address.fullName,
        address.phone,
        address.pincode,
        address.city,
        address.state,
        address.addressLine
      ]
    );

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.productId, item.quantity, priceMap.get(item.productId) ?? 0]
      );
    }

    await client.query("COMMIT");

    return {
      id: orderId,
      placedAt: new Date().toISOString(),
      address,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: priceMap.get(item.productId) ?? 0
      })),
      total
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
