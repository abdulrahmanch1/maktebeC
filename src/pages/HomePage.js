
import React, { useContext, useState, useEffect } from "react";
import BookCard from "../components/BookCard";
import { ThemeContext } from "../contexts/ThemeContext";
import axios from "axios";

const HomePage = () => {
  const { theme } = useContext(ThemeContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState(["الكل"]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/books`);
        setBooks(response.data);

        const uniqueCategories = ["الكل", ...new Set(response.data.map(book => book.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };
    fetchBooks();
  }, []);

  const filteredBooks = books.filter((book) => {
    const matchesSearchTerm = book.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "الكل" || book.category === selectedCategory;
    return matchesSearchTerm && matchesCategory;
  });

  return (
    <div style={{ backgroundColor: theme.background, color: theme.primary, padding: "20px" }}>
      <h1 style={{ color: theme.primary, textAlign: "center" }}>البحث عن الكتب</h1>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="ابحث عن كتاب..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "10px",
            width: "40%",
            borderRadius: "5px",
            border: `1px solid ${theme.secondary}`,
            backgroundColor: theme.background,
            color: theme.primary,
            marginBottom: "10px",
            marginRight: "10px",
          }}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: "7.5px",
            borderRadius: "5px",
            border: `1px solid ${theme.secondary}`,
            backgroundColor: theme.background,
            color: theme.primary,
            marginRight: "10px",
          }}
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", minHeight: "70vh" }}>
        {filteredBooks.map((book) => (
          <BookCard key={book._id} book={book} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
