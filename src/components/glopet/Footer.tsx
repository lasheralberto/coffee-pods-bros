import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="px-4 md:px-10 lg:px-16 pb-10">
      <div className="max-w-[1160px] mx-auto border-t border-[#d8c7a5] pt-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="glopet-title text-2xl text-[#1a3a5c]">GLOPET</p>
          <p className="text-sm text-[#4c4038] mt-1">Cafe mediterraneo para sobremesas sin prisa.</p>
        </div>

        <div className="flex items-center gap-5 text-sm text-[#1a3a5c]">
          <span className="text-[#1a3a5c] opacity-70">Instagram</span>
          <span className="text-[#1a3a5c] opacity-70">TikTok</span>
          <span className="text-[#1a3a5c] opacity-70">Pinterest</span>
        </div>

        <div className="flex items-center gap-5 text-sm text-[#1a3a5c]">
          <Link to="/privacy" className="text-[#1a3a5c] hover:text-[#c4763a]">Privacidad</Link>
          <Link to="/terms" className="text-[#1a3a5c] hover:text-[#c4763a]">Terminos</Link>
          <Link to="/cookies" className="text-[#1a3a5c] hover:text-[#c4763a]">Cookies</Link>
        </div>
      </div>
    </footer>
  );
};
