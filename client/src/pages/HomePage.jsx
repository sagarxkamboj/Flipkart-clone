import { useContext } from "react";
import { StoreContext } from "../context/StoreContext";
import CategoryRail from "../components/CategoryRail";
import FiltersSidebar from "../components/FiltersSidebar";
import ProductCard from "../components/ProductCard";

export default function HomePage() {
  const {
    categories,
    activeCategory,
    setActiveCategory,
    filteredProducts,
    searchTerm
  } = useContext(StoreContext);

  const topCategories = categories.filter((category) => category !== "All").slice(0, 5);

  return (
    <div className="page-container">
      <CategoryRail />

      <section className="hero-banner">
        <div className="hero-copy">
          <p className="hero-kicker">Brand Mall Fest</p>
          <h1>Big Savings on Mobiles, Fashion, Electronics and More</h1>
          <p>Shop top deals across your favourite categories with fast delivery and easy returns.</p>
        </div>
        <div className="hero-pillars">
          <div>
            <strong>Top Offers</strong>
            <span>Best prices across categories</span>
          </div>
          <div>
            <strong>Fast Delivery</strong>
            <span>Easy shopping with quick checkout</span>
          </div>
        </div>
      </section>

      <div className="catalog-layout">
        <FiltersSidebar
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        <section className="catalog-content">
          <div className="catalog-shell">
            <div className="catalog-header">
              <div>
                <div className="breadcrumb-copy">Home &gt; {activeCategory}</div>
                <h2>All Products</h2>
                <p>
                  {filteredProducts.length} products found
                  {searchTerm ? ` for "${searchTerm}"` : ""}
                </p>
              </div>
            </div>

            <div className="sort-strip">
              <span className="sort-label">Popular filters:</span>
              {topCategories.map((category) => (
                <button
                  key={category}
                  className={
                    category === activeCategory ? "sort-chip active" : "sort-chip"
                  }
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
