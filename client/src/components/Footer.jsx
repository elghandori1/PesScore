import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 w-full bg-blue-800 text-white py-2 sm:py-3 text-center">
      <div className="max-w-4xl mx-auto px-4">

        <div className="block sm:flex sm:justify-between sm:items-center">
          <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-0">
            PesScore © {new Date().getFullYear()}
          </p>
          
          <p className="text-[0.7rem] sm:text-xs text-blue-100">
            تم التطوير بواسطة 
            <span dir="ltr" className="mx-1">Mohammed elghandori</span>
            <Link 
              to="/Developer" 
              className="text-blue-200 hover:text-white underline mx-1"
            >
              تواصل معي
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;