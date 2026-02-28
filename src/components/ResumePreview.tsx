import React, { forwardRef } from 'react';
import { ResumeData } from '../types';
import { Phone, Mail, MapPin, Globe, Linkedin, Github } from 'lucide-react';

interface ResumePreviewProps {
  data: ResumeData;
  zoom?: number;
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ data, zoom = 1 }, ref) => {
  // Split work experience: first 2 on page 1, rest on page 2
  const page1Work = data.workExperience.slice(0, 2);
  const page2Work = data.workExperience.slice(2);

  return (
    <div ref={ref} className="w-full flex-1 flex flex-col items-center">
      {/* Container applies scaling to fit smaller screens, keeping exact A4 ratio inner elements */}
      <div
        className={`w-full max-w-[210mm] flex flex-col gap-8 print:gap-0 items-center origin-top transform transition-transform ${zoom === 1 ? 'scale-[0.4] sm:scale-[0.5] md:scale-[0.7] lg:scale-[0.8] xl:scale-100 print:scale-100' : ''}`}
        style={zoom !== 1 ? { transform: `scale(${zoom})`, marginBottom: `${(zoom - 1) * 100}%` } : {}}
      >
        {/* PAGE 1 */}
        <div className="w-[210mm] h-[297mm] bg-[#ffffff] text-[#0f172a] flex overflow-hidden text-[12.5px] shrink-0 shadow-lg print:shadow-none print:break-after-page" style={{ fontFamily: "'Inter', sans-serif" }}>
          {/* Sidebar Page 1 */}
          <div className="w-[300px] bg-[#1e293b] text-[#ffffff] p-8 flex flex-col gap-6 shrink-0">
            {/* Photo Placeholder */}
            <div className="w-40 h-40 rounded-full bg-[#94a3b8] mx-auto overflow-hidden border-4 border-[#ffffff] shrink-0">
              <img src="/profile.png" alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>

            {/* Skills */}
            <div>
              <h2 className="text-[18px] font-bold tracking-[0.15em] uppercase border-b border-[#ffffff33] pb-2 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2 max-h-[265px] overflow-hidden">
                {data.skills.map((skill, index) => (
                  <span key={index} className="bg-[#ffffff] text-[#0f172a] px-2.5 py-1 rounded text-[12px] font-medium leading-none flex items-center h-[22px]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <h2 className="text-[18px] font-bold tracking-[0.15em] uppercase border-b border-[#ffffff33] pb-2 mb-4">Education</h2>
              {data.education.map((edu, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="text-[#ffffff] text-[13px] mb-1 font-medium">{edu.period}</div>
                  <div className="font-bold text-[13px] text-[#ffffff] uppercase">{edu.institution}</div>
                  <div className="text-[13px] text-[#cbd5e1] mt-0.5 leading-tight">{edu.degree}</div>
                </div>
              ))}
            </div>

            {/* Languages */}
            <div>
              <h2 className="text-[18px] font-bold tracking-[0.15em] uppercase border-b border-[#ffffff33] pb-2 mb-4">Languages</h2>
              <ul className="list-disc space-y-1.5 text-[13px] text-[#ffffff] pl-4">
                {data.languages.map((lang, index) => (
                  <li key={index} className="pl-1">{lang}</li>
                ))}
              </ul>
            </div>

            {/* Key Achievements */}
            <div>
              <h2 className="text-[18px] font-bold tracking-[0.15em] uppercase border-b border-[#ffffff33] pb-2 mb-4">Key Achievements</h2>
              <ul className="list-disc space-y-1 text-[13px] text-[#ffffff] pl-4">
                {data.keyAchievements.slice(0, 4).map((achievement, index) => (
                  <li key={index} className="pl-1 leading-tight">{achievement}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content Page 1 */}
          <div className="flex-1 p-10 flex flex-col gap-5">
            {/* Header */}
            <div className="border-b border-[#e2e8f0] pb-5">
              <h1 className="text-[42px] font-black text-[#1e293b] tracking-tight mb-1 uppercase leading-none">{data.name}</h1>
              <h2 className="text-[18px] text-[#64748b] tracking-widest uppercase mb-5 font-light">{data.title}</h2>

              <div className="grid grid-cols-2 gap-y-3 text-[13px] text-[#475569]">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#1e293b]" />
                  <span>{data.contact.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#1e293b]" />
                  <span>{data.contact.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#1e293b]" />
                  <span>{data.contact.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-[#1e293b]" />
                  <span>{data.contact.website}</span>
                </div>
              </div>
            </div>

            {/* Profile */}
            <div>
              <h2 className="text-[18px] font-bold tracking-[0.15em] uppercase text-[#1e293b] mb-3">Profile</h2>
              <p className="text-[#475569] leading-tight text-justify text-[13px]">
                {data.profile}
              </p>
            </div>

            {/* Work Experience Page 1 */}
            <div>
              <h2 className="text-[18px] font-bold tracking-[0.15em] uppercase text-[#1e293b] mb-3 border-b border-[#e2e8f0] pb-1.5">Work Experience</h2>
              <div className="flex flex-col gap-4">
                {page1Work.map((exp, index) => (
                  <div key={index} className="relative pl-6 border-l-[1.5px] border-[#cbd5e1]">
                    <div className="absolute w-2.5 h-2.5 bg-[#1e293b] rounded-full -left-[5.5px] top-1.5 border-2 border-[#ffffff]"></div>
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className="font-bold text-[#1e293b] text-[15px] uppercase">{exp.company}</h3>
                      <span className="text-[#64748b] text-[13px]">{exp.period}</span>
                    </div>
                    <div className="text-[#64748b] font-medium mb-1.5 text-[14px]">{exp.role}</div>
                    <ul className="list-disc space-y-1 text-[#475569] text-justify text-[13px] pl-4">
                      {exp.responsibilities.map((resp, idx) => (
                        <li key={idx} className="leading-tight pl-1">{resp}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 2 */}
        <div className="w-[210mm] h-[297mm] bg-[#ffffff] text-[#0f172a] flex overflow-hidden text-[13px] shrink-0 shadow-lg print:shadow-none" style={{ fontFamily: "'Inter', sans-serif" }}>
          {/* Sidebar Page 2 */}
          <div className="w-[300px] bg-[#1e293b] text-[#ffffff] p-8 flex flex-col gap-8 shrink-0">
            {/* Technical Expertise */}
            <div>
              <h2 className="text-[18px] font-bold tracking-[0.15em] uppercase border-b border-[#ffffff33] pb-2 mb-4">Technical Expertise</h2>
              <ul className="list-disc space-y-1.5 text-[13px] text-[#ffffff] pl-4">
                {data.technicalExpertise.slice(0, 14).map((item, index) => (
                  <li key={index} className="pl-1">{item}</li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-[18px] font-bold tracking-[0.15em] uppercase border-b border-[#ffffff33] pb-2 mb-4">Contact</h2>
              <div className="flex flex-col gap-4 text-[13px] text-[#ffffff]">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#ffffff]" />
                  <span>{data.contact.location}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#ffffff]" />
                  <span>{data.contact.phone}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#ffffff]" />
                  <span className="break-all">{data.contact.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-[#ffffff]" />
                  <span>{data.contact.website}</span>
                </div>
                {data.contact.linkedin && (
                  <div className="flex items-center gap-2.5">
                    <Linkedin className="w-4 h-4 text-[#ffffff]" />
                    <span className="break-all">{data.contact.linkedin}</span>
                  </div>
                )}
                {data.contact.github && (
                  <div className="flex items-center gap-2.5">
                    <Github className="w-4 h-4 text-[#ffffff]" />
                    <span className="break-all">{data.contact.github}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Page 2 */}
          <div className="flex-1 p-10 flex flex-col gap-6">
            {/* Work Experience Page 2 */}
            <div>
              <h2 className="text-[18px] font-bold tracking-[0.15em] uppercase text-[#1e293b] mb-4 border-b border-[#e2e8f0] pb-2">Work Experience</h2>
              <div className="flex flex-col gap-5">
                {page2Work.map((exp, index) => (
                  <div key={index} className="relative pl-6 border-l-[1.5px] border-[#cbd5e1]">
                    <div className="absolute w-2.5 h-2.5 bg-[#1e293b] rounded-full -left-[5.5px] top-1.5 border-2 border-[#ffffff]"></div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-[#1e293b] text-[15px] uppercase">{exp.company}</h3>
                      <span className="text-[#64748b] text-[13px]">{exp.period}</span>
                    </div>
                    <div className="text-[#64748b] font-medium mb-2.5 text-[14px]">{exp.role}</div>
                    <ul className="list-disc space-y-1.5 text-[#475569] text-justify text-[13px] pl-4">
                      {exp.responsibilities.map((resp, idx) => (
                        <li key={idx} className="leading-tight pl-1">{resp}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';

export default ResumePreview;
