import React from "react";
import { FaDiscord, FaXTwitter, FaEnvelope, FaLinkedin } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import profileImage from "../assets/images/intraProf.jpg";

function Developer() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 px-4 py-6">
      <div className="text-gray-300 text-sm sm:text-base text-center max-w-md mb-4 bg-gray-600 p-4 rounded-lg">
      This website was developed by Mohammed elghandori If you run into any problems or have ideas for new additions, please don't hesitate to contact me.
      </div>
      <div className="bg-gray-800 rounded-lg shadow-xl p-4 sm:p-8 w-full sm:max-w-md border border-gray-700 relative">
        <button
          onClick={() => navigate('/')}
          className="absolute top-2 left-2 sm:top-4 sm:left-4 px-3 py-1 sm:px-4 sm:py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
        >
          ← Back
        </button>
        <div className="flex flex-col items-center mt-8 sm:mt-0">
          <img
            src={profileImage}
            alt="Developer Profile"
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-gray-600"
          />
          <h2 className="mt-3 sm:mt-4 text-xl sm:text-2xl font-bold text-gray-100">Mohammed elghandori</h2>
          <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">Full Stack Developer</p>
          
          <div className="mt-4 sm:mt-6 w-full space-y-2 sm:space-y-3">
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

            <a href="https://linkedin.com/in/yourusername" 
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