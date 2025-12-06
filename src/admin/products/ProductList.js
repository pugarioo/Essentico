import React, { useEffect, useState } from "react";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8082/api/products") // Replace with your backend URL
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h2>Product List</h2>
        <button className="btn-primary btn-add-new">+ Add Product</button>
      </div>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul className="product-list">
          {products.map((product) => (
            <li key={product.id} className="product-item">
              <strong>{product.name}</strong> - ₱{product.price} <br />
              <small>{product.description}</small> <br />
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  width={150}
                  style={{ marginTop: "8px" }}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProductList;
