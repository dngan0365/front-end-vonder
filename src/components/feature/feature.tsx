'use client'
import Image from "next/image"

export default function Feature() {
  const testimonials = [
    {
      id: 1,
      imageUrl: '/scenery/feature-1.jpg',
      alt: 'Female student with glasses',
      className: 'col-span-2 row-span-2', // Big highlight image
    },
    {
      id: 2,
      imageUrl: '/scenery/feature-3.jpg',
      alt: 'Professional woman in suit',
      className: 'col-span-1 row-span-1',
    },
    {
      id: 3,
      imageUrl: '/scenery/feature-2.jpg',
      alt: 'Male student with red jacket',
      className: 'col-span-1 row-span-2',
    },
    {
      id: 4,
      imageUrl: '/scenery/feature-5.jpg',
      alt: 'Smiling woman with short hair',
      className: 'col-span-2 row-span-2',
    },
  ];

  return (
    <section className="w-full bg-white py-12 px-4 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Text Column */}
          <div className="lg:pr-6">
            <h2 className="text-2xl text-[#4ad4e4] md:text-5xl lg:text-6xl font-bold mb-6">
              Live fully in Vietnam
            </h2>
            <p className="text-gray-700 mb-4 text-sm md:text-base">
              Vietnam opens its door widely to welcome visitors all around the world! Starting from 15th August 2023, Vietnam extends e-visa validity to 90 days and unilateral visa exemption will be valid in 45 days!
            </p>
            <p className="text-gray-700 mb-6 text-sm md:text-base">
              We are more than happy to welcome you all here and admire our stunning landscapes, free your soul on white sandy beaches, experience our unique and beautiful culture and meet the people in the most friendly country. Particularly, to indulge in our scrumptious cuisine at Michelin rated restaurants or to join us in outstanding mega culture, music, sports and tourism events!
            </p>
          </div>

          {/* Right Image Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-3 grid-rows-3 gap-2 sm:gap-4 h-[400px] sm:h-[500px] md:h-[600px] lg:h-[80vh]">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className={`relative overflow-hidden rounded-lg ${testimonial.className}`}
                >
                  <Image
                    src={testimonial.imageUrl}
                    alt={testimonial.alt}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
