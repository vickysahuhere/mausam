'use client';

import React, { useState } from 'react';
import { WIDGET_REGISTRY } from '../../lib/widgetRegistry';
import { useLayoutStore } from '../../store/useLayoutStore';
import { useTheme } from '../../theme/ThemeProvider';
import { Icon } from '../ui/Icon';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';

interface WidgetLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WidgetLibraryModal({ isOpen, onClose }: WidgetLibraryModalProps) {
  const theme = useTheme();
  const layout = useLayoutStore((s) => s.layout);
  const addWidget = useLayoutStore((s) => s.addWidget);
  const removeWidget = useLayoutStore((s) => s.removeWidget);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Essential', 'Health', 'Fitness', 'Outdoors', 'Marine', 'Travel', 'Agriculture', 'Commuter'];

  const allWidgets = Object.values(WIDGET_REGISTRY);
  const filteredWidgets =
    selectedCategory === 'All'
      ? allWidgets
      : allWidgets.filter((w) => w.category?.toLowerCase().includes(selectedCategory.toLowerCase()));

  const activeWidgetTypes = new Set(layout.map((item) => item.type));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-2xl max-h-[85vh] rounded-3xl p-6 flex flex-col shadow-2xl overflow-hidden"
        style={{
          backgroundColor: theme.colors.surface,
          color: theme.colors.text,
          border: `1.5px solid ${theme.colors.border}`,
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <Typography variant="h3" className="font-bold">
              Widget Library
            </Typography>
            <Typography variant="caption" style={{ color: theme.colors.textSecondary }}>
              Add or remove metrics from your personalized weather dashboard
            </Typography>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Widget Grid */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredWidgets.map((widget) => {
            const isAdded = activeWidgetTypes.has(widget.id);

            return (
              <div
                key={widget.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border transition-all"
                style={{
                  backgroundColor: theme.colors.surfaceSecondary || theme.colors.surface,
                  borderColor: theme.colors.border,
                }}
              >
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${theme.colors.primary}18`, color: theme.colors.primary }}
                  >
                    <Icon name={widget.icon || 'sun'} size={18} />
                  </div>
                  <div>
                    <span className="text-sm font-bold block truncate">{widget.name}</span>
                    <span className="text-xs opacity-70 block line-clamp-1">{widget.description}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  {isAdded ? (
                    <button
                      onClick={() => {
                        const target = layout.find((l) => l.type === widget.id);
                        if (target) removeWidget(target.id);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => addWidget(widget.id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm transition-transform active:scale-95"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <Button title="Done" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}
