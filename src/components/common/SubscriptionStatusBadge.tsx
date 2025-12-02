// src/components/common/SubscriptionStatusBadge.tsx
import React, { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { checkSubscriptionStatus, SubscriptionStatus } from '../../api/payments';

const SubscriptionStatusBadge: React.FC = () => {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const data = await checkSubscriptionStatus();
      setStatus(data);
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !status || !status.has_premium) {
    return null;
  }

  return (
    <Link
      to="/subscription"
      className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-bold hover:shadow-lg transition-all"
    >
      <StarIcon className="h-4 w-4" />
      <span>{status.plan_name || 'Premium'}</span>
    </Link>
  );
};

export default SubscriptionStatusBadge;

