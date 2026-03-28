export default function FiltersSidebar({
  categories,
  activeCategory,
  setActiveCategory
}) {
  return (
    <aside className="filters-panel">
      <h2>Filters</h2>
      <div className="filter-group">
        <div className="filter-title">Categories</div>
        {categories.map((category) => (
          <button
            key={category}
            className={category === activeCategory ? "filter-chip active" : "filter-chip"}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </aside>
  );
}
