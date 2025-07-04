'use client';

import { useState } from 'react';

const TreeNode = ({ node, level = 0, type, onItemClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const indent = level * 16; // Reduced indentation for mobile

  const hasChildren = (type === 'partner' && node.customers?.length > 0) ||
    (type === 'customer' && (node.units?.length > 0 || node.reports?.length > 0)) ||
    (type === 'unit' && node.reports?.length > 0);

  const handleExpandClick = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleItemClick = () => {
    onItemClick(node, type);
    // If has children, also toggle expansion on mobile
    if (hasChildren && window.innerWidth < 1024) {
      setIsExpanded(!isExpanded);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'partner':
        return '👥';
      case 'customer':
        return '🧍';
      case 'unit':
        return '🚗';
      case 'report':
        return '📊';
      default:
        return '📄';
    }
  };

  return (
    <>
      <div
        className={`
          flex items-center py-2 px-2 sm:px-3
          hover:bg-gray-50 active:bg-gray-100
          transition-colors duration-150
          rounded-lg my-0.5
          cursor-pointer
          group
        `}
        onClick={handleItemClick}
      >
        <div className="flex items-center w-full min-w-0" style={{ paddingLeft: `${indent}px` }}>
          {hasChildren ? (
            <button 
              onClick={handleExpandClick}
              className={`
                mr-1 sm:mr-2 w-5 h-5 flex items-center justify-center
                text-gray-400 transition-transform duration-200 
                hover:bg-gray-100 rounded-full
                ${isExpanded ? 'transform rotate-90' : ''}
              `}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ) : (
            <span className="w-5 sm:w-7"></span>
          )}
          <span className="mr-2 sm:mr-3 text-base sm:text-lg flex-shrink-0">{getIcon()}</span>
          <span 
            className={`
              flex-grow text-left font-medium text-gray-700
              hover:text-blue-600
              transition-colors duration-150
              truncate
            `}
          >
            {type === 'report' ? node.reportNumber : (node.name || node.unitName)}
          </span>
          {hasChildren && (
            <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full flex-shrink-0">
              {type === 'partner' ? node.customers.length :
               type === 'customer' ? node.units.length :
               node.reports.length}
            </span>
          )}
        </div>
      </div>
      {isExpanded && hasChildren && (
        <div>
          {type === 'partner' && node.customers?.map(customer => (
            <TreeNode
              key={customer._id}
              node={customer}
              level={level + 1}
              type="customer"
              onItemClick={onItemClick}
            />
          ))}
          {type === 'customer' && (
            <>
              {node.units?.map(unit => (
                <TreeNode
                  key={unit._id}
                  node={unit}
                  level={level + 1}
                  type="unit"
                  onItemClick={onItemClick}
                />
              ))}
              {node.reports?.map(report => (
                <TreeNode
                  key={report._id}
                  node={report}
                  level={level + 1}
                  type="report"
                  onItemClick={onItemClick}
                />
              ))}
            </>
          )}
          {type === 'unit' && node.reports?.map(report => (
            <TreeNode
              key={report._id}
              node={report}
              level={level + 1}
              type="report"
              onItemClick={onItemClick}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default function TreeView({ data, onItemClick }) {
  return (
    <div className="tree-view bg-white rounded-xl shadow-sm p-1 sm:p-2">
      {data.map((partner, index) => (
        <TreeNode
          key={partner._id || index}
          node={partner}
          type="partner"
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
} 