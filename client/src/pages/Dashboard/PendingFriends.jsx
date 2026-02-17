import { useState, useEffect, useCallback } from "react";
import { useMessage } from "../../hooks/useMessage";
import { useSocketContext } from "../../context/SocketContext";
import axiosClient from "../../api/axiosClient";

function PendingFriends({ onRequestsUpdate }) {
  const [activeTab, setActiveTab] = useState("received");
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showMessage, clearMessage } = useMessage();
  const socketRef = useSocketContext();

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    clearMessage();

    try {
      const [receivedRes, sentRes] = await Promise.all([
        axiosClient.get("/friend/received"),
        axiosClient.get("/friend/pending"),
      ]);

      setReceivedRequests(receivedRes.data.user || []);
      setSentRequests(sentRes.data.user || []);
    } catch (err) {
      showMessage(
        err.response?.data?.message || "حدث خطأ أثناء جلب الطلبات",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [activeTab, fetchRequests]);

  useEffect(() => {
    const s = socketRef?.current;
    if (!s) return;
    s.on("friend:request", fetchRequests);
    s.on("friend:requestCancelled", fetchRequests);
    s.on("friend:accepted", fetchRequests);
    s.on("friend:rejected", fetchRequests);
    return () => {
      s.off("friend:request", fetchRequests);
      s.off("friend:requestCancelled", fetchRequests);
      s.off("friend:accepted", fetchRequests);
      s.off("friend:rejected", fetchRequests);
    };
  }, [socketRef, fetchRequests]);

  const handleCancelRequest = async (requestId) => {
    clearMessage();
    try {
     const res=await axiosClient.delete(`/friend/request/${requestId}`);
     setSentRequests((prev) => prev.filter((r) => r.id !== requestId));
     showMessage(res.data.message || "تم إلغاء طلب الصداقة بنجاح", "success");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "حدث خطأ أثناء إلغاء طلب الصداقة",
        "error"
      );
    }
  };

const handleAcceptRequest = async (requestId) => {
    clearMessage();
    try {
      const res = await axiosClient.post(`/friend/accept-request/${requestId}`);
      setReceivedRequests((prev) => {
        const updated = prev.filter((r) => r.id !== requestId);
        // Notify parent component about the update
        onRequestsUpdate(updated);
        return updated;
      });
      showMessage(res.data.message || "تم قبول طلب الصداقة بنجاح", "success");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "حدث خطأ أثناء قبول طلب الصداقة",
        "error"
      );
    }
  };

  const handleRejectRequest = async (requestId) => {
    clearMessage();
    try {
      await axiosClient.delete(`/friend/reject-request/${requestId}`);
      setReceivedRequests((prev) => {
        const updated = prev.filter((r) => r.id !== requestId);
        // Notify parent component about the update
        onRequestsUpdate(updated);
        return updated;
      });
      showMessage("تم رفض طلب الصداقة بنجاح", "success");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "حدث خطأ أثناء رفض طلب الصداقة",
        "error"
      );
    }
  };

const renderRequestItem = (request, isReceived) => (
  <div
    key={request.id}
    className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-200"
  > 
    <div>
      <p className="font-medium text-sm text-gray-700">
        {request.name_account}
      </p>
      <p className="text-xs text-blue-600">
        ID: {request.id_account}
      </p>
      <p className="text-[10px] text-gray-600">
        {new Date(request.created_at).toLocaleDateString()}
      </p>
    </div>

    {isReceived ? (
      <div className="flex gap-1">
        <button
          className="px-2 py-1 bg-green-500 text-white rounded text-xs"
          onClick={() => handleAcceptRequest(request.id)}
        >
          قبول
        </button>
        <button
          onClick={()=> handleRejectRequest(request.id)}
          className="px-2 py-1 bg-red-500 text-white rounded text-xs">
          رفض
        </button>
      </div>
    ) : (
      <button
        onClick={() => handleCancelRequest(request.id)}
        className="px-2 py-1 bg-red-500 text-white rounded text-xs"
      >
        إلغاء
      </button>
    )}
  </div>
);

const renderEmptyMessage = (text) => (
  <div className="py-6 text-center text-gray-500 text-sm">
    <svg
      className="w-8 h-8 mx-auto mb-2 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
    {text}
  </div>
);

const currentRequests =
  activeTab === "received" ? receivedRequests : sentRequests;

return (
  <div className="w-full mt-2 rounded-lg overflow-hidden border border-gray-300 bg-white shadow">
    {/* Tabs */}
    <div className="flex w-full text-center text-sm">
      <button
        className={`w-1/2 py-2 font-medium flex justify-center items-center gap-1 ${
          activeTab === "received"
            ? "bg-blue-500 text-white"
            : "bg-gray-100 text-gray-600"
        }`}
        onClick={() => setActiveTab("received")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
        الواردة
      </button>
      <button
        className={`w-1/2 py-2 font-medium flex justify-center items-center gap-1 ${
          activeTab === "sent"
            ? "bg-blue-500 text-white"
            : "bg-gray-100 text-gray-600"
        }`}
        onClick={() => setActiveTab("sent")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
        المرسلة
      </button>
    </div>

    {/* Content */}
    {isLoading ? (
      <div className="py-6 text-center">
        <div className="flex justify-center py-4">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-gray-600 text-sm">
          جاري التحميل...
        </p>
      </div>
    ) : (
      <div className="max-h-[360px] overflow-y-auto space-y-2 p-1">
        {currentRequests.length > 0
          ? currentRequests.map((req) =>
              renderRequestItem(req, activeTab === "received")
            )
          : renderEmptyMessage(
              activeTab === "received"
                ? "لا توجد طلبات واردة"
                : "لا توجد طلبات مرسلة"
            )}
      </div>
    )}
  </div>
);
}

export default PendingFriends;