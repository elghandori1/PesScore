import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import useAuth from '../auth/useAuth';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axiosClient.get('/user/profile');
        setProfile(response.data.userprofile);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load profile');
      }
    };
    
    if (user) fetchProfile();
  }, [user, loading, navigate]);

  const changeLanguage = () => {
    // Placeholder for language change functionality
    alert('Language change functionality will be implemented here');
  };

  if (loading || !user) return null;

  return (
    <main className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 pb-16" dir="rtl">
      <div className="container mx-auto max-w-4xl pt-6 sm:pt-8 md:pt-10">
    
        {/* Profile Card */}
        <div className="rounded-2xl shadow-lg overflow-hidden bg-white">
          {/* Profile Header */}
          <div className="p-6 bg-blue-50 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                  {profile?.name_account?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-blue-500 font-almarai">{profile?.name_account || 'مستخدم'}</h2>
                  <p className="text-xs sm:text-sm text-gray-600 font-almarai">عضو منذ {profile ? new Date(profile.created_at).toLocaleDateString() : '...'}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  className="px-3 sm:px-4 py-1.5 rounded-full bg-blue-500 text-white text-xs sm:text-sm hover:bg-blue-600 transition-colors"
                >
                  المود
                </button>
                <button 
                  onClick={changeLanguage}
                  className="px-3 sm:px-4 py-1.5 rounded-full bg-gray-200 text-blue-500 text-xs sm:text-sm hover:bg-gray-300 transition-colors"
                >
                  اللغة
                </button>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {profile ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 rounded-lg bg-gray-200">
                    <p className="text-xs text-gray-500 font-almarai mb-1">اسم الحساب</p>
                    <p className="text-base sm:text-lg text-blue-600 font-medium font-almarai">{profile.name_account}</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-lg bg-gray-200">
                    <p className="text-xs text-gray-500 font-almarai mb-1">Game ID</p>
                    <p className="text-base sm:text-lg text-blue-600 font-medium font-almarai">{profile.id_account}</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-lg bg-gray-200">
                    <p className="text-xs text-gray-500 font-almarai mb-1">البريد الإلكتروني</p>
                    <p className="text-base sm:text-lg text-blue-600 font-medium font-almarai">{profile.email}</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-lg bg-gray-200">
                    <p className="text-xs text-gray-500 font-almarai mb-1">تاريخ الإنشاء</p>
                    <p className="text-base sm:text-lg text-blue-600 font-medium font-almarai">
                      {new Date(profile.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center pt-2 sm:pt-4">
                  <button
                    disabled
                    className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base font-almarai cursor-not-allowed opacity-70 bg-gray-200 text-blue-500"
                  >
                    تحديث المعلومات (قريبًا)
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-center py-8 sm:py-12">
                <p className="text-center text-gray-600 text-sm font-almarai">
                  جاري تحميل الملف الشخصي...
                </p>
              </div>
            )}

            {error && (
              <div className="text-center py-2 sm:py-3 px-4 rounded-lg bg-red-100 text-red-500 text-xs sm:text-sm font-almarai">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;