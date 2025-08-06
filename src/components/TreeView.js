'use client';

import { useState, useEffect } from 'react';
import CustomTooltip from './CustomTooltip';

const TreeNode = ({ node, level = 0, type, onItemClick, onAddUnit }) => {
  const nodeKey = `${type}_${node._id}`;
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`treeview_expanded_${nodeKey}`);
      return saved === 'true';
    }
    return false;
  });
  const indent = level * 16; // Reduced indentation for mobile

  const hasChildren = (type === 'partner' && (node.customers?.length > 0 || node.units?.length > 0 || node.reports?.length > 0)) ||
    (type === 'customer' && (node.units?.length > 0 || node.reports?.length > 0)) ||
    (type === 'unit' && node.reports?.length > 0);

  const handleExpandClick = (e) => {
    e.stopPropagation();
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    localStorage.setItem(`treeview_expanded_${nodeKey}`, newExpanded.toString());
  };

  const handleItemClick = () => {
    onItemClick(node, type);
    // If has children, also toggle expansion on mobile
    if (hasChildren && window.innerWidth < 1024) {
      const newExpanded = !isExpanded;
      setIsExpanded(newExpanded);
      localStorage.setItem(`treeview_expanded_${nodeKey}`, newExpanded.toString());
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
        return node.isNew ? '🔔' : '📊';
      default:
        return '📄';
    }
  };

  return (
    <>
      <div
        className={`
          flex items-center py-2 px-2 sm:px-3
          ${type === 'report' && node.isNew ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-gray-50'}
          active:bg-gray-100
          transition-colors duration-150
          rounded-lg my-0.5
          cursor-pointer
          group
        `}
        onClick={handleItemClick}
      >
        <div className="flex items-center w-full min-w-max" style={{ paddingLeft: `${indent}px` }}>
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
          <span className={`mr-2 sm:mr-3 text-base sm:text-lg flex-shrink-0 ${type === 'report' && node.isNew ? 'animate-pulse' : ''}`}>{getIcon()}</span>
          <div className="flex-grow min-w-max">
            <CustomTooltip text={type === 'report' ? node.reportNumber : (node.name || node.unitName)}>
              <span 
                className={`
                  block text-left font-medium
                  ${type === 'report' && node.isNew ? 'text-yellow-700 animate-pulse' : 'text-gray-700'}
                  hover:text-blue-600
                  transition-colors duration-150
                  whitespace-nowrap
                `}
              >
                {type === 'report' ? node.reportNumber : (node.name || node.unitName)}
              </span>
            </CustomTooltip>
          </div>
          {type === 'partner' && onAddUnit && (
            <button
              type="button"
              className="ml-2 px-2 py-0.5 text-xs font-bold text-green-600 bg-green-100 rounded hover:bg-green-200"
              onClick={e => { e.stopPropagation(); onAddUnit(node); }}
              title="Add Unit to Partner"
            >
              +
            </button>
          )}
          {type === 'report' && node.isNew && (
            <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full flex-shrink-0">
              New
            </span>
          )}
        </div>
      </div>
      {isExpanded && hasChildren && (
        <div>
          {type === 'partner' && node.reports?.map(report => (
            <TreeNode
              key={report._id}
              node={report}
              level={level + 1}
              type="report"
              onItemClick={onItemClick}
            />
          ))}
          {type === 'partner' && node.units?.map(unit => (
            <TreeNode
              key={unit._id}
              node={unit}
              level={level + 1}
              type="unit"
              onItemClick={onItemClick}
            />
          ))}
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

export default function TreeView({ data, onItemClick, onAddUnit }) {
  return (
    <div className="tree-view bg-white rounded-xl shadow-sm p-1 sm:p-2 overflow-x-auto">
      <div className="min-w-max">
        {data.map((partner, index) => (
          <TreeNode
            key={partner._id || index}
            node={partner}
            type="partner"
            onItemClick={onItemClick}
            onAddUnit={onAddUnit}
          />
        ))}
      </div>
    </div>
  );
} 