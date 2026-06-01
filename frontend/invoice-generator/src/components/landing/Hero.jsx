import { Link } from "react-router-dom";
import HER0_IMG from '../../assets/hero-img.png';
import { useAuth } from '../../context/AuthContext';

const Hero = () => {
    const { isAuthenticated } = useAuth();
	return (
		<section className="relative bg-[#fbfbfb] overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:100px_100px]"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                <div className="text-center max-w-4xl mx-auto">
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-blue-950 leading-tight mb-6">
                        AI-Powered Invoicing Made Effortless
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-700 mb-8 leading-related max-w-3xl mx-auto">
                        Let Our AI create invoices from simple text, generate payment reminders and provide smart insights to help you manage your finances.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center">
                        {isAuthenticated ?(
                            <Link to="/dashboard" className="bg-gradient-to-r from-blue-950 to-blue-900 text-white px-8 py-4 rounded-xl font-bold hover-bg-blue-900 transition-all duration-200 hover:scale-105 hover:shadow-2xl transform">
                                Go to Dashboard
                            </Link>
                        ) : (
                            <Link to="/signup" className="bg-gradient-to-r from-blue-950 to-blue-900 text-white px-8 py-4 rounded-xl font-bold hover-bg-blue-900 transition-all duration-200 hover:scale-105 hover:shadow-2xl transform">
                                Get Started for Free
                            </Link>
                        )}
                        <a href="#features" className="border-2 border-black text-black px-8 py-4 rounded-xl font-bold text-lg mt-4 sm:mt-0 sm:ml-4 hover:bg-white hover:text-black transition-all duration-200 hover:scale-105 hover:shadow-lg transform">
                            Learn More
                        </a>
                    </div>
                    <div className="mt-12">
                        <img
                            src={HER0_IMG}
                            alt="AI Invoice Example"
                            className="mx-auto w-full max-w-3xl rounded-xl shadow-lg"
                        />
                    </div>
                </div>
            </div>
		</section>
	);
};

export default Hero;
