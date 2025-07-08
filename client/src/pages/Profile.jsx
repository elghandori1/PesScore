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

  if (loading || !user) return null;

  return (
    <main className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 pb-16" dir="rtl">
      <div className="pt-24 sm:pt-28 w-full max-w-md">
        <div className="bg-white text-gray-800 rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          <div className="text-center mb-4">
            <h2 className="text-xl sm:text-2xl text-blue-500 font-bold font-almarai">ملف المستخدم</h2>
            <p className="text-gray-500 text-sm font-almarai">معلومات حسابك</p>
          </div>

          {profile ? (
            <>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-600 font-almarai">اسم الحساب:</p>
                <p className="text-base text-blue-600 sm:text-lg font-medium font-almarai">{profile.name_account}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-600 font-almarai">Game ID:</p>
                <p className="text-base text-blue-600 sm:text-lg font-medium font-almarai">{profile.id_account}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-600 font-almarai">البريد الإلكتروني:</p>
                <p className="text-base text-blue-600 sm:text-lg font-medium font-almarai">{profile.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-600 font-almarai">تاريخ الإنشاء:</p>
                <p className="text-base text-blue-600 sm:text-lg font-medium font-almarai">
                  {new Date(profile.created_at).toLocaleString()}
                </p>
              </div>
              <button
                disabled
                className="mt-4 w-full bg-gray-300 text-blue-500 font-semibold py-2.5 sm:py-3 px-4 rounded-lg cursor-not-allowed opacity-70 text-sm sm:text-base font-almarai"
              >
                تحديث المعلومات (قريبًا)
              </button>
            </>
          ) : (
            <p className="text-center text-gray-600 text-sm font-almarai">
              جاري تحميل الملف الشخصي...
            </p>
          )}

          {error && (
            <div className="text-center text-red-500 text-sm font-almarai mt-2">
              {error}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Profile;
