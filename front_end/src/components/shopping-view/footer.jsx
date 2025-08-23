import {FaFacebook, FaYoutube, FaInstagram} from "react-icons/fa";
import {Link} from "react-router-dom";
import PaymentMethod from "@/assets/imgs/paymentmethod.webp";

import DMCABadge from "@/assets/imgs/dmca.png"; // Thêm ảnh DMCA badge
import BBT from "@/assets/imgs/bocongthuong.png"; // Thêm ảnh BBT badge
import {ICQRWebsite} from "../Icon/ICQRWebsite";

function Footer() {
  return (
    <footer className="bg-black text-white border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-bold mb-4">ECOMMERCE Joint Stock Company</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-xl">Head office:</span> No. 688 Quang
                Trung Street, La Khe Ward, Ha Dong District, Hanoi City
              </p>
              <p>
                <span className="text-xl">Phone:</span> +84243 - 7303.0222
              </p>
              <p>
                <span className="text-xl">Fax:</span> +84243 - 6277.6419
              </p>
              <p>
                <span className="text-xl">Email:</span> hello@ECOMMERCE.com
              </p>
            </div>
            <div className="flex space-x-4 mt-4">
              <FaFacebook className="w-6 h-6" />
              <FaInstagram className="w-6 h-6" />
              <FaYoutube className="w-6 h-6" />
            </div>
          </div>

          {/* Brand */}
          <div>
            <h3 className="font-bold mb-4">BRAND</h3>
            <ul className="space-y-2">
              <li className="hover:underline">
                <Link to="/about">About us</Link>
              </li>
              <li className="hover:underline">
                <Link to="/career">Recruitment</Link>
              </li>
              <li className="hover:underline">
                <Link to="/system">Store system</Link>
              </li>
              <li className="hover:underline">
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold mb-4">SUPPORT</h3>
            <ul className="space-y-2">
              <li className="hover:underline">
                <Link to="/faq">Q&A</Link>
              </li>
              <li className="hover:underline">
                <Link to="/shipping">Shipping policy</Link>
              </li>
              <li className="hover:underline">
                <Link to="/warranty">Information security policy</Link>
              </li>
            </ul>
          </div>

          {/* App Download */}
          <div>
            <h3 className="font-bold mb-4">Link QR</h3>
            <p className="text-xl mb-4">QR website</p>
            <div className="flex space-x-4 mb-4">
              <ICQRWebsite className="w-24 h-24" />
            </div>
            <p className="text-xl mb-4">Payment Method</p>
            <img src={PaymentMethod} alt="Payment Methods" />
          </div>
        </div>

        <div className="border-t mt-8 pt-4 flex justify-between items-center">
          <p>© 2023 ECOMMERCE</p>
          <div className="flex items-center space-x-4">
            <img src={DMCABadge} alt="DMCA Badge" className="h-8" />
            <img src={BBT} alt="DMCA Badge" className="h-8" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
