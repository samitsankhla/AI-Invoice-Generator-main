import { TESTIMONIALS } from '../../utils/data';
import { Quote } from 'lucide-react';

const Testimonials = () => {
	return (
		<section className="w-full bg-white py-16 px-4" id="testimonials">
			<div className="max-w-4xl mx-auto text-center mb-12">
				<h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">What Our Customers Say</h2>
				<p className="text-gray-500 text-lg">We are trusted by thousands of small businesses.</p>
			</div>
			<div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
				{TESTIMONIALS.map((t, idx) => (
					<div
						key={idx}
						className="bg-gray-50 rounded-2xl shadow-sm p-8 flex flex-col items-start relative hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
					>
						<div className="absolute -top-6 left-6 bg-blue-900 text-white w-10 h-10 flex items-center justify-center rounded-full text-xl font-bold shadow">
                            <Quote className="w-5 h-5" />
						</div>
						<p className="text-gray-700 italic mb-8 mt-6">"{t.quote}"</p>
						<div className="flex items-center gap-4 mt-auto">
							<img src={t.avatar} alt={t.author} className="w-12 h-12 rounded-full bg-black object-cover" />
							<div>
								<div className="font-bold text-gray-900">{t.author}</div>
								<div className="text-gray-500 text-sm">{t.title}</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
};

export default Testimonials;
