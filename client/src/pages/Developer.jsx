import React from "react";
import { FaDiscord, FaXTwitter, FaLinkedin, FaWhatsapp } from "react-icons/fa6";

function Developer() {

  return (
    <div className="flex flex-col items-center mt-8 px-4 py-2 z-20">
      <div className="text-gray-300 text-sm sm:text-base text-center max-w-md mb-4 bg-blue-700 p-4 rounded-lg">
        تم تطوير هذا الموقع بواسطة محمد الغنضوري. إذا واجهت أي مشاكل أو كانت لديك أفكار لإضافات جديدة، لا تتردد في التواصل معي
      </div>
      <div className="bg-gray-800 rounded-lg shadow-xl p-4 sm:p-8 w-full sm:max-w-md border border-gray-700 ">
       
        <div className="flex flex-col items-center">

          <div className="w-full space-y-2 sm:space-y-3">
            {/* <a href="https://web.whatsapp.com" 
               className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base">
              <FaWhatsapp className="text-gray-300" />
              <span className="text-gray-300">07</span>
            </a> */}

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