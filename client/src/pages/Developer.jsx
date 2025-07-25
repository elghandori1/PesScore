import React from "react";
import { FaDiscord, FaXTwitter, FaLinkedin } from "react-icons/fa6";
import profileImage from "../assets/images/intraProf.jpg";

function Developer() {

  return (
    <div className="flex flex-col items-center mt-8 px-4 py-2 z-20">
      <div className="text-gray-300 text-sm sm:text-base text-center max-w-md mb-4 bg-blue-700 p-4 rounded-lg">
        تم تطوير هذا الموقع بواسطة محمد الغنضوري. إذا واجهت أي مشاكل أو كانت لديك أفكار لإضافات جديدة، لا تتردد في التواصل معي.
      </div>
      <div className="bg-gray-800 rounded-lg shadow-xl p-4 sm:p-8 w-full sm:max-w-md border border-gray-700 ">
       
        <div className="flex flex-col items-center">
          <img
            src={profileImage}
            alt="صورة المطور"
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-blue-600"
          />
             <h2 className="mt-3 sm:mt-4 text-xl sm:text-2xl font-bold text-gray-100">Mohammed elghandori</h2>
          <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">Full Stack Developer</p>
          
          <div className="mt-4 w-full space-y-2 sm:space-y-3">
            <a href="https://discord.com" 
               className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base">
              <FaDiscord className="text-[#5865F2]" />
              <span className="text-gray-300">elghandouri1</span>
            </a>
            
            <a href="https://x.com/elghandouri1" 
               className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base">
              <FaXTwitter className="text-gray-300" />
              <span className="text-gray-300">@elghandouri1</span>
            </a>

            <a href="https://www.linkedin.com/in/mohammed-elghandori-628b19209" 
               className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base">
              <FaLinkedin className="text-[#0A66C2]" />
              <span className="text-gray-300">Mohammed elghandori</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Developer;