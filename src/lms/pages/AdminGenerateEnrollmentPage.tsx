import { useState } from "react";
import { AdminSidebar } from "../components/AdminSidebar";
import { useLMS } from "../context/LMSContext";
import { Link, Copy, Check, Plus, Settings2, Trash2, CalendarDays, BookOpen, Clock } from "lucide-react";

export function AdminGenerateEnrollmentPage() {
  const { programs, sittings, cohorts, enrollmentLinks, generateEnrollmentLink } = useLMS();

  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [selectedSittings, setSelectedSittings] = useState<string[]>([]);
  const [selectedCohorts, setSelectedCohorts] = useState<string[]>([]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleToggle = (setter: React.Dispatch<React.SetStateAction<string[]>>, id: string) => {
    setter(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const handleGenerate = () => {
    // Basic validation
    if (selectedPrograms.length === 0 || selectedSittings.length === 0 || selectedCohorts.length === 0) {
      alert("Please select at least one Program, Sitting, and Cohort schedule.");
      return;
    }

    generateEnrollmentLink({
      allowedPrograms: selectedPrograms,
      allowedSittings: selectedSittings,
      allowedCohorts: selectedCohorts,
    });

    // Reset selection after generation
    setSelectedPrograms([]);
    setSelectedSittings([]);
    setSelectedCohorts([]);
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/student/enroll?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200 font-sans">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="px-8 py-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div>
              <h1 className="text-2xl font-semibold text-white tracking-tight">Enrollment Links</h1>
              <p className="text-sm text-slate-400 mt-1">Generate and manage cohort-specific enrollment links for students.</p>
            </div>
            <button
              onClick={() => {
                document.getElementById('generate-form')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#d4a574] hover:bg-[#c39463] text-slate-900 font-medium rounded-lg transition-colors"
            >
              <Plus size={18} />
              Create Link
            </button>
          </div>
        </header>

        <div className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-8">
          
          {/* Active Links Table */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white font-medium">
                <Link size={18} className="text-[#d4a574]" />
                Active Enrollment Links
              </div>
            </div>
            
            <div className="divide-y divide-slate-700/50">
              {enrollmentLinks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No enrollment links generated yet. Create one below.
                </div>
              ) : (
                enrollmentLinks.map(link => (
                  <div key={link.id} className="p-6 hover:bg-slate-800/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Link Token</div>
                        <code className="text-[#d4a574] font-mono text-lg bg-slate-900 px-3 py-1 rounded-md border border-slate-700">
                          {link.token}
                        </code>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyLink(link.token)}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-600 transition-colors"
                        >
                          {copiedToken === link.token ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                          {copiedToken === link.token ? "Copied" : "Copy URL"}
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                        <div className="text-slate-500 mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                          <BookOpen size={14} /> Programs
                        </div>
                        <ul className="space-y-1">
                          {link.allowedPrograms.map(pid => (
                            <li key={pid} className="text-slate-300">• {programs.find(p => p.id === pid)?.name}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                        <div className="text-slate-500 mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                          <CalendarDays size={14} /> Sittings
                        </div>
                        <ul className="space-y-1">
                          {link.allowedSittings.map(sid => (
                            <li key={sid} className="text-slate-300">• {sittings.find(s => s.id === sid)?.name}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                        <div className="text-slate-500 mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                          <Clock size={14} /> Schedules
                        </div>
                        <ul className="space-y-1">
                          {link.allowedCohorts.map(cid => (
                            <li key={cid} className="text-slate-300">• {cohorts.find(c => c.id === cid)?.name}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Configuration Form */}
          <div id="generate-form" className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700 bg-slate-900/50 flex items-center gap-3 text-white font-medium">
              <Settings2 size={18} className="text-[#d4a574]" />
              Link Configuration Wizard
            </div>
            
            <div className="p-6 space-y-8">
              {/* Step 1: Programs */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-xs">1</span>
                  Allowed Programs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8">
                  {programs.map(program => (
                    <label key={program.id} className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedPrograms.includes(program.id) 
                        ? 'bg-slate-700/50 border-[#d4a574]' 
                        : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'
                    }`}>
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 rounded border-slate-500 text-[#d4a574] focus:ring-[#d4a574] focus:ring-offset-slate-900 bg-slate-800"
                        checked={selectedPrograms.includes(program.id)}
                        onChange={() => handleToggle(setSelectedPrograms, program.id)}
                      />
                      <div>
                        <div className={`font-medium ${selectedPrograms.includes(program.id) ? 'text-[#d4a574]' : 'text-slate-200'}`}>
                          {program.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{program.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 2: Sittings */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-xs">2</span>
                  Allowed Sittings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-8">
                  {sittings.map(sitting => (
                    <label key={sitting.id} className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedSittings.includes(sitting.id) 
                        ? 'bg-slate-700/50 border-[#d4a574]' 
                        : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'
                    }`}>
                      <input
                        type="checkbox"
                        className="mt-0.5 w-4 h-4 rounded border-slate-500 text-[#d4a574] focus:ring-[#d4a574] focus:ring-offset-slate-900 bg-slate-800"
                        checked={selectedSittings.includes(sitting.id)}
                        onChange={() => handleToggle(setSelectedSittings, sitting.id)}
                      />
                      <div>
                        <div className={`font-medium text-sm ${selectedSittings.includes(sitting.id) ? 'text-[#d4a574]' : 'text-slate-200'}`}>
                          {sitting.name}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 3: Cohort Schedules */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-xs">3</span>
                  Allowed Cohort Schedules
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-8">
                  {cohorts.map(cohort => (
                    <label key={cohort.id} className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedCohorts.includes(cohort.id) 
                        ? 'bg-slate-700/50 border-[#d4a574]' 
                        : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'
                    }`}>
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 rounded border-slate-500 text-[#d4a574] focus:ring-[#d4a574] focus:ring-offset-slate-900 bg-slate-800"
                        checked={selectedCohorts.includes(cohort.id)}
                        onChange={() => handleToggle(setSelectedCohorts, cohort.id)}
                      />
                      <div>
                        <div className={`font-medium ${selectedCohorts.includes(cohort.id) ? 'text-[#d4a574]' : 'text-slate-200'}`}>
                          {cohort.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{cohort.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-slate-700 pl-8 flex items-center gap-4">
                <button
                  onClick={handleGenerate}
                  className="px-6 py-2.5 bg-[#d4a574] hover:bg-[#c39463] text-slate-900 font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Generate Enrollment Link
                </button>
                <div className="text-sm text-slate-400">
                  This will create a unique token that students can use to enroll.
                </div>
              </div>

            </div>
          </div>
          
          <div className="h-12" /> {/* Bottom padding */}
        </div>
      </main>
    </div>
  );
}