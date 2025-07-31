import React, { useContext, useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import { toast } from 'react-toastify';
import { API_URL } from "../constants";
import './AdminPage.css'; // Import the CSS file

const AdminPage = () => {
  const { theme } = useContext(ThemeContext);
  const { user, token, isLoggedIn } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pages, setPages] = useState("");
  const [publishYear, setPublishYear] = useState("");
  const [language, setLanguage] = useState("");
  const [keywords, setKeywords] = useState(""); // New state for keywords
  const [categories] = useState(["قصص أطفال", "كتب دينية", "كتب تجارية", "كتب رومانسية", "كتب بوليسية", "أدب", "تاريخ", "علوم", "فلسفة", "تكنولوجيا", "سيرة ذاتية", "شعر", "فن", "طبخ"]);
  const [editingBook, setEditingBook] = useState(null);

  const editBookId = searchParams.get('edit');

  const clearForm = useCallback(() => {
    setTitle("");
    setAuthor("");
    setCategory("");
    setDescription("");
    setCover(null);
    setPdfFile(null);
    setPages("");
    setPublishYear("");
    setLanguage("");
    setKeywords(""); // Clear keywords
    setEditingBook(null);
    navigate('/admin');
  }, [navigate]);

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
          setKeywords(book.keywords ? book.keywords.join(', ') : ''); // Set keywords
        })
        .catch(error => {
          toast.error("الكتاب المراد تعديله غير موجود");
          navigate('/admin');
        });
    } else {
      clearForm();
    }
  }, [editBookId, navigate, clearForm]);

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
    formData.append("keywords", keywords); // Append keywords
    if (cover) formData.append("cover", cover);
    if (pdfFile) formData.append("pdfFile", pdfFile);
    try {
    if (editingBook) {
        await axios.patch(`${API_URL}/api/books/${editingBook._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("تم تحديث الكتاب بنجاح!");
      } else {
        await axios.post(`${API_URL}/api/books`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("تم إضافة الكتاب بنجاح!");
      }
      clearForm();
    } catch (error) {
      console.error("Error saving book:", error);
      toast.error(error.response?.data?.message || "فشل حفظ الكتاب.");
    }
  };
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
      <div style={{display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px'}}>
        <Link to="/admin/books" style={{ backgroundColor: theme.accent, color: theme.primary, padding: "10px 20px", borderRadius: "5px", textDecoration: "none" }}>
          عرض كل الكتب
        </Link>
        <Link to="/admin/contact-messages" style={{ backgroundColor: theme.accent, color: theme.primary, padding: "10px 20px", borderRadius: "5px", textDecoration: "none" }}>
          عرض رسائل التواصل
        </Link>
      </div>

      <div className="admin-form-container" style={{ backgroundColor: theme.secondary, color: theme.primary }}>
        <h2 className="admin-form-title">{editingBook ? "تعديل الكتاب" : "إضافة كتاب جديد"}</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="admin-form-group">
            <label>عنوان الكتاب</label>
            <input type="text" placeholder="أدخل عنوان الكتاب" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }} />
          </div>
          <div className="admin-form-group">
            <label>اسم الكاتب</label>
            <input type="text" placeholder="أدخل اسم الكاتب" value={author} onChange={(e) => setAuthor(e.target.value)} required style={{ border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }} />
          </div>
          <div className="admin-form-group">
            <label>التصنيف</label>
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
            <label>الوصف</label>
            <textarea placeholder="أدخل وصف الكتاب" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} required style={{ border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }}></textarea>
          </div>
          <div className="admin-form-group">
            <label>عدد الصفحات</label>
            <input type="number" placeholder="أدخل عدد الصفحات" value={pages} onChange={(e) => setPages(e.target.value)} required style={{ border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }} />
          </div>
          <div className="admin-form-group">
            <label>سنة النشر</label>
            <input type="number" placeholder="أدخل سنة النشر" value={publishYear} onChange={(e) => setPublishYear(e.target.value)} required style={{ border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }} />
          </div>
          <div className="admin-form-group">
            <label>اللغة</label>
            <input type="text" placeholder="أدخل اللغة" value={language} onChange={(e) => setLanguage(e.target.value)} required style={{ border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }} />
          </div>
          <div className="admin-form-group">
            <label>صورة الغلاف</label>
            <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files[0])} style={{ border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }} />
          </div>
          <div className="admin-form-group">
            <label>ملف PDF</label>
            <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files[0])} style={{ border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }} />
          </div>
          <div className="admin-form-group">
            <label>الكلمات المفتاحية (افصل بينها بفاصلة)</label>
            <input type="text" placeholder="أدخل كلمات مفتاحية" value={keywords} onChange={(e) => setKeywords(e.target.value)} style={{ border: `1px solid ${theme.accent}`, backgroundColor: theme.background, color: theme.primary }} />
          </div>
          <button type="submit" className="admin-form-button" style={{ backgroundColor: theme.accent, color: theme.primary }}>{editingBook ? "تحديث الكتاب" : "إضافة الكتاب"}</button>
          {editingBook && (
            <button type="button" onClick={clearForm} className="admin-form-button cancel" style={{ backgroundColor: theme.secondary, color: theme.primary }}>إلغاء التعديل</button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminPage;
