"use client";

import React, { useState } from "react";
import FormInput from "@/components/ui/FormInput";
import FormTextarea from "@/components/ui/FormTextarea";

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    enquiryType: "",
    message: "",
    agreedToPolicy: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <section
      id="contact"
      className="w-full min-h-screen py-24 md:py-32 px-6 flex items-center justify-center relative overflow-hidden bg-[#10100E]"
    >
      <div className="w-full max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column */}
        <div className="lg:col-span-5 flex flex-col max-w-[510px]">
          <span className="font-['Outfit'] font-light text-[20px] md:text-[24px] tracking-[-0.04em] text-[#6B6B67] mb-6 select-none">
            Get in touch
          </span>
          <h2 className="font-['Outfit'] font-medium text-[32px] sm:text-[40px] md:text-[45px] leading-[1.4] text-white tracking-[-0.02em]">
            <span className="text-[#EE0000]">Have an idea</span> worth building or a brand ready to
            evolve? Let’s make it distinctive<span className="text-[#EE0000]">.</span>
          </h2>
        </div>

        {/* Right Column: Form Card */}
        <div className="lg:col-span-7 flex justify-end">
          <div className="w-full max-w-[651px] bg-[#000000] border border-white/[0.08] rounded-[24px] p-8 md:p-12 shadow-2xl flex flex-col">
            <h3 className="font-['Outfit'] font-normal text-[26px] sm:text-[32px] leading-tight text-white mb-10 select-none">
              Fill in this form
              <br />
              and we’ll reach out<span className="text-[#EE0000]">.</span>
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  type="text"
                  placeholder="Full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
                <FormInput
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  type="text"
                  placeholder="Company name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
                <div className="relative">
                  <select
                    value={formData.enquiryType}
                    onChange={(e) => setFormData({ ...formData, enquiryType: e.target.value })}
                    className="w-full h-[56px] px-5 rounded-[14px] bg-[#181816] border border-transparent text-white font-['Outfit'] text-[15px] appearance-none focus:outline-none focus:border-[#EE0000]/70 focus:ring-1 focus:ring-[#EE0000]/40 transition-all cursor-pointer"
                  >
                    <option value="" disabled className="text-[#6B6B67] bg-[#181816]">
                      Type of enquiry
                    </option>
                    <option value="brand" className="bg-[#181816] text-white">
                      Brand Strategy & Identity
                    </option>
                    <option value="product" className="bg-[#181816] text-white">
                      Digital Product Design
                    </option>
                    <option value="web" className="bg-[#181816] text-white">
                      Web Development & CMS
                    </option>
                    <option value="partnership" className="bg-[#181816] text-white">
                      Retainer / Advisory
                    </option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B6B67]">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path
                        d="M1 1.5L6 6.5L11 1.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Row 3 */}
              <FormTextarea
                rows={4}
                placeholder="Message (optional)"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />

              {/* Row 4: Privacy & Submit */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mt-4">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.agreedToPolicy}
                    onChange={(e) => setFormData({ ...formData, agreedToPolicy: e.target.checked })}
                    className="w-5 h-5 rounded-[6px] bg-[#181816] border border-[#2A2A26] checked:bg-[#EE0000] accent-[#EE0000] cursor-pointer"
                  />
                  <span className="font-['Outfit'] font-normal text-[14px] text-white">
                    I have read and agree to the{" "}
                    <a href="#privacy" className="underline hover:text-[#EE0000] transition-colors">
                      Privacy Policy ↗
                    </a>
                  </span>
                </label>

                <button
                  type="submit"
                  className="px-8 py-2.5 rounded-full bg-[#EE0000] text-white font-['Outfit'] font-normal text-[20px] tracking-[-0.04em] hover:bg-white hover:text-black transition-all duration-200 shadow-lg shadow-[#EE0000]/30 cursor-pointer"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
