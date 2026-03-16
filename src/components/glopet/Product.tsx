import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody } from '@heroui/react';

const highlights = [
  {
    title: 'Origen',
    value: 'De las mejores fincas del mundo, directo a tu taza',
    position: { bottom: '14%', left: '4%' },
    rotate: '-3deg',
    delay: 0.2,
  },
  {
    title: 'Tueste',
    value: 'Tostado a mano, en pequeños lotes, sin prisa',
    position: { top: '38%', left: '36%' },
    rotate: '2.5deg',
    delay: 0.4,
  },
  {
    title: 'Artesanos',
    value: 'Obsesionados con el café. Desde el mediterráneo',
    position: { top: '9%', right: '5%' },
    rotate: '-1.5deg',
    delay: 0.3,
  },
];

const maskImage = [
  'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.12) 6%, rgba(0,0,0,0.45) 14%, rgba(0,0,0,0.96) 24%, rgba(0,0,0,0.96) 76%, rgba(0,0,0,0.45) 86%, rgba(0,0,0,0.12) 94%, rgba(0,0,0,0) 100%)',
  'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.12) 6%, rgba(0,0,0,0.45) 14%, rgba(0,0,0,0.96) 24%, rgba(0,0,0,0.96) 76%, rgba(0,0,0,0.45) 86%, rgba(0,0,0,0.12) 94%, rgba(0,0,0,0) 100%)',
].join(', ');

export const Product: React.FC = () => {
  return (
    <section id="cafe" className="mt-20">
      <div className="relative mx-4 md:mx-10 lg:mx-16">
        {/* Imagen con bordes difuminados */}
        <div
          className="w-full h-[340px] sm:h-[420px] lg:h-[500px] overflow-hidden"
          style={{
            maskImage,
            maskComposite: 'intersect',
            WebkitMaskImage: maskImage,
            WebkitMaskComposite: 'source-in',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: 'cover',
            maskSize: 'cover',
          }}
        >
          <img
            src="/assets/images/hero2.png"
            alt="Mesa mediterranea con cafe y ceramica"
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Cards flotando sobre la imagen */}
        {highlights.map((item) => (
          <motion.div
            key={item.title}
            className="absolute"
            style={{ ...item.position, rotate: item.rotate }}
            initial={{ opacity: 0, y: 18, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: [0.2, 0.65, 0.2, 1], delay: item.delay }}
            whileHover={{ scale: 1.04, rotate: '0deg', transition: { duration: 0.2 } }}
          >
            <Card
              className="border border-[#d8c7a5] bg-[#faf6ef]/88 backdrop-blur-md shadow-xl w-[155px] sm:w-[190px]"
              radius="lg"
            >
              <CardBody className="p-4 md:p-5">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#1a3a5c]">{item.title}</p>
                <p className="mt-2 text-base glopet-title text-[#1c1410] leading-snug">{item.value}</p>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
