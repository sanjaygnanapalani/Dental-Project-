import React, { useState } from 'react';
import HeaderBar from '../components/common/HeaderBar';
import BottomNavBar from '../components/common/BottomNavBar';
import HomeTab from './tabs/HomeTab';
import AnalyzerTab from './tabs/AnalyzerTab';
import ExploreTab from './tabs/ExploreTab';
import ReferencesTab from './tabs/ReferencesTab';
import ProfileTab from './tabs/ProfileTab';

export default function MainLayout() {
  const [activeTab, setActiveTab] = useState('home');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab onSwitchTab={setActiveTab} />;
      case 'analyzer':
        return <AnalyzerTab />;
      case 'explore':
        return <ExploreTab />;
      case 'references':
        return <ReferencesTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <HomeTab onSwitchTab={setActiveTab} />;
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#0A0E1A',
        color: '#F8FAFC'
      }}
    >
      <HeaderBar />
      <main>{renderActiveTab()}</main>
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
