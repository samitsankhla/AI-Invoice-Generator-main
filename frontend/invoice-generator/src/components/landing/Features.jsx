import { features } from '../../utils/data';

const Features = () => {
	return (
		<section className="w-full bg-gray-50 py-16 px-4" id="features">
			<div className="max-w-6xl mx-auto text-center mb-12">
				<h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Powerful Features to Run Your Business</h2>
				<p className="text-gray-500 text-lg">Everything you need to manage your invoicing and get paid.</p>
			</div>
			<div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
				{features.map((feature, idx) => (
					<div
						key={idx}
						className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-start hover:shadow-lg hover:-translate-y-1 border border-gray-100 transition-all duration-300"
					>
						<div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-xl mb-4">
							{feature.icon && <feature.icon size={32} className="text-blue-900" />}
						</div>
						<h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
						<p className="text-gray-500 mb-4 text-sm">{feature.description}</p>
						<a href={feature.link} className="text-blue-900 font-semibold text-sm flex items-center gap-1 hover:underline">
							Learn More <span aria-hidden="true">→</span>
						</a>
					</div>
				))}
			</div>
		</section>
	);
};

export default Features;
