import React from 'react';
import { View, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Icon, IconName } from '../ui/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { WIDGET_REGISTRY } from '../../lib/widgetRegistry';
import { useLayoutStore } from '../../store/useLayoutStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function WidgetLibrarySheet({ visible, onClose }: Props) {
  const theme = useTheme();
  const { addWidget, layout } = useLayoutStore();

  const activeWidgetTypes = new Set(layout.map((l) => l.type));

  const handleAdd = (type: string) => {
    addWidget(type);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: theme.colors.background,
            height: '78%',
            borderTopLeftRadius: theme.shapes.borderRadius.l,
            borderTopRightRadius: theme.shapes.borderRadius.l,
            padding: theme.spacing.l,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <View>
              <Typography variant="h2">Widget Library</Typography>
              <Typography variant="caption" color={theme.colors.textSecondary}>
                Infinite Customization &bull; Add any data card
              </Typography>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 6 }}>
              <Icon name="close" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ marginTop: theme.spacing.m }} showsVerticalScrollIndicator={false}>
            {Object.values(WIDGET_REGISTRY).map((widget) => {
              const isAlreadyAdded = activeWidgetTypes.has(widget.id);

              return (
                <Card key={widget.id} style={{ marginBottom: theme.spacing.m, padding: theme.spacing.m }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: theme.spacing.m }}>
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: theme.colors.surfaceSecondary,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Icon name={(widget.icon as IconName) || 'sun'} size={18} color={theme.colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                            {widget.name}
                          </Typography>
                        </View>
                        <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 2 }}>
                          {widget.description}
                        </Typography>
                      </View>
                    </View>

                    {isAlreadyAdded ? (
                      <View
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: theme.shapes.borderRadius.s,
                          backgroundColor: theme.colors.surfaceSecondary,
                        }}
                      >
                        <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600' }}>
                          Added
                        </Typography>
                      </View>
                    ) : (
                      <Button
                        title="Add"
                        variant="secondary"
                        onPress={() => handleAdd(widget.id)}
                        style={{ paddingVertical: 6, paddingHorizontal: 14 }}
                      />
                    )}
                  </View>
                </Card>
              );
            })}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
