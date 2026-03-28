import express from "express";
import cors from "cors";
import { products as seededProducts } from "./data/products.js";
import {
  createOrder,
  getProductById,
  getProducts,
  hasDatabaseConfig,
  initializeDatabase,
  pool
} from "./db.js";

const app = express();
const PORT = process.env.PORT || 5000;
let databaseMode = false;

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_request, response, next) => {
  try {
    if (databaseMode && pool) {
      await pool.query("SELECT 1");
      response.json({ ok: true, database: "postgresql" });
      return;
    }

    response.json({ ok: true, database: "seeded-data" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/products", async (_request, response, next) => {
  try {
    const products = databaseMode ? await getProducts() : seededProducts;
    const categories = [...new Set(products.map((product) => product.category))];
    response.json({ products, categories });
  } catch (error) {
    next(error);
  }
});

app.get("/api/products/:productId", async (request, response, next) => {
  try {
    const product = databaseMode
      ? await getProductById(request.params.productId)
      : seededProducts.find((item) => item.id === request.params.productId);

    if (!product) {
      response.status(404).json({ message: "Product not found" });
      return;
    }

    response.json({ product });
  } catch (error) {
    next(error);
  }
});

app.post("/api/orders", async (request, response, next) => {
  const { address, items } = request.body;

  if (!address || !items?.length) {
    response.status(400).json({ message: "Address and items are required" });
    return;
  }

  try {
    const order = databaseMode
      ? await createOrder({ address, items })
      : {
          id: `OD${Date.now()}`,
          placedAt: new Date().toISOString(),
          address,
          items: items.map((item) => {
            const product = seededProducts.find((entry) => entry.id === item.productId);
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product?.price.current ?? 0
            };
          }),
          total: items.reduce((sum, item) => {
            const product = seededProducts.find((entry) => entry.id === item.productId);
            return sum + (product?.price.current ?? 0) * item.quantity;
          }, 0)
        };
    response.status(201).json({ order });
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ message: "Internal server error" });
});

function startServer() {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Data mode: ${databaseMode ? "PostgreSQL" : "Seeded fallback"}`);
  });
}

if (hasDatabaseConfig) {
  initializeDatabase()
    .then(() => {
      databaseMode = true;
      startServer();
    })
    .catch((error) => {
      console.error("Failed to initialize PostgreSQL, starting with seeded fallback:", error.message);
      databaseMode = false;
      startServer();
    });
} else {
  databaseMode = false;
  startServer();
}
