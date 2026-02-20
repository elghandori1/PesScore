import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import useAuth from '../auth/useAuth';
import { useMessage } from '../hooks/useMessage';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [friendCount, setFriendCount] = useState(0);
  const [error, setError] = useState('');
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { showMessage } = useMessage();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axiosClient.get('/user/profile');
        setProfile(response.data.userprofile);
        
        try {
          const friendsResponse = await axiosClient.get('/friend/list-friend');
          setFriendCount(friendsResponse.data.friends.length || 0);
        } catch (err) {
          console.log('Error fetching friends:', err);
          setFriendCount(0);
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load profile');
      }
    };
    
    if (user) fetchProfile();
  }, [user, loading, navigate]);

  const changeLanguage = () => {
    // Placeholder for language change functionality
    showMessage('ستتم إضافة خيار تغيير اللغة في المستقبل','error');
  };
  if (loading || !user) return null;

  return (
 <main className="flex flex-col mt-6 items-center w-full px-3 pb-16" dir="rtl">
  <div className="container mx-auto max-w-md pt-6">
    {/* Profile Card */}
    <div className="rounded-lg shadow overflow-hidden bg-white">
      {/* Profile Header */}
      <div className="p-4 bg-blue-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold">
              {profile?.name_account?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-base font-bold text-blue-500">{profile?.name_account || 'مستخدم'}</h2>
              <p className="text-[10px] text-gray-600">
                عضو {profile ? new Date(profile.created_at).toLocaleDateString() : '...'}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <button 
              onClick={changeLanguage}
              className="px-2 py-1 rounded-full bg-gray-200 text-blue-500 text-xs"
            >
              اللغة
            </button>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="p-3 space-y-3">
        {profile ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-gray-100">
                <p className="text-[9px] text-gray-500 mb-1">الحساب</p>
                <p className="text-sm text-blue-600 font-medium">{profile.name_account}</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-100">
                <p className="text-[9px] text-gray-500 mb-1">Game ID</p>
                <p className="text-sm text-blue-600 font-medium">{profile.id_account}</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-100">
                <p className="text-[9px] text-gray-500 mb-1">عدد الأصدقاء</p>
                <p className="text-sm text-blue-600 font-medium text-center">{friendCount}</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-100">
                <p className="text-[9px] text-gray-500 mb-1">الإنشاء</p>
                <p className="text-sm text-blue-600 font-medium">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                disabled
                className="w-full px-4 py-2 rounded-lg text-sm bg-gray-100 text-blue-500 opacity-70"
              >
                تحديث (قريبًا)
              </button>
            </div>
          </>
        ) : (
          <div className="flex justify-center py-6">
            <p className="text-center text-gray-600 text-sm">
              جاري التحميل...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-2 px-3 rounded-lg bg-red-50 text-red-500 text-xs">
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