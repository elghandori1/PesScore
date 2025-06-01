import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import footballBg from "../assets/images/efootbalBG5.png";

function Detailsfriend() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("history");
  const [matches, setMatches] = useState([]);
  const [friend, setFriend] = useState({ name_account: '' });
  const [friendship, setFriendship] = useState({ status: 'active', requested_by: null });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [receivedPendingCount, setReceivedPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletionRequests, setDeletionRequests] = useState({});

  // Helper to truncate name if needed
  const truncateName = (name, length = 10) => {
    if (!name) return '';
    return name.length > length ? name.slice(0, length) + '..' : name;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const userResponse = await axios.get('http://localhost:5000/auth/check-auth', {
        withCredentials: true,
      });
      setCurrentUserId(userResponse.data.user?.id);

      const response = await axios.get(`http://localhost:5000/matches/matches-score/${id}`, {
        withCredentials: true,
      });
      setMatches(response.data.matches.map(match => ({
        ...match,
        status: match.status === 'confirmed' ? 'accepted' : match.status
      })));
      setFriend(response.data.friend || { name_account: 'Unknown' });
      setFriendship(response.data.friendship || { status: 'active', requested_by: null });

      const pendingCount = response.data.matches.filter(m => 
        m.status === 'pending' && m.player2_id === userResponse.data.user?.id
      ).length;
      const rejectedCount = response.data.matches.filter(m => 
        m.status === 'rejected' && m.created_by === userResponse.data.user?.id
      ).length;
      
      setReceivedPendingCount(pendingCount);
      setRejectedCount(rejectedCount);
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 404) {
        setError('Friend not found or not accepted');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletionRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/matches/deletion-requests', {
        withCredentials: true,
      });
      const requests = {};
      response.data.requests.forEach(req => {
        requests[req.match_id] = req;
      });
      setDeletionRequests(requests);
    } catch (err) {
      console.error('Error fetching deletion requests:', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDeletionRequests();
  }, [id, navigate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchData();
    fetchDeletionRequests();
  };

  const handleAcceptMatch = async (matchId) => {
    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/matches/accept-match/${matchId}`, {}, {
        withCredentials: true
      });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept match');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectMatch = async (matchId) => {
    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/matches/reject-match/${matchId}`, {}, {
        withCredentials: true
      });
      await fetchData();
      await fetchDeletionRequests();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject match');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelMatch = async (matchId) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/matches/cancel-match/${matchId}`, {
        withCredentials: true
      });
      setMatches(prevMatches => prevMatches.filter(match => match.id !== matchId));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel match');
    } finally {
      setLoading(false);
    }
  };

  const handleResendMatch = async (matchId) => {
    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/matches/resend-match/${matchId}`, {}, {
        withCredentials: true
      });
      await fetchData();
      await fetchDeletionRequests();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend match');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDeletion = async (matchId) => {
    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/matches/request-delete/${matchId}`, {}, {
        withCredentials: true
      });
      await fetchData();
      await fetchDeletionRequests();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request deletion');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDeletionRequest = async (matchId) => {
    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/matches/cancel-delete/${matchId}`, {}, {
        withCredentials: true
      });
      await fetchData();
      await fetchDeletionRequests();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel deletion request');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToDeletion = async (matchId, accept) => {
    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/matches/respond-delete/${matchId}`, 
        { accept },
        { withCredentials: true }
      );
      await fetchData();
      await fetchDeletionRequests();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to respond to deletion request');
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter(match =>
    activeTab === 'history' ? match.status === 'accepted' : 
    activeTab === 'pending' ? match.status === 'pending' || 
                             (match.status === 'rejected' && match.created_by === currentUserId) : false
  );

  const hasDeletionRequests = Object.values(deletionRequests).some(
    request => request.requested_by !== currentUserId
  );

  return (
    <div className="relative min-h-screen bg-gray-100 overflow-hidden">
      {/* Background Image */}
      <div
        className="fixed inset-0 w-full h-full z-0"
        style={{
          backgroundImage: `url(${footballBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed"
        }}
      />
      
     {/* Header */}
      <header className="w-full flex flex-row justify-between items-center px-2 py-2 sm:px-4 sm:py-3 text-white fixed z-30 bg-black/70 backdrop-blur-sm">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">PesScore</h2>
        <Link
           to="/list-friend"
          className="font-almarai bg-white/20 hover:bg-white/40 text-white font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition text-xs sm:text-sm md:text-base flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          العودة إلى السابق
        </Link>
      </header>
    
      {/* Main Content */}
<main className="relative  z-10 flex flex-col items-center min-h-screen pt-16 pb-20 px-1 sm:px-4">
  <section className="bg-white/90 backdrop-blur-sm p-3 xs:p-4 sm:p-8 rounded-xl shadow-xl w-full max-w-full xs:max-w-md sm:max-w-2xl mx-auto">
    {/* Error and Loading States */}
    {error && (
      <div className="bg-red-50 text-red-600 text-center p-3 rounded-md mb-4 text-sm font-almarai">
        {error}
      </div>
    )}
    {loading && (
      <div className="flex justify-center py-8">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )}

    {!loading && (
      <>
        {/* Friend Info Header */}
        <div className="flex justify-between mb-6">
          <div className="flex flex-col justify-center items-start">
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-800 break-words font-almarai">
              {friend.name_account}
            </h2>
            <p className="text-xs xs:text-sm text-gray-500 break-all font-almarai">ID: {friend.id_account}</p>
          </div>

          {friendship.status === 'active' ? (
            <Link
              to={`/newmatch/${id}`}
              className="inline-flex items-center justify-center px-3 sm:px-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-600 text-xs sm:text-base font-almarai"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              <span>مباراة جديدة</span>
            </Link>
          ) : (
            <span
              className="inline-flex items-center justify-center px-3 sm:px-2 bg-gray-400 text-white font-medium rounded-full shadow-md text-xs sm:text-base cursor-not-allowed font-almarai"
              title="لا يمكن إنشاء مباراة جديدة أثناء وجود طلب إزالة معلق"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              <span>مباراة جديدة</span>
            </span>
          )}
        </div>

        {/* Friendship Removal Request Message */}
        {friendship.status === 'pending_removal' && (
          <div className="mb-4 p-4 bg-red-100 rounded-md">
            <p className="text-sm text-red-800 font-almarai">
              {friendship.requested_by === currentUserId
                ? 'لقد طلبت إزالة هذا الصديق.'
                : 'هذا الصديق قد طلب إنهاء الصداقة.'}
            </p>
          </div>
        )}

        <div className="mb-1 text-xs xs:text-sm font-almarai">
          إجمالي المباريات: <span className='font-bold text-blue-600'>{filteredMatches ? filteredMatches.length : 0}</span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => handleTabChange('history')}
            className={`flex-1 py-2 font-medium text-xs xs:text-sm sm:text-base flex items-center justify-center gap-2 font-almarai ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>المباريات</span>
            {hasDeletionRequests && (
              <span className="inline-flex items-center justify-center w-4 h-4 xs:w-5 xs:h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                !
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange('pending')}
            className={`flex-1 py-2 font-medium text-xs xs:text-sm sm:text-base flex items-center justify-center gap-2 font-almarai ${
              activeTab === 'pending'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>المعلقة</span>
            {(receivedPendingCount > 0 || rejectedCount > 0) && (
              <span className="inline-flex items-center justify-center w-4 h-4 xs:w-5 xs:h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                {receivedPendingCount + rejectedCount}
              </span>
            )}
          </button>
        </div>

        {/* Matches List */}
        <div className="max-h-[380px] overflow-y-auto space-y-2">
          {filteredMatches.length === 0 ? (
            <div className="text-center py-6 xs:py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 xs:h-12 xs:w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-base xs:text-lg font-medium text-gray-900 font-almarai">
                لا توجد مباريات {activeTab === 'history' ? 'في التاريخ' : 'معلقة'} تم العثور عليها
              </h3>
              <p className="mt-1 text-xs xs:text-sm text-gray-500 font-almarai">
                {activeTab === 'history'
                  ? 'سجل مبارياتك مع هذا الصديق سيظهر هنا'
                  : 'طلبات المباريات المعلقة ستظهر هنا'}
              </p>
            </div>
          ) : (
            filteredMatches.map(match => (
              <div
                key={match.id}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex justify-between items-center w-full">
                    <div className="text-center">
                      <p className="text-lg xs:text-xl font-bold text-blue-600">
                        {match.player1_score}
                      </p>
                      <p className="text-xs text-gray-500 font-almarai">
                        <span className="block sm:hidden">
                          {truncateName(match.player1_name)}
                        </span>
                        <span className="hidden sm:block">
                          {match.player1_name}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col items-center">
                      <p className="text-xs flex flex-col items-center font-almarai">
                        <span className='text-gray-500'>{new Date(match.match_date).toLocaleDateString()}</span> 
                        {match.winner_id === null || match.winner_id === 0 ? (
                          <span className='font-bold my-1'>تعادل</span>
                        ) : (
                          <>
                            <span className='font-bold'>الفائز هو</span>
                            <span className='text-blue-600 font-bold my-1'>
                              {match.winner_id === match.player1_id 
                                ? match.player1_name 
                                : match.player2_name}
                            </span>
                          </>
                        )}
                      </p>
                      <div className="flex flex-wrap justify-end gap-2">
                        {activeTab === 'pending' ? (
                          <>
                            {match.status === 'rejected' ? (
                              match.created_by === currentUserId && (
                                <>
                                  <button
                                    onClick={() => handleResendMatch(match.id)}
                                    className="px-3 py-1 bg-blue-500 text-white text-xs sm:text-sm rounded hover:bg-blue-600 transition font-almarai"
                                  >
                                    إعادة إرسال
                                  </button>
                                  <button
                                    onClick={() => handleCancelMatch(match.id)}
                                    className="px-3 py-1 bg-red-500 text-white text-xs sm:text-sm rounded hover:bg-red-600 transition font-almarai"
                                  >
                                    حذف
                                  </button>
                                </>
                              )
                            ) : match.created_by === currentUserId ? (
                              <button
                                onClick={() => handleCancelMatch(match.id)}
                                className="px-3 py-1 bg-red-500 text-white text-xs sm:text-sm rounded hover:bg-red-600 transition font-almarai"
                              >
                                إلغاء
                              </button>
                            ) : match.player2_id === currentUserId && match.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleAcceptMatch(match.id)}
                                  className="px-3 py-1 bg-green-500 text-white text-xs sm:text-sm rounded hover:bg-green-600 transition font-almarai"
                                >
                                  قبول
                                </button>
                                <button
                                  onClick={() => handleRejectMatch(match.id)}
                                  className="px-3 py-1 bg-red-500 text-white text-xs sm:text-sm rounded hover:bg-red-600 transition font-almarai"
                                >
                                  رفض
                                </button>
                              </>
                            ) : null}
                          </>
                        ) : (
                          <>
                            {deletionRequests[match.id] ? (
                              deletionRequests[match.id].requested_by === currentUserId ? (
                                <button
                                  onClick={() => handleCancelDeletionRequest(match.id)}
                                  className="px-3 py-1 bg-gray-500 text-white text-xs sm:text-sm rounded hover:bg-gray-600 transition font-almarai"
                                >
                                  إلغاء
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleRespondToDeletion(match.id, true)}
                                    className="px-3 py-1 bg-green-500 text-white text-xs sm:text-sm rounded hover:bg-green-600 transition font-almarai"
                                  >
                                    قبول
                                  </button>
                                  <button
                                    onClick={() => handleRespondToDeletion(match.id, false)}
                                    className="px-3 py-1 bg-red-500 text-white text-xs sm:text-sm rounded hover:bg-red-600 transition font-almarai"
                                  >
                                    رفض
                                  </button>
                                </>
                              )
                            ) : (
                              <button
                                onClick={() => handleRequestDeletion(match.id)}
                                className="px-3 py-1 bg-red-500 text-white text-xs sm:text-sm rounded hover:bg-red-600 transition font-almarai"
                              >
                                حذف
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-lg xs:text-xl font-bold text-blue-600">
                        {match.player2_score}
                      </p>
                      <p className="text-xs text-gray-500 font-almarai">
                        <span className="block sm:hidden">
                          {truncateName(match.player2_name)}
                        </span>
                        <span className="hidden sm:block">
                          {match.player2_name}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </>
    )}
  </section>
</main>
    
    {/* Footer */}
       <footer className="fixed bottom-0 w-full bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white py-4 text-xs xs:text-sm z-10 shadow-lg">
         <div className="container mx-auto px-4 text-center font-almarai">
           <p className="text-gray-200">
             تم التطوير بواسطة <span dir="ltr">Mohammed elghandori</span>. للاقتراحات أو المشاكل،{" "}
             <Link
               to="/Developer"
               className="text-blue-200 underline hover:text-white transition-colors duration-200 font-semibold"
             >
               تواصل معي
             </Link>
           </p>
         </div>
       </footer>
    </div>
  );
}

export default Detailsfriend;