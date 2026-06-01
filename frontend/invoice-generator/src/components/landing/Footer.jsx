import { Link } from 'react-router-dom';
import { Twitter, Github, Linkedin, FileText } from 'lucide-react';

const FooterLink = ({ href, to, children }) => {
	const className = 'block text-gray-400 hover:text-white transition-colors duration-200';
	if (to) {
		return <Link to={to} className={className}>{children}</Link>;
	}
	return <a href={href} className={className}>{children}</a>;
};

const SocialLink = ({ href, children }) => (
	<a
		href={href}
		className="w-10 h-10 bg-blue-950 rounded-lg flex items-center justify-center text-white hover:bg-blue-900 transition-colors duration-200 mr-2"
		target="_blank"
		rel="noopener noreferrer"
	>
		{children}
	</a>
);


const currentYear = new Date().getFullYear();

const Footer = () => {
	return (
		<footer className="bg-blue-950 text-white pt-16 pb-8 px-4">
			<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
				<div>
					<div className="flex items-center mb-3">
						<span className="w-8 h-8 bg-blue-900 rounded-md flex items-center justify-center mr-2">
							<FileText className="w-5 h-5 text-white" />
						</span>
						<span className="text-xl font-bold text-white">AI Invoice App</span>
					</div>
					<p className="text-gray-400 text-sm">The simplest way to create and send professional invoices.</p>
				</div>
				<div>
					<h3 className="font-semibold mb-3">Product</h3>
					<ul className="space-y-2">
						<li><FooterLink href="#features">Features</FooterLink></li>
						<li><FooterLink href="#testimonials">Testimonials</FooterLink></li>
						<li><FooterLink href="#faq">FAQ</FooterLink></li>
					</ul>
				</div>
				<div>
					<h3 className="font-semibold mb-3">Company</h3>
					<ul className="space-y-2">
						<li><FooterLink to="/about">About Us</FooterLink></li>
						<li><FooterLink to="/contact">Contact</FooterLink></li>
					</ul>
				</div>
				<div>
					<h3 className="font-semibold mb-3">Legal</h3>
					<ul className="space-y-2">
						<li><FooterLink to="/privacy">Privacy Policy</FooterLink></li>
						<li><FooterLink to="/terms">Terms of Service</FooterLink></li>
					</ul>
				</div>
			</div>
			<div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between border-t border-blue-900 pt-8">
				<p className="text-gray-400 text-sm mb-4 md:mb-0">&copy; { currentYear } AI Invoice App. All rights reserved.</p>
				<div className="flex">
					<SocialLink href="#"><Twitter className="w-5 h-5" /></SocialLink>
					<SocialLink href="#"><Github className="w-5 h-5" /></SocialLink>
					<SocialLink href="#"><Linkedin className="w-5 h-5" /></SocialLink>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
