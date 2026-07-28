import React, { useState } from 'react';
import HeaderBar from '../components/common/HeaderBar';
import BottomNavBar from '../components/common/BottomNavBar';
import HomeTab from './tabs/HomeTab';
import AnalyzerTab from './tabs/AnalyzerTab';
import ExploreTab from './tabs/ExploreTab';
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
        backgroundColor: 'var(--dark-bg)',
        color: 'var(--text-primary)',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      <HeaderBar />
      <main>{renderActiveTab()}</main>
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
