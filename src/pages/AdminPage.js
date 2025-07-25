import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import axios from "axios";

const AdminPage = () => {
  const { theme } = useContext(ThemeContext);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState(null); // For file upload
  const [pdfFile, setPdfFile] = useState(null); // For PDF file upload
  const [pages, setPages] = useState("");
  const [publishYear, setPublishYear] = useState("");
  const [language, setLanguage] = useState("");
  const [books, setBooks] = useState([]); // State to store books from DB
  const [categories, setCategories] = useState([]); // State to store categories from DB
  const [editingBook, setEditingBook] = useState(null); // State to store the book being edited

  // Fetch books and categories on component mount
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/books`);
      setBooks(response.data);
      const uniqueCategories = ["الكل", ...new Set(response.data.map((book) => book.category))];
      setCategories(uniqueCategories); // Add "الكل" option
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const clearForm = () => {
    setTitle("");
    setAuthor("");
    setCategory("");
    setDescription("");
    setCover(null);
    setPdfFile(null);
    setPages("");
    setPublishYear("");
    setLanguage("");
    setEditingBook(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("pages", pages);
    formData.append("publishYear", publishYear);
    formData.append("language", language);
    if (cover) {
      formData.append("cover", cover); // Append the file
    }
    if (pdfFile) {
      formData.append("pdfFile", pdfFile); // Append the PDF file
    }

    try {
      if (editingBook) {
        // Update existing book
        await axios.patch(`${process.env.REACT_APP_API_URL}/api/books/${editingBook._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("تم تحديث الكتاب بنجاح!");
      } else {
        // Add new book
        await axios.post(`${process.env.REACT_APP_API_URL}/api/books`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("تم إضافة الكتاب بنجاح!");
      }
      clearForm(); // Clear form fields and reset editing state
      fetchBooks(); // Refresh book list
    } catch (error) {
      console.error("Error saving book:", error);
      alert("فشل حفظ الكتاب.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/books/${id}`);
      alert("تم حذف الكتاب بنجاح!");
      fetchBooks(); // Refresh book list
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("فشل حذف الكتاب.");
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setCategory(book.category);
    setDescription(book.description);
    setPages(book.pages);
    setPublishYear(book.publishYear);
    setLanguage(book.language);
    // Note: We don't set the cover file directly as it's a File object, not a string.
    // The user will have to re-select the cover if they want to change it.
    // Similarly for PDF file.
  };

  const handleCancelEdit = () => {
    clearForm();
  };

  return (
    <div style={{ backgroundColor: theme.background, color: theme.primary, padding: "20px" }}>
      <h1 style={{ color: theme.primary, textAlign: "center", marginBottom: "30px" }}>إدارة الكتب</h1>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", backgroundColor: theme.secondary, borderRadius: "8px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
        <h2 style={{ color: theme.background, textAlign: "center", marginBottom: "20px" }}>{editingBook ? "تعديل الكتاب" : "إضافة كتاب جديد"}</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div style={{ marginBottom: "15px" }}>
            <label style={{ color: theme.background, display: "block", marginBottom: "5px" }}>عنوان الكتاب</label>
            <input type="text" placeholder="أدخل عنوان الكتاب" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "4px", border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }} />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ color: theme.background, display: "block", marginBottom: "5px" }}>اسم الكاتب</label>
            <input type="text" placeholder="أدخل اسم الكاتب" value={author} onChange={(e) => setAuthor(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "4px", border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }} />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ color: theme.background, display: "block", marginBottom: "5px" }}>التصنيف</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "4px", border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }}>
              <option value="">اختر تصنيف</option>
              {categories.filter(cat => cat !== "الكل").map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ color: theme.background, display: "block", marginBottom: "5px" }}>الوصف</label>
            <textarea placeholder="أدخل وصف الكتاب" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "4px", border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }}></textarea>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ color: theme.background, display: "block", marginBottom: "5px" }}>عدد الصفحات</label>
            <input type="number" placeholder="أدخل عدد الصفحات" value={pages} onChange={(e) => setPages(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "4px", border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }} />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ color: theme.background, display: "block", marginBottom: "5px" }}>سنة النشر</label>
            <input type="number" placeholder="أدخل سنة النشر" value={publishYear} onChange={(e) => setPublishYear(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "4px", border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }} />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ color: theme.background, display: "block", marginBottom: "5px" }}>اللغة</label>
            <input type="text" placeholder="أدخل اللغة" value={language} onChange={(e) => setLanguage(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "4px", border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }} />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ color: theme.background, display: "block", marginBottom: "5px" }}>صورة الغلاف</label>
            <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files[0])} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }} />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ color: theme.background, display: "block", marginBottom: "5px" }}>ملف PDF</label>
            <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files[0])} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }} />
          </div>
          <button type="submit" style={{ width: "100%", padding: "12px", borderRadius: "4px", border: "none", backgroundColor: theme.accent, color: theme.primary, fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>{editingBook ? "تحديث الكتاب" : "إضافة الكتاب"}</button>
          {editingBook && (
            <button type="button" onClick={handleCancelEdit} style={{ width: "100%", padding: "12px", borderRadius: "4px", border: "none", backgroundColor: theme.secondary, color: theme.primary, fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}>إلغاء التعديل</button>
          )}
        </form>
      </div>

      <div style={{ marginTop: "40px" }}>
        <h2 style={{ color: theme.primary, textAlign: "center", marginBottom: "20px" }}>الكتب المضافة</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {books.map((book) => (
            <div key={book._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", backgroundColor: theme.secondary, borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
              <p style={{ color: theme.background, margin: "0", fontWeight: "bold" }}>{book.title}</p>
              <div>
                <button onClick={() => handleEdit(book)} style={{ backgroundColor: theme.accent, color: theme.primary, border: "none", padding: "8px 12px", borderRadius: "4px", cursor: "pointer", marginRight: "10px" }}>تعديل</button>
                <button onClick={() => handleDelete(book._id)} style={{ backgroundColor: "#dc3545", color: "white", border: "none", padding: "8px 12px", borderRadius: "4px", cursor: "pointer" }}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;