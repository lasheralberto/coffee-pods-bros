import React from 'react';
import { motion } from 'framer-motion';
import { AdminChats } from './AdminChats';
import { AdminProductsCatalogEditor } from './AdminProductsCatalogEditor';
import { AdminPurchasingHistory } from './AdminPurchasingHistory';

interface AdminDashboardProps {
  uid: string;
  chatOpen: boolean;
  onChatOpenChange: (open: boolean) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ uid, chatOpen, onChatOpenChange }) => {
  return (
    <div id="admin-dashboard" className="profile-admin-dashboard">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.21 }}
      >
        <AdminProductsCatalogEditor />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.215 }}
      >
        <AdminPurchasingHistory />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.22 }}
      >
        <AdminChats uid={uid} open={chatOpen} onOpenChange={onChatOpenChange} />
      </motion.div>
    </div>
  );
};