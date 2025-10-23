import React, { useContext, useState } from "react";
import { FaSearch, FaFilter, FaSort } from "react-icons/fa";
import ProductCard from "../components/ProductCard";
import "./ProductList.css";
import productbg from '../assets/images/products-bg.jpg';
import ProductContext from "../contexts/ProductContext";

export default function ProductList() {

  const products = useContext(ProductContext)

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0);

  // 🔹 Filter + Sort logic
  const filteredProducts = products
	.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
	.filter((p) => {
	  if (selectedCategory && p.category !== selectedCategory) return false;
	  if (priceRange === "low") return p.price < 100;
	  if (priceRange === "mid") return p.price >= 100 && p.price <= 300;
	  if (priceRange === "high") return p.price > 300;
	  return true;
	})
	.filter((p) => (ratingFilter ? p.rating >= ratingFilter : true))
	.sort((a, b) => {
	  if (sortOrder === "priceAsc") return a.price - b.price;
	  if (sortOrder === "priceDesc") return b.price - a.price;
	  if (sortOrder === "nameAsc") return a.name.localeCompare(b.name);
	  if (sortOrder === "nameDesc") return b.name.localeCompare(a.name);
	  return 0;
	});

  //  Extract unique categories
  const categories = [...new Set(products.map((p) => p.category))].filter(Boolean);

  return (
	<div className="product-page">
	  <div className='products-bg'
	  style={{ backgroundImage: `url(${productbg})` }}>  
	  </div>
	  <h1 className="page-title">What do you want to buy today?</h1>

	  {/* Search Bar */}
	  <div className="search-bar">
		<input
		  type="text"
		  placeholder="Search for products..."
		  value={search}
		  onChange={(e) => setSearch(e.target.value)}
		/>
		<FaSearch className="search-icon" />
	  </div>

	  {/* Filter / Sort Bar */}
	  <div className="filter-bar">
		<div className="filter-group">
		  <button
			className="filter-btn"
			onClick={() => setShowFilter(!showFilter)}
		  >
			<FaFilter /> FILTER
		  </button>

		  {/* Dropdown Filter Menu */}
		  {showFilter && (
			<div className="filter-dropdown">
			  <p>Category</p>
			  <select
				value={selectedCategory}
				onChange={(e) => setSelectedCategory(e.target.value)}
			  >
				<option value="">All</option>
				{categories.map((cat, index) => (
				  <option key={index} value={cat}>
					{cat}
				  </option>
				))}
			  </select>

			  <p>Price Range</p>
			  <select
				value={priceRange}
				onChange={(e) => setPriceRange(e.target.value)}
			  >
				<option value="">All</option>
				<option value="low">Below ₱100</option>
				<option value="mid">₱100 - ₱300</option>
				<option value="high">Above ₱300</option>
			  </select>

			  <p>Minimum Rating</p>
			  <select
				value={ratingFilter}
				onChange={(e) => setRatingFilter(Number(e.target.value))}
			  >
				<option value={0}>All</option>
				<option value={4}>4 stars & up</option>
				<option value={3}>3 stars & up</option>
				<option value={2}>2 stars & up</option>
			  </select>

			  
			</div>
		  )}
		</div>

		{/* 🔹 Sort Button */}
		<div className="sort-group">
		  <button
			className="sort-btn"
			onClick={() =>
			  setSortOrder((prev) =>
				prev === ""
				  ? "priceAsc"
				  : prev === "priceAsc"
				  ? "priceDesc"
				  : prev === "priceDesc"
				  ? "nameAsc"
				  : prev === "nameAsc"
				  ? "nameDesc"
				  : ""
			  )
			}
		  >
			<FaSort /> SORT ({sortOrder || "none"})
		  </button>
		</div>
	  </div>

	  {/* Product Grid */}
	  <div className="product-grid">
		{filteredProducts.length > 0 ? (
		  filteredProducts.map((product) => (
			<ProductCard key={product.product_id} product={product} />
		  ))
		) : (
		  <p className="no-results">No products found matching your filters.</p>
		)}
	  </div>
	</div>
  );
}
