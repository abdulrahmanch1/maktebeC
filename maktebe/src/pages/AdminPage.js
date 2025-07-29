import React, { useContext, useState, useEffect } from "react";
<<<<<<< HEAD
import { Link } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import useFetch from "../hooks/useFetch";
=======
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
>>>>>>> 1188a9b (feat: Implement email verification for user registration)
import { toast } from 'react-toastify';
import { API_URL } from "../constants";
import './AdminPage.css'; // Import the CSS file

const AdminPage = () => {
  const { theme } = useContext(ThemeContext);
  const { user, token, isLoggedIn } = useContext(AuthContext);
<<<<<<< HEAD
=======
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
>>>>>>> 1188a9b (feat: Implement email verification for user registration)
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
<<<<<<< HEAD
  const [cover, setCover] = useState(null); // For file upload
  const [pdfFile, setPdfFile] = useState(null); // For PDF file upload
  const [pages, setPages] = useState("");
  const [publishYear, setPublishYear] = useState("");
  const [language, setLanguage] = useState("");
  const [books, setBooks] = useState([]); // State to store books from DB
  const [categories, setCategories] = useState(["قصص أطفال", "كتب دينية", "كتب تجارية", "كتب رومانسية", "كتب بوليسية", "أدب", "تاريخ", "علوم", "فلسفة", "تكنولوجيا", "سيرة ذاتية", "شعر", "فن", "طبخ"]); // Initial categories
  const [editingBook, setEditingBook] = useState(null); // State to store the book being edited
  const [refreshTrigger, setRefreshTrigger] = useState(0); // State to trigger re-fetch
  const { data: booksData, loading, error: fetchError } = useFetch(`${API_URL}/api/books`, [refreshTrigger]);

  useEffect(() => {
    if (booksData) {
      setBooks(booksData);
      setCategories(prevCategories => [...new Set([...prevCategories, ...booksData.map((book) => book.category)])]);
    }
  }, [booksData]);
=======
  const [cover, setCover] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pages, setPages] = useState("");
  const [publishYear, setPublishYear] = useState("");
  const [language, setLanguage] = useState("");
  const [categories, setCategories] = useState(["قصص أطفال", "كتب دينية", "كتب تجارية", "كتب رومانسية", "كتب بوليسية", "أدب", "تاريخ", "علوم", "فلسفة", "تكنولوجيا", "سيرة ذاتية", "شعر", "فن", "طبخ"]);
  const [editingBook, setEditingBook] = useState(null);

  const editBookId = searchParams.get('edit');

  useEffect(() => {
    if (editBookId) {
      axios.get(`${API_URL}/api/books/${editBookId}`)
        .then(response => {
          const book = response.data;
          setEditingBook(book);
          setTitle(book.title);
          setAuthor(book.author);
          setCategory(book.category);
          setDescription(book.description);
          setPages(book.pages);
          setPublishYear(book.publishYear);
          setLanguage(book.language);
        })
        .catch(error => {
          toast.error("الكتاب المراد تعديله غير موجود");
          navigate('/admin');
        });
    } else {
      clearForm();
    }
  }, [editBookId, navigate]);
>>>>>>> 1188a9b (feat: Implement email verification for user registration)

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
<<<<<<< HEAD
=======
    navigate('/admin');
>>>>>>> 1188a9b (feat: Implement email verification for user registration)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error('الرجاء تسجيل الدخول مرة أخرى.');

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("pages", pages);
    formData.append("publishYear", publishYear);
    formData.append("language", language);
