// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

/**
 * SF Symbols to Material Icons mappings for DFS Elite Study Planner
 */
const MAPPING: Record<string, MaterialIconName> = {
  // Tab bar icons
  "house.fill": "home",
  "target": "track-changes",
  "checklist": "checklist",
  "book.fill": "menu-book",
  "gearshape.fill": "settings",
  // Navigation icons
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "chevron.down": "expand-more",
  "chevron.up": "expand-less",
  // Action icons
  "plus": "add",
  "plus.circle.fill": "add-circle",
  "checkmark": "check",
  "checkmark.circle.fill": "check-circle",
  "xmark": "close",
  "xmark.circle.fill": "cancel",
  // Feature icons
  "flame.fill": "local-fire-department",
  "trophy.fill": "emoji-events",
  "star.fill": "star",
  "clock.fill": "schedule",
  "calendar": "calendar-today",
  "bell.fill": "notifications",
  "person.fill": "person",
  "brain": "psychology",
  "lightbulb.fill": "lightbulb",
  "graduationcap.fill": "school",
  "chart.bar.fill": "bar-chart",
  "arrow.up.right": "trending-up",
  "play.fill": "play-arrow",
  "pause.fill": "pause",
  "arrow.clockwise": "refresh",
  // Content icons
  "doc.text.fill": "description",
  "folder.fill": "folder",
  "bookmark.fill": "bookmark",
  "heart.fill": "favorite",
  "share": "share",
  "ellipsis": "more-horiz",
  // Status icons
  "exclamationmark.triangle.fill": "warning",
  "info.circle.fill": "info",
  "questionmark.circle.fill": "help",
};

type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
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
  const iconName = MAPPING[name] || "help";
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
