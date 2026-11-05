
"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

const quickLinks = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Certificates", href: "#certificates" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export default function PublicFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#0D172A] text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_40%,rgba(6,182,212,0.09),transparent_45%)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-12 sm:px-10">
        {/* Name and description */}
        <div className="text-center">
          <Link
            href="#hero"
            className="inline-block text-3xl font-extrabold tracking-tight transition-all duration-300 hover:text-cyan-400 hover:drop-shadow-[0_0_15px_rgba(34,211,238,0.35)]"
          >
            Tolesa Mosisa
          </Link>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Driven by creativity, technology, and innovation to build
            meaningful digital experiences and impactful solutions.
          </p>
        </div>

        {/* Quick Links */}
        <div className="mt-8 text-center">
          <h3 className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-400">
            Quick Links
          </h3>

          <nav className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="group relative text-sm font-medium text-slate-300 transition-colors duration-300 hover:text-cyan-400"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-[2px] w-0 rounded-full bg-cyan-400 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>
        </div>

        {/* Contact Information */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
          {/* Email */}
          <a
            href="mailto:tolosatolesa@gmail.com"
            className="group flex items-center gap-2.5 text-sm text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:text-cyan-400"
          >
            <Mail
              size={17}
              className="text-cyan-400 transition-transform duration-300 group-hover:scale-125"
            />
            tolosatolesa@gmail.com
          </a>

          {/* Phone */}
          <a
            href="tel:+251989291178"
            className="group flex items-center gap-2.5 text-sm text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:text-cyan-400"
          >
            <Phone
              size={17}
              className="text-cyan-400 transition-transform duration-300 group-hover:scale-125"
            />
            0989291178
          </a>

          {/* Location */}
          <div className="group flex items-center gap-2.5 text-sm text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:text-cyan-400">
            <MapPin
              size={17}
              className="text-cyan-400 transition-transform duration-300 group-hover:scale-125"
            />
            Ethiopia, Oromia, Asella
          </div>
        </div>

        {/* Divider */}
        <div className="mt-9 border-t border-white/10" />

        {/* Copyright */}
        <div className="pt-6 text-center">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Tolesa Mosisa.
            {" "}All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
