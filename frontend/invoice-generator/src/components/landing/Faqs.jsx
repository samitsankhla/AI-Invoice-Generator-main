import React, { useState } from "react";
import { Plus } from "lucide-react";
import { FAQS } from "../../utils/data";

const FaqItem = ({ faq, isOpen, onClick }) => (
	<div className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-white">
		<button
			onClick={onClick}
			className="w-full flex items-center justify-between p-6 bg-white focus:outline-none"
		>
			<span className="text-lg font-medium text-gray-900 pr-4 text-left">{faq.question}</span>
			<Plus
				className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-135" : ""}`}
			/>
		</button>
		{isOpen && (
			<div className="px-6 pt-0 pb-6 text-gray-600 leading-relaxed border-t border-gray-100">
				{faq.answer}
			</div>
		)}
	</div>
);

const Faqs = () => {
	const [openIndex, setOpenIndex] = useState(null);

	const handleClick = (index) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	return (
		<section id="faq" className="py-20 lg:py-28 bg-white">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				<h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 text-center">Frequently Asked Questions</h2>
				<p className="text-xl text-gray-500 max-w-3xl mx-auto text-center mb-12">
					Everything you need to know about the product and billing.
				</p>
				<div className="space-y-4">
					{FAQS.map((faq, idx) => (
						<FaqItem
							key={idx}
							faq={faq}
							isOpen={openIndex === idx}
							onClick={() => handleClick(idx)}
						/>
					))}
				</div>
			</div>
		</section>
	);
};

export default Faqs;
