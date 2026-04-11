import React from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

const Cursor = ({ user, position }) => {
  if (!position) return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999] flex flex-col items-start gap-1"
      initial={false}
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{
        type: "spring",
        damping: 30,
        mass: 0.8,
        stiffness: 250,
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        <path
          d="M5.65376 12.3745L12.5538 4.70777C12.9538 4.26333 13.6649 4.41889 13.8427 4.99666L17.176 15.8299C17.3982 16.5521 16.6871 17.1521 16.0649 16.7521L12.4205 14.4077C12.1538 14.2299 11.8205 14.2299 11.5538 14.4077L7.90932 16.7521C7.2871 17.1521 6.576 16.5521 6.79822 15.8299L8.46489 10.3855"
          fill="#3B82F6"
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      {user?.full_name && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap"
        >
          {user.full_name}
        </motion.div>
      )}
    </motion.div>
  );
};

const LiveCursors = () => {
  const { presence } = useSelector((state) => state.board);
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
      <AnimatePresence>
        {Object.entries(presence).map(([userId, data]) => {
          // Don't render our own cursor
          if (userId === user?.id) return null;
          
          return (
            <Cursor
              key={userId}
              user={data.user}
              position={data.cursor}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default LiveCursors;
