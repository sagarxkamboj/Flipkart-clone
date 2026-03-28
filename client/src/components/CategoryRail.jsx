const categories = [
  "Top Offers",
  "Mobiles",
  "Fashion",
  "Electronics",
  "Home",
  "Appliances",
  "Travel",
  "Beauty"
];

export default function CategoryRail() {
  return (
    <section className="category-rail">
      {categories.map((category) => (
        <div key={category} className="category-badge">
          <div className="category-icon">{category.charAt(0)}</div>
          <span>{category}</span>
        </div>
      ))}
    </section>
  );
}
