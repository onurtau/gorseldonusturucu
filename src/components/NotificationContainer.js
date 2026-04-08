import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import useAppStore from '../store/useAppStore';

const NotificationContainer = React.memo(() => {
  const { notifications, removeNotification } = useAppStore();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 bg-opacity-20 border-green-500';
      case 'error':
        return 'bg-red-500 bg-opacity-20 border-red-500';
      case 'warning':
        return 'bg-yellow-500 bg-opacity-20 border-yellow-500';
      default:
        return 'bg-blue-500 bg-opacity-20 border-blue-500';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-md w-full">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            p-4 rounded-lg border backdrop-blur-sm shadow-lg fade-in
            ${getStyles(notification.type)}
          `}
        >
          <div className="flex items-start gap-3">
            {/* İkon */}
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>

            {/* İçerik */}
            <div className="flex-1 min-w-0">
              {notification.title && (
                <h4 className="text-sm font-semibold text-white mb-1">
                  {notification.title}
                </h4>
              )}
              {notification.message && (
                <p className="text-sm text-gray-300">
                  {notification.message}
                </p>
              )}
              
              {/* Action Butonu */}
              {notification.action && (
                <button
                  onClick={() => {
                    notification.action.onClick();
                    removeNotification(notification.id);
                  }}
                  className="mt-2 px-3 py-1.5 bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-xs font-medium rounded-md transition-all flex items-center gap-1.5"
                >
                  {notification.action.label}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              )}
            </div>

            {/* Kapat Butonu */}
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 p-1 hover:bg-white hover:bg-opacity-10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
});

NotificationContainer.displayName = 'NotificationContainer';

export default NotificationContainer;
