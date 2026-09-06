import React, { useState } from 'react';
import { View, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Icon, IconName } from '../ui/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { useLocaleStore } from '../../store/useLocaleStore';
import { WIDGET_REGISTRY } from '../../lib/widgetRegistry';
import { useLayoutStore } from '../../store/useLayoutStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function WidgetLibrarySheet({ visible, onClose }: Props) {
  const theme = useTheme();
  const t = useLocaleStore((state) => state.t);
  const { addWidget, layout } = useLayoutStore();
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // Count active instances of each widget type currently in layout
  const widgetCounts = layout.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  const handleAdd = (type: string) => {
    addWidget(type);
    setRecentlyAddedId(type);
    setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === type ? null : curr));
    }, 1200);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: theme.isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: theme.colors.background,
            height: '82%',
            borderTopLeftRadius: theme.shapes.borderRadius.l,
            borderTopRightRadius: theme.shapes.borderRadius.l,
            paddingHorizontal: theme.spacing.l,
            paddingTop: theme.spacing.l,
            paddingBottom: theme.spacing.m,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Typography variant="h2">{t('widgetLibrary')}</Typography>
              <Typography variant="caption" color={theme.colors.textSecondary}>
                {t('widgetLibraryDesc')}
              </Typography>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{
                padding: 6,
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 16,
              }}
            >
              <Icon name="close" size={18} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ marginTop: theme.spacing.m, flex: 1 }} showsVerticalScrollIndicator={false}>
            {Object.values(WIDGET_REGISTRY).map((widget) => {
              const count = widgetCounts[widget.id] || 0;
              const isRecent = recentlyAddedId === widget.id;

              return (
                <Card key={widget.id} style={{ marginBottom: theme.spacing.m, padding: theme.spacing.m }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: theme.spacing.s }}>
                      <View
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 19,
                          backgroundColor: theme.colors.surfaceSecondary,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Icon name={(widget.icon as IconName) || 'sun'} size={19} color={theme.colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>
                            {t(widget.name)}
                          </Typography>
                          {count > 0 && (
                            <View
                              style={{
                                paddingHorizontal: 7,
                                paddingVertical: 2,
                                borderRadius: 8,
                                backgroundColor: theme.colors.surfaceSecondary,
                                borderWidth: 1,
                                borderColor: theme.colors.border,
                              }}
                            >
                              <Typography
                                variant="caption"
                                color={theme.colors.primary}
                                style={{ fontWeight: '700', fontSize: 10 }}
                              >
                                {count} {t('inLayout')}
                              </Typography>
                            </View>
                          )}
                        </View>
                        <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 2 }}>
                          {widget.description}
                        </Typography>
                      </View>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => handleAdd(widget.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 7,
                        paddingHorizontal: 12,
                        borderRadius: theme.shapes.borderRadius.s,
                        backgroundColor: isRecent ? theme.colors.success : theme.colors.primary,
                        minWidth: 78,
                      }}
                    >
                      <Icon name={isRecent ? 'check' : 'plus'} size={13} color={theme.colors.onPrimary || '#fff'} />
                      <Typography
                        variant="caption"
                        color={theme.colors.onPrimary || '#fff'}
                        style={{ fontWeight: '700', marginLeft: 4, fontSize: 11 }}
                      >
                        {isRecent ? t('added') : t('addWidget')}
                      </Typography>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })}
            <View style={{ height: 20 }} />
          </ScrollView>

          <View style={{ paddingTop: theme.spacing.s, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
            <Button
              title={t('done')}
              variant="primary"
              onPress={onClose}
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
