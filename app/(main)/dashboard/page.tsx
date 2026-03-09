'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, FileText, Calendar, CheckCircle, Loader2 } from 'lucide-react';

import StatCard from '@/components/dashboard/StatCard';
import TopNavbar from '@/components/dashboard/TopNavbar';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import AppliedJobsTab from '@/components/dashboard/AppliedJobsTab';
import TestResultsTab from '@/components/dashboard/TestResultsTab';
import ProfileTab from '@/components/dashboard/ProfileTab';
import AvailableJobsTab from '@/components/dashboard/AvailableJobsTab';
import OverviewTab from '@/components/dashboard/OverviewTab';
import OnlineTestCard from '@/components/dashboard/OnlineTestCard';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "available" | "applied" | "results" | "profile" | "online-test">("overview");
  
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5064/api/CandidateDashboard/overview', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setApiData(data);
        } else if (response.status === 401) {
          localStorage.clear();
          router.push('/login');
        }
      } catch (error) {
        console.error("Backend Connection Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-emerald-600 space-y-4">
        <Loader2 className="animate-spin" size={48} />
        <p className="font-bold tracking-widest uppercase text-sm">Syncing Original Design...</p>
      </div>
    );
  }

  // 🛡️ BULLETPROOF DATA MAPPING
  const currentUser = {
    name: apiData?.userData?.name || apiData?.UserData?.name || apiData?.UserData?.Name || 'Candidate',
    email: apiData?.userData?.email || apiData?.UserData?.email || apiData?.UserData?.Email || '',
    cnic: apiData?.userData?.cnic || apiData?.UserData?.cnic || apiData?.UserData?.CNIC || '',
    phone: apiData?.userData?.phone || apiData?.UserData?.Phone || apiData?.userData?.phoneNumber || apiData?.UserData?.PhoneNumber || 'Not Provided', 
    city: apiData?.userData?.city || apiData?.UserData?.City || 'Not Provided',
    registrationDate: apiData?.userData?.registrationDate || apiData?.UserData?.RegistrationDate || 'March 2026',
    education: apiData?.educationHistory || apiData?.EducationHistory || [],
    academicHistory: apiData?.educationHistory || apiData?.EducationHistory || []
  };

  const currentStats = apiData?.stats || apiData?.Stats || { availableJobs: 0, totalApplied: 0, testsPassed: 0, activeTests: 0 };
  const availableJobsList = apiData?.availableJobs || apiData?.AvailableJobs || [];
  const appliedJobsList = apiData?.appliedJobs || apiData?.AppliedJobs || [];
  const testResultsList = apiData?.testResults || apiData?.TestResults || [];
  const realRecentActivities = apiData?.recentActivities || apiData?.RecentActivities || [];
  const activeOnlineTest = apiData?.onlineTest || apiData?.OnlineTest || null;

  const dynamicStatsData = [
    { label: 'AVAILABLE JOBS', value: currentStats.availableJobs, icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50', variant: 'emerald' as const },
    { label: 'APPLIED JOBS', value: currentStats.totalApplied, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', variant: 'blue' as const },
    { label: 'TESTS SCHEDULED', value: currentStats.activeTests, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50', variant: 'orange' as const },
    { label: 'TESTS PASSED', value: currentStats.testsPassed, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50', variant: 'purple' as const },
  ];

  const firstName = (currentUser.name || 'Candidate').split(' ')[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopNavbar userData={currentUser} handleLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">
              Welcome, {firstName}! 👋
            </h2>
            <p className="text-slate-500 font-medium italic">Official Candidate Portal</p>
          </div>
          
          {activeOnlineTest && (
            <button 
              onClick={() => setActiveTab('online-test')}
              className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center gap-2"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {currentStats.activeTests} Test Pending
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dynamicStatsData.map((item, index) => (
            <StatCard key={index} {...item} />
          ))}
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 mb-8 border border-slate-100 overflow-hidden">
          <DashboardTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <div className="p-6 md:p-8">
            {/* 🟢 FIXED: activeTest passed here */}
            {activeTab === "overview" && (
              <OverviewTab 
                recentActivities={realRecentActivities} 
                activeTest={activeOnlineTest} 
                setActiveTab={setActiveTab} 
              />
            )}
            
            {activeTab === "available" && (
              <AvailableJobsTab availableJobs={availableJobsList} />
            )}

            {activeTab === "applied" && (
              <AppliedJobsTab appliedJobs={appliedJobsList} />
            )}

            {activeTab === "results" && (
              <TestResultsTab testResults={testResultsList} />
            )}

            {activeTab === "online-test" && (
              activeOnlineTest ? (
                <OnlineTestCard test={activeOnlineTest} onStart={() => router.push(`/test/${activeOnlineTest.id}`)} />
              ) : (
                <div className="text-center py-12 text-slate-400 font-medium">No tests scheduled at the moment.</div>
              )
            )}

            {activeTab === "profile" && (
              <ProfileTab userData={currentUser} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}