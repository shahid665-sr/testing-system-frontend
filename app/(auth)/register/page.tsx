'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PersonalInfoStep from '@/components/register/PersonalInfoStep';
import EducationStep from '@/components/register/EducationStep';

const balochistanCities = ['Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Hub', 'Chaman', 'Sibi', 'Zhob', 'Loralai', 'Pishin'];
const educationLevels = ['Matriculation', 'Intermediate', 'Bachelor', 'Master'];

// 1. TypeScript Types
interface PersonalInfo {
  name: string;
  fatherName: string;
  cnic: string;
  email: string;
  phoneNumber: string;
  city: string;
  password: string;
}

interface EducationEntry {
  level: string;
  title: string;
  startDate: string;
  endDate: string;
  file: File | null;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // 2. State definition
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    fatherName: '',
    cnic: '',
    email: '',
    phoneNumber: '',
    city: '',
    password: '',
  });

  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>([]);

  // 3. Helper Functions
  const formatCNIC = (val: string) => {
    const d = val.replace(/\D/g, '');
    if (d.length <= 5) return d;
    if (d.length <= 12) return `${d.slice(0, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12, 13)}`;
  };

  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    const idx = educationLevels.indexOf(level);
    const required = educationLevels.slice(0, idx + 1);

    const newEntries: EducationEntry[] = required.map(lvl => ({
      level: lvl,
      title: '',
      startDate: '',
      endDate: '',
      file: null
    }));

    setEducationEntries(newEntries);
  };

  // 4. FIXED REGISTRATION FUNCTION (Crash Proof)
  const handleRegistration = async () => {
    setLoading(true);
    const formData = new FormData();

    // Append Personal Info
    formData.append('Name', personalInfo.name);
    formData.append('FatherName', personalInfo.fatherName);
    formData.append('Cnic', personalInfo.cnic);
    formData.append('Email', personalInfo.email);
    formData.append('PhoneNumber', personalInfo.phoneNumber);
    formData.append('City', personalInfo.city);
    formData.append('Password', personalInfo.password);

    // Append Education Data
    const educationTextOnly = educationEntries.map(entry => ({
      Level: entry.level,
      Title: entry.title,
      StartDate: entry.startDate,
      EndDate: entry.endDate
    }));
    formData.append('EducationData', JSON.stringify(educationTextOnly));

    // Append Files
    educationEntries.forEach((entry) => {
      if (entry.file) {
        formData.append('Files', entry.file);
      }
    });

    try {
      console.log("Sending Request to Backend...");


      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        body: formData,
      });

      // --- NEW FIX START: Pehle text parhein, phir JSON try karein ---
      const responseText = await response.text();
      console.log("Backend Response:", responseText); // Debugging ke liye

      if (response.ok) {
        alert("Registration Successful! Please login to continue.");
        router.push('/login');
      } else {
        // Agar error aaye to check karein ke JSON hai ya plain text
        try {
          const result = JSON.parse(responseText);
          alert("Error: " + (result.message || "Registration Failed"));
        } catch {
          // Agar JSON nahi hai (Empty hai ya HTML error hai)
          alert("Server Error: " + (responseText || response.statusText));
        }
      }
      // --- NEW FIX END ---

    } catch (error) {
      console.error("Error:", error);
      alert("Backend se connect nahi ho saka. (Check 'dotnet run')");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-black bg-[#F8FAFC] py-8 md:py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-semibold transition-colors group">
          <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-emerald-50 transition-colors">
            <ArrowLeft size={16} />
          </div>
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Join Balochistan Testing System</h1>
          <div className="flex items-center justify-center gap-3">
            <span className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step === 1 ? 'bg-emerald-500' : 'bg-emerald-200'}`} />
            <span className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step === 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
          </div>
          <p className="text-slate-500 font-medium pt-2">
            Step {step} of 2: {step === 1 ? 'Personal Profile' : 'Education History'}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 p-6 md:p-10 border border-slate-100">
          {step === 1 ? (
            <PersonalInfoStep
              personalInfo={personalInfo}
              onChange={(e: any) => setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value })}
              onNext={() => setStep(2)}
              formatCNIC={formatCNIC}
              cities={balochistanCities}
            />
          ) : (
            <EducationStep
              levels={educationLevels}
              selectedLevel={selectedLevel}
              onLevelSelect={handleLevelSelect}
              entries={educationEntries}
              onEntryChange={(idx: number, field: string, val: string) => {
                const updated = [...educationEntries];
                (updated[idx] as any)[field] = val;
                setEducationEntries(updated);
              }}
              onFileChange={(idx: number, file: File) => {
                const updated = [...educationEntries];
                updated[idx].file = file;
                setEducationEntries(updated);
              }}
              onBack={() => setStep(1)}
              onFinish={handleRegistration}
              loading={loading}
            />
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400">
          Already have an account? <Link href="/login" className="text-emerald-600 font-bold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}