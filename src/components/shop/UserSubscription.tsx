import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ShoppingCart, Package } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { onUserSubscription, type UserSubscriptionDoc } from '../../providers/firebaseProvider';
import { fmtPrice } from '../../data/shopProducts';
import { t } from '../../data/texts';
import { useNavigate } from 'react-router-dom';

interface UserSubscriptionProps {
  uid: string;
}

const formatDate = (ts: unknown): string => {
  if (!ts) return '—';
  if (ts && typeof ts === 'object' && 'toDate' in (ts as object)) {
    return (ts as { toDate: () => Date }).toDate().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  return '—';
};

export const UserSubscription: React.FC<UserSubscriptionProps> = ({ uid }) => {
  const navigate = useNavigate();
  const [sub, setSub] = useState<UserSubscriptionDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onUserSubscription(uid, (data) => {
      setSub(data);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  if (loading) {
    return (
      <Card variant="outline" padding="lg" className="user-subscription">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-roast border-t-transparent animate-spin" />
          <span className="text-sm text-muted">{t('profile.loading')}</span>
        </div>
      </Card>
    );
  }

  if (!sub) {
    return (
      <Card variant="outline" padding="lg" className="user-subscription user-subscription--empty">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-semibold text-primary mb-1">
              {t('userSubscription.heading')}
            </h3>
            <p className="text-sm text-muted">
              {t('userSubscription.noSubscription')}
            </p>
          </div>
          {/* <Button variant="primary" size="md" onClick={() => navigate('/shop')}>
            <Package size={16} />
            {t('userSubscription.subscribeCta')}
          </Button> */}
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="none" className="user-subscription">
      {/* Header */}
      <div className="user-subscription__header">
        <div className="flex items-center gap-2">
          {sub.mode === 'subscription' ? (
            <RefreshCw size={18} className="text-accent" />
          ) : (
            <ShoppingCart size={18} className="text-accent" />
          )}
          <h3 className="text-lg font-semibold text-primary">
            {t('userSubscription.heading')}
          </h3>
        </div>
        <Badge variant={sub.mode === 'subscription' ? 'leaf' : 'caramel'}>
          {sub.mode === 'subscription'
            ? t('userSubscription.modeSubscription')
            : t('userSubscription.modeOneTime')}
        </Badge>
      </div>

      {/* GenAI Description */}
      {sub.genaiDescription && (
        <div className="user-subscription__description">
          <p className="text-sm leading-relaxed text-secondary">
            {sub.genaiDescription}
          </p>
        </div>
      )}

      {/* Items */}
      <div className="user-subscription__items-label">
        <span className="text-xs font-medium text-muted uppercase tracking-wide">
          {t('userSubscription.items')}
        </span>
      </div>
      <div className="user-subscription__items">
        {sub.items.map((item) => (
          <div key={item.productId} className="user-subscription__item">
            <img
              src={item.image}
              alt={item.name}
              className="user-subscription__item-img"
              loading="lazy"
            />
            <div className="user-subscription__item-info">
              <span className="user-subscription__item-name">{item.name}</span>
              <span className="user-subscription__item-detail">
                {fmtPrice(item.price)} × {item.quantity}
              </span>
            </div>
            <span className="user-subscription__item-subtotal">
              {fmtPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="user-subscription__footer">
        <div className="user-subscription__meta">
          <span className="text-xs text-muted">
            {t('userSubscription.subscribedAt')} {formatDate(sub.subscribedAt)}
          </span>
        </div>
        <div className="user-subscription__total">
          <span className="text-sm text-muted">{t('userSubscription.total')}</span>
          <span className="text-lg font-bold text-primary">{fmtPrice(sub.totalPrice)}</span>
        </div>
      </div>
    </Card>
  );
};
