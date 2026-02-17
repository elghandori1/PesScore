import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useMessage } from "../hooks/useMessage";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();
  const { showMessage } = useMessage();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/adminpes");
      return;
    }
    fetchAllUsers();
  }, [navigate]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await axiosClient.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users);
      setTotalUsers(response.data.total);
    } catch (error) {
      showMessage("خطأ في تحميل المستخدمين", "error");
      if (error.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/adminpes");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    showMessage("تم تسجيل الخروج بنجاح", "success");
    navigate("/adminpes");
  };

  // Logic: Filter -> Paginate
  const filteredUsers = users.filter(
    (user) =>
      user.name_account.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id_account.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 on search
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        {/* Simple Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-gray-200">
          <div className="text-center md:text-right mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم</h1>
            <p className="text-sm text-gray-500">إجمالي المسجلين: {totalUsers}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-600 hover:text-red-800 border border-red-200 px-4 py-2 rounded-md transition hover:bg-red-50"
          >
            تسجيل الخروج
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="البحث بالاسم أو المعرف..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
          />
        </div>

        {/* Simple Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">الاسم</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">المعرف</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase text-center">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.length > 0 ? (
                  currentItems.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">{user.name_account}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">{user.id_account}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-center">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString("en-GB") : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-10 text-center text-gray-400">
                      لا يوجد مستخدمين متاحين
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredUsers.length > itemsPerPage && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-1.5 text-sm rounded border transition ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  السابق
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-1.5 text-sm rounded border transition ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  التالي
                </button>
              </div>
              
              <div className="text-xs text-gray-500 font-medium">
                صفحة {currentPage} من {totalPages}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;