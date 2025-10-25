import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, Filter, Settings, Plus, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useConnections, getStrengthColor } from '../contexts/ConnectionContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

interface WebViewSettings {
  categoryBy: 'none' | 'relationship' | 'strength' | 'priority';
  distanceBy: 'none' | 'strength' | 'priority';
  showStrength: { 1: boolean; 2: boolean; 3: boolean; 4: boolean; 5: boolean };
  showPriority: { P1: boolean; P2: boolean; P3: boolean };
  showRelationships: { family: boolean; friend: boolean; work: boolean; school: boolean; other: boolean };
}

const WebView = () => {
  const { connections } = useConnections();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // View state
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Web view state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Settings
  const [settings, setSettings] = useState<WebViewSettings>({
    categoryBy: 'relationship',
    distanceBy: 'strength',
    showStrength: { 1: true, 2: true, 3: true, 4: true, 5: true },
    showPriority: { P1: true, P2: true, P3: true },
    showRelationships: { family: true, friend: true, work: true, school: true, other: true }
  });

  // Filter connections based on search and checkboxes
  const filteredConnections = useMemo(() => {
    return connections.filter(conn => {
      const matchesSearch = !searchTerm || 
        conn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        conn.notes.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStrength = settings.showStrength[conn.strength];
      const matchesPriority = settings.showPriority[conn.priority];
      const matchesRelationship = settings.showRelationships[conn.relationship];
      
      return matchesSearch && matchesStrength && matchesPriority && matchesRelationship;
    });
  }, [connections, searchTerm, settings]);

  // Create hierarchical structure for web view
  const hierarchicalData = useMemo(() => {
    const centerX = 200;
    const centerY = 400;
    const nodes: any[] = [];
    const links: any[] = [];

    // Add center node (YOU)
    nodes.push({
      id: 'center',
      type: 'center',
      x: centerX,
      y: centerY,
      name: 'YOU',
      color: currentTheme.colors.primary,
      size: 20
    });

    if (settings.categoryBy === 'none') {
      // Direct connection from center to people
      filteredConnections.forEach((connection, index) => {
        const angle = (index / filteredConnections.length) * 2 * Math.PI;
        
        // Calculate distance based on distanceBy setting
        let distance = 400; // Further increased base distance
        if (settings.distanceBy === 'strength') {
          distance = 500 - (connection.strength * 80); // Strength 5 = 180px, Strength 1 = 420px
        } else if (settings.distanceBy === 'priority') {
          const priorityDistances = { P1: 250, P2: 350, P3: 450 };
          distance = priorityDistances[connection.priority];
        }
        
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        nodes.push({
          id: connection.id,
          type: 'person',
          x,
          y,
          name: connection.name,
          color: getStrengthColor(connection.strength),
          size: 12,
          data: connection
        });

        links.push({
          source: 'center',
          target: connection.id,
          type: 'direct-link'
        });
      });
    } else {
      // Group connections by the selected category
      const groups = new Map<string, typeof filteredConnections>();
      
      filteredConnections.forEach(conn => {
        let groupKey = '';
        switch (settings.categoryBy) {
          case 'relationship':
            groupKey = conn.relationship;
            break;
          case 'strength':
            groupKey = conn.strength.toString();
            break;
          case 'priority':
            groupKey = conn.priority;
            break;
        }
        
        if (!groups.has(groupKey)) {
          groups.set(groupKey, []);
        }
        groups.get(groupKey)!.push(conn);
      });

      let groupIndex = 0;
      groups.forEach((groupConnections, groupKey) => {
        const groupAngle = (groupIndex / groups.size) * 2 * Math.PI;
        const groupX = centerX + Math.cos(groupAngle) * 100; // Further reduced distance to categories
        const groupY = centerY + Math.sin(groupAngle) * 100;
        
        // Add category node
        const categoryId = `category-${groupKey}`;
        let categoryColor = currentTheme.colors.secondary;
        let categoryLabel = groupKey;
        
        if (settings.categoryBy === 'strength') {
          categoryColor = getStrengthColor(parseInt(groupKey));
          categoryLabel = `Strength ${groupKey}`;
        } else if (settings.categoryBy === 'priority') {
          const priorityColors = { P1: currentTheme.colors.health.excellent, P2: currentTheme.colors.health.good, P3: currentTheme.colors.health.warning };
          categoryColor = priorityColors[groupKey as keyof typeof priorityColors];
        }
        
        nodes.push({
          id: categoryId,
          type: 'category',
          x: groupX,
          y: groupY,
          name: categoryLabel,
          color: categoryColor,
          size: 15
        });

        // Add link from center to category
        links.push({
          source: 'center',
          target: categoryId,
          type: 'category-link'
        });

        // Add people nodes around the category
        groupConnections.forEach((connection, personIndex) => {
          const personAngle = groupAngle + ((personIndex / groupConnections.length) - 0.5) * 2.8; // Further increased spread angle
          
          // Calculate distance based on distanceBy setting
          let distance = 220; // Further increased base distance from category
          if (settings.distanceBy === 'strength') {
            distance = 280 - (connection.strength * 45); // Strength 5 = 85px, Strength 1 = 235px
          } else if (settings.distanceBy === 'priority') {
            const priorityDistances = { P1: 180, P2: 220, P3: 260 };
            distance = priorityDistances[connection.priority];
          }
          
          const personX = groupX + Math.cos(personAngle) * distance;
          const personY = groupY + Math.sin(personAngle) * distance;

          nodes.push({
            id: connection.id,
            type: 'person',
            x: personX,
            y: personY,
            name: connection.name,
            color: getStrengthColor(connection.strength),
            size: 10,
            data: connection
          });

          // Add link from category to person
          links.push({
            source: categoryId,
            target: connection.id,
            type: 'person-link'
          });
        });

        groupIndex++;
      });
    }

    return { nodes, links };
  }, [filteredConnections, settings, currentTheme]);

  // Handle zoom
  const handleZoom = useCallback((delta: number, clientX?: number, clientY?: number) => {
    const newZoom = Math.max(0.1, Math.min(5, zoom + delta));
    
    if (clientX !== undefined && clientY !== undefined && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      const factor = newZoom / zoom;
      setPan(prev => ({
        x: x - (x - prev.x) * factor,
        y: y - (y - prev.y) * factor
      }));
    }
    
    setZoom(newZoom);
  }, [zoom]);

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    handleZoom(delta, e.clientX, e.clientY);
  }, [handleZoom]);

  // Handle mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start dragging if clicking on background (svg or container)
    const target = e.target as Element;
    if (target === e.currentTarget || target.tagName === 'svg' || target.classList.contains('web-background')) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      // Smooth, immediate cursor following
      const newPan = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      setPan(newPan);
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as Element;
    if (e.touches.length === 1 && (target === e.currentTarget || target.tagName === 'svg' || target.classList.contains('web-background'))) {
      e.preventDefault();
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
      setIsDragging(true);
    }
  }, [pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      // Smooth, immediate touch following
      const newPan = {
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      };
      setPan(newPan);
    } else if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      
      const delta = distance > 100 ? 0.1 : -0.1;
      handleZoom(delta, centerX, centerY);
    }
  }, [isDragging, dragStart, handleZoom]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Reset view
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Handle node click
  const handleNodeClick = useCallback((nodeId: string) => {
    if (nodeId !== 'center' && !nodeId.startsWith('category-')) {
      navigate(`/contact/${nodeId}`);
    }
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: currentTheme.colors.background }}>
      {/* Header */}
      <div 
        className="p-4 border-b"
        style={{ 
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.primary + '20'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
              WEB
            </h1>
            <div className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
              {filteredConnections.length} connections • {settings.categoryBy !== 'none' ? `By ${settings.categoryBy}` : 'No grouping'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg"
              style={{ backgroundColor: currentTheme.colors.primary + '20' }}
            >
              <Settings size={20} style={{ color: currentTheme.colors.primary }} />
            </button>
            <button
              onClick={() => navigate('/add-contact')}
              className="p-2 rounded-lg"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              <Plus size={20} color="white" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search 
            size={18} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
            style={{ color: currentTheme.colors.textSecondary }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search connections..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{ 
              borderColor: currentTheme.colors.primary + '30',
              backgroundColor: currentTheme.colors.background,
              color: currentTheme.colors.text
            }}
          />
        </div>

      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-b overflow-hidden"
            style={{ 
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.primary + '20'
            }}
          >
            <div className="p-4 space-y-4">
              {/* Dropdowns */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                    Categorize By
                  </label>
                  <select
                    value={settings.categoryBy}
                    onChange={(e) => setSettings(prev => ({ ...prev, categoryBy: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ 
                      borderColor: currentTheme.colors.primary + '30',
                      backgroundColor: currentTheme.colors.background,
                      color: currentTheme.colors.text
                    }}
                  >
                    <option value="none">None</option>
                    <option value="relationship">Relationship</option>
                    <option value="strength">Strength</option>
                    <option value="priority">Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                    Distance By
                  </label>
                  <select
                    value={settings.distanceBy}
                    onChange={(e) => setSettings(prev => ({ ...prev, distanceBy: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ 
                      borderColor: currentTheme.colors.primary + '30',
                      backgroundColor: currentTheme.colors.background,
                      color: currentTheme.colors.text
                    }}
                  >
                    <option value="none">None</option>
                    <option value="strength">Strength</option>
                    <option value="priority">Priority</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                {/* Strength checkboxes */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                    Strength Levels
                  </label>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((strength) => (
                      <label key={strength} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={settings.showStrength[strength as keyof typeof settings.showStrength]}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            showStrength: { ...prev.showStrength, [strength]: e.target.checked }
                          }))}
                        />
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getStrengthColor(strength) }}
                        />
                        <span className="text-xs" style={{ color: currentTheme.colors.text }}>
                          {strength}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Priority checkboxes */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                    Priority Levels
                  </label>
                  <div className="flex gap-4">
                    {['P1', 'P2', 'P3'].map((priority) => (
                      <label key={priority} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.showPriority[priority as keyof typeof settings.showPriority]}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            showPriority: { ...prev.showPriority, [priority]: e.target.checked }
                          }))}
                        />
                        <span className="text-sm" style={{ color: currentTheme.colors.text }}>
                          {priority}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Relationship checkboxes */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                    Relationships
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {['family', 'friend', 'work', 'school', 'other'].map((relationship) => (
                      <label key={relationship} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.showRelationships[relationship as keyof typeof settings.showRelationships]}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            showRelationships: { ...prev.showRelationships, [relationship]: e.target.checked }
                          }))}
                        />
                        <span className="text-sm capitalize" style={{ color: currentTheme.colors.text }}>
                          {relationship}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Web View */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={containerRef}
          className="w-full h-full cursor-move web-background"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <svg
            ref={svgRef}
            viewBox="0 0 400 800"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
            className="web-background"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
          >
            {/* Connection Lines */}
            {hierarchicalData.links.map((link, index) => {
              const sourceNode = hierarchicalData.nodes.find(n => n.id === link.source);
              const targetNode = hierarchicalData.nodes.find(n => n.id === link.target);
              
              if (!sourceNode || !targetNode) return null;

              let strokeWidth = 1;
              let strokeColor = currentTheme.colors.primary + '40';
              
              if (link.type === 'category-link') {
                strokeWidth = 2;
                strokeColor = currentTheme.colors.primary + '60';
              } else if (link.type === 'direct-link') {
                strokeWidth = 1;
                strokeColor = currentTheme.colors.primary + '30';
              }

              return (
                <line
                  key={`${link.source}-${link.target}-${index}`}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  opacity={1}
                />
              );
            })}

            {/* Nodes */}
            {hierarchicalData.nodes.map((node, index) => (
              <g 
                key={node.id}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size}
                  fill={node.color}
                  stroke={node.type === 'center' ? currentTheme.colors.surface : 'white'}
                  strokeWidth={node.type === 'center' ? 3 : 2}
                  className="cursor-pointer transition-all duration-200 hover:scale-110"
                  onClick={() => handleNodeClick(node.id)}
                  style={{
                    filter: node.type === 'center' ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none',
                    pointerEvents: 'all'
                  }}
                />
                
                {/* Node Labels */}
                {(zoom > 1.5 || node.type === 'category') && (
                  <text
                    x={node.x}
                    y={node.y + node.size + 15}
                    textAnchor="middle"
                    fontSize={node.type === 'center' ? 12 : node.type === 'category' ? 10 : 8}
                    fontWeight={node.type === 'center' ? 'bold' : node.type === 'category' ? '600' : 'normal'}
                    fill={currentTheme.colors.text}
                    className="pointer-events-none select-none"
                    opacity={(zoom > 1.5 || node.type === 'category') ? 1 : 0}
                  >
                    {node.name}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Controls */}
        <div className="absolute bottom-24 right-4 flex flex-col gap-2 z-50">
          <button
            onClick={() => handleZoom(0.2)}
            className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            <ZoomIn size={20} style={{ color: currentTheme.colors.primary }} />
          </button>
          <button
            onClick={() => handleZoom(-0.2)}
            className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            <ZoomOut size={20} style={{ color: currentTheme.colors.primary }} />
          </button>
          <button
            onClick={resetView}
            className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            <RotateCcw size={20} style={{ color: currentTheme.colors.primary }} />
          </button>
        </div>


      </div>
    </div>
  );
};

export default WebView;