import {  useParams } from "react-router-dom";

function FriendDetails() {
  const { id } = useParams();

  return (
    <main  dir="rtl" className="flex flex-col items-center w-full px-2 xs:px-3 sm:px-6 md:px-8 pt-10 xs:pb-14">
      <section className="bg-white/90 backdrop-blur-sm p-3 sm:p-6 rounded-xl shadow-xl w-full max-w-lg sm:max-w-2xl mx-auto">
       <h1 className="text-2xl font-bold mb-4">تفاصيل الصديق</h1>
      <p className="text-lg">معرف الصديق: {id}</p>
      </section>
     
    </main>
  );
}
export default FriendDetails;