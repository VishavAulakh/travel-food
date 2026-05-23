import React from "react";
import { TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PressableScale } from "./PressableScale";

type Props = {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onPress?: () => void;
  editable?: boolean;
  autoFocus?: boolean;
  showVoiceIcon?: boolean;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search for restaurants and food",
  onSubmit,
  onPress,
  editable = true,
  autoFocus,
  showVoiceIcon = true,
}: Props) {
  const content = (
    <View
      className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-ink-100"
      style={{
        shadowColor: "#1F1408",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <Ionicons name="search" size={20} color="#FC5F30" />
      <TextInput
        className="flex-1 ml-3 text-ink-900 text-sm"
        placeholder={placeholder}
        placeholderTextColor="#737373"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        editable={editable}
        autoFocus={autoFocus}
        pointerEvents={!editable ? "none" : "auto"}
      />
      {showVoiceIcon ? (
        <View className="w-px h-5 bg-ink-200 mx-2" />
      ) : null}
      {showVoiceIcon ? (
        <Ionicons name="mic-outline" size={20} color="#FC5F30" />
      ) : null}
    </View>
  );

  if (!editable && onPress) {
    return (
      <PressableScale onPress={onPress} scaleTo={0.99} haptic="light">
        {content}
      </PressableScale>
    );
  }
  return content;
}
