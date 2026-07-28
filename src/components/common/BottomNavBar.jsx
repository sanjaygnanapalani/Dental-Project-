import React from 'react';
import { Home, FlaskConical, Compass, User } from 'lucide-react';

export default function BottomNavBar({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'analyzer', label: 'Analyzer', icon: FlaskConical },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '580px',
        height: '66px',
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        zIndex: 100,
        boxShadow: '0 12px 36px 0 rgba(0, 0, 0, 0.25), 0 0 20px 0 rgba(0, 212, 170, 0.12)',
        padding: '0 8px',
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}
    >
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              flex: 1,
              height: '100%',
              padding: '6px 0',
              position: 'relative',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <div
              style={{
                transform: isActive ? 'scale(1.2)' : 'scale(1)',
                color: isActive ? 'var(--teal-accent)' : 'var(--muted-white)',
                transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon size={21} strokeWidth={isActive ? 2.4 : 1.8} />
            </div>

            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--teal-accent)' : 'var(--muted-white)',
                transition: 'color 0.2s ease'
              }}
            >
              {tab.label}
            </span>

            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '6px',
                  width: '18px',
                  height: '3px',
                  borderRadius: '2px',
                  backgroundColor: 'var(--teal-accent)',
                  boxShadow: '0 0 8px var(--teal-accent)'
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
