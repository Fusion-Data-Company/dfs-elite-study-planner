// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: Record<string, ComponentProps<typeof MaterialIcons>["name"]> = {
  // Navigation
  "house.fill": "home",
  "rectangle.stack.fill": "layers",
  "book.fill": "menu-book",
  "checkmark.circle.fill": "check-circle",
  "brain.fill": "psychology",
  "gearshape.fill": "settings",
  "target": "track-changes",
  "checklist": "checklist",
  "info.circle.fill": "info",
  
  // Common
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "xmark": "close",
  "plus": "add",
  "minus": "remove",
  "magnifyingglass": "search",
  "person.fill": "person",
  "person.circle.fill": "account-circle",
  "bell.fill": "notifications-active",
  "star.fill": "star",
  "heart.fill": "favorite",
  "trash.fill": "delete",
  "pencil": "edit",
  "arrow.right": "arrow-forward",
  "arrow.left": "arrow-back",
  "arrow.up": "arrow-upward",
  "arrow.down": "arrow-downward",
  
  // Study related
  "flame.fill": "local-fire-department",
  "clock.fill": "schedule",
  "chart.bar.fill": "bar-chart",
  "trophy.fill": "emoji-events",
  "lightbulb.fill": "lightbulb",
  "graduationcap.fill": "school",
  "doc.text.fill": "description",
  "folder.fill": "folder",
  "bookmark.fill": "bookmark",
  "flag.fill": "flag",
  "play.fill": "play-arrow",
  "pause.fill": "pause",
  "stop.fill": "stop",
  "speaker.wave.2.fill": "volume-up",
  "mic.fill": "mic",
  
  // Status
  "checkmark": "check",
  "xmark.circle.fill": "cancel",
  "exclamationmark.triangle.fill": "warning",
  "questionmark.circle.fill": "help",
  "lock.fill": "lock",
  "lock.open.fill": "lock-open",
};

type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name as string] || "help-outline";
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
