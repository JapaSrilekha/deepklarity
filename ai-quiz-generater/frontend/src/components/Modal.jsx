import React from "react";
export default function Modal({open, onClose, children}){
  if(!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white max-w-3xl w-full p-4 rounded shadow">
        <div className="flex justify-end">
          <button className="px-2 py-1" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}