<<<<<<< HEAD
    if (cover) {
      formData.append("cover", cover); // Append the file
    }
    if (pdfFile) {
      formData.append("pdfFile", pdfFile); // Append the PDF file
    }

    try {
      if (editingBook) {
        // Update existing book
=======
    if (cover) formData.append("cover", cover);
    if (pdfFile) formData.append("pdfFile", pdfFile);

    try {
      if (editingBook) {
>>>>>>> 1188a9b (feat: Implement email verification for user registration)
        await axios.patch(`${API_URL}/api/books/${editingBook._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("تم تحديث الكتاب بنجاح!");
      } else {
<<<<<<< HEAD
        // Add new book
=======
>>>>>>> 1188a9b (feat: Implement email verification for user registration)
        await axios.post(`${API_URL}/api/books`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("تم إضافة الكتاب بنجاح!");
      }
<<<<<<< HEAD
      clearForm(); // Clear form fields and reset editing state
      setRefreshTrigger(prev => prev + 1); // Trigger re-fetch
=======
      clearForm();
>>>>>>> 1188a9b (feat: Implement email verification for user registration)
    } catch (error) {
      console.error("Error saving book:", error);
      toast.error(error.response?.data?.message || "فشل حفظ الكتاب.");
    }
  };

<<<<<<< HEAD
  const handleDelete = async (id) => {
    if (!token) return toast.error('الرجاء تسجيل الدخول مرة أخرى.');
    try {
      await axios.delete(`${API_URL}/api/books/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("تم حذف الكتاب بنجاح!");
      setRefreshTrigger(prev => prev + 1); // Trigger re-fetch
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error(error.response?.data?.message || "فشل حذف الكتاب.");
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

  

=======
>>>>>>> 1188a9b (feat: Implement email verification for user registration)
  if (!isLoggedIn || user?.role !== 'admin') {
    return (
      <div className="admin-page-container" style={{ backgroundColor: theme.background, color: theme.primary, textAlign: "center" }}>
        <h1 style={{ color: theme.primary }}>غير مصرح لك بالوصول لهذه الصفحة</h1>
        <p>يجب أن تكون مسؤولاً لعرض هذه الصفحة.</p>
      </div>
    );
  }

  return (
    <div className="admin-page-container" style={{ backgroundColor: theme.background, color: theme.primary }}>
<<<<<<< HEAD
      <h1 className="admin-page-title" style={{ color: theme.primary }}>إدارة الكتب</h1>
=======
      <div style={{display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px'}}>
        <Link to="/admin/books" style={{ backgroundColor: theme.accent, color: theme.primary, padding: "10px 20px", borderRadius: "5px", textDecoration: "none" }}>
          عرض كل الكتب
        </Link>
        <Link to="/admin/contact-messages" style={{ backgroundColor: theme.accent, color: theme.primary, padding: "10px 20px", borderRadius: "5px", textDecoration: "none" }}>
          عرض رسائل التواصل
        </Link>
      </div>
>>>>>>> 1188a9b (feat: Implement email verification for user registration)

      <div className="admin-form-container" style={{ backgroundColor: theme.secondary }}>
        <h2 className="admin-form-title" style={{ color: theme.background }}>{editingBook ? "تعديل الكتاب" : "إضافة كتاب جديد"}</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="admin-form-group">
            <label style={{ color: theme.background }}>عنوان الكتاب</label>
            <input type="text" placeholder="أدخل عنوان الكتاب" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }} />
          </div>
          <div className="admin-form-group">
            <label style={{ color: theme.background }}>اسم الكاتب</label>
            <input type="text" placeholder="أدخل اسم الكاتب" value={author} onChange={(e) => setAuthor(e.target.value)} required style={{ border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }} />
          </div>
          <div className="admin-form-group">
            <label style={{ color: theme.background }}>التصنيف</label>
            <input
              type="text"
              list="category-options"
              placeholder="أدخل أو اختر تصنيف"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              style={{ border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }}
            />
            <datalist id="category-options">
              {categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
          <div className="admin-form-group">
            <label style={{ color: theme.background }}>الوصف</label>
            <textarea placeholder="أدخل وصف الكتاب" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} required style={{ border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }}></textarea>
          </div>
          <div className="admin-form-group">
            <label style={{ color: theme.background }}>عدد الصفحات</label>
            <input type="number" placeholder="أدخل عدد الصفحات" value={pages} onChange={(e) => setPages(e.target.value)} required style={{ border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }} />
          </div>
          <div className="admin-form-group">
            <label style={{ color: theme.background }}>سنة النشر</label>
            <input type="number" placeholder="أدخل سنة النشر" value={publishYear} onChange={(e) => setPublishYear(e.target.value)} required style={{ border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }} />
          </div>
          <div className="admin-form-group">
            <label style={{ color: theme.background }}>اللغة</label>
            <input type="text" placeholder="أدخل اللغة" value={language} onChange={(e) => setLanguage(e.target.value)} required style={{ border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }} />
          </div>
          <div className="admin-form-group">
            <label style={{ color: theme.background }}>صورة الغلاف</label>
            <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files[0])} style={{ border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }} />
          </div>
          <div className="admin-form-group">
            <label style={{ color: theme.background }}>ملف PDF</label>
            <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files[0])} style={{ border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }} />
          </div>
          <button type="submit" className="admin-form-button" style={{ backgroundColor: theme.accent, color: theme.primary }}>{editingBook ? "تحديث الكتاب" : "إضافة الكتاب"}</button>
          {editingBook && (
<<<<<<< HEAD
            <button type="button" onClick={handleCancelEdit} className="admin-form-button cancel" style={{ backgroundColor: theme.secondary, color: theme.primary }}>إلغاء التعديل</button>
          )}
        </form>
      </div>

      <div className="admin-books-list-container">
        <h2 className="admin-books-list-title" style={{ color: theme.primary }}>الكتب المضافة</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {books.map((book) => (
            <div key={book._id} className="admin-book-item" style={{ backgroundColor: theme.secondary }}>
              <p style={{ color: theme.background }}>{book.title}</p>
              <div>
                <button onClick={() => handleEdit(book)} style={{ backgroundColor: theme.accent, color: theme.primary }}>تعديل</button>
                <button onClick={() => handleDelete(book._id)} className="delete">حذف</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-section-link">
        <Link to="/admin/contact-messages" style={{ backgroundColor: theme.accent, color: theme.primary, padding: "10px 20px", borderRadius: "5px", textDecoration: "none" }}>
          عرض رسائل التواصل
        </Link>
      </div>

      
=======
            <button type="button" onClick={clearForm} className="admin-form-button cancel" style={{ backgroundColor: theme.secondary, color: theme.primary }}>إلغاء التعديل</button>
          )}
        </form>
      </div>
>>>>>>> 1188a9b (feat: Implement email verification for user registration)
    </div>
  );
};

export default AdminPage;
