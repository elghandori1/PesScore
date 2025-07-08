import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <footer className="w-full  bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white py-3 text-xs xs:text-sm">
       <div className="container mx-auto px-4 text-center">
          <p className="mb-0.5 font-medium">PesScore © {new Date().getFullYear()}</p>
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
  );
};

export default Footer;
