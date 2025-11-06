import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface JoinExistingRoomProps {
  visible: boolean;
  onClose: () => void;
  onJoinRoom: (userName: string, roomCode: string, avatar?: string) => void;
}

const JoinExistingRoom: React.FC<JoinExistingRoomProps> = ({
  visible,
  onClose,
  onJoinRoom,
}) => {
  const [userName, setUserName] = useState<string>("");
  const [roomCode, setRoomCode] = useState<string>("");
  const [userNameFocused, setUserNameFocused] = useState<boolean>(false);
  const [roomCodeFocused, setRoomCodeFocused] = useState<boolean>(false);

  const handleClose = () => {
    setUserName("");
    setRoomCode("");
    setUserNameFocused(false);
    setRoomCodeFocused(false);
    onClose();
  };

  const handleJoin = () => {
    if (userName.trim() && roomCode.trim()) {
      onJoinRoom(userName.trim(), roomCode.trim().toUpperCase());
      setUserName("");
      setRoomCode("");
    }
  };

  const isFormValid = userName.trim().length > 0 && roomCode.trim().length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center px-6"
          onPress={handleClose}
        >
          <Pressable
            className="w-full max-w-[400px]"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Container */}
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="relative">
                {/* Shadow */}
                <View className="absolute top-[4px] left-[4px] right-[-4px] bottom-[-4px] bg-gray-900 rounded-2xl" />

                {/* Modal Content */}
                <View className="relative bg-primary border-4 border-gray-900 rounded-2xl p-6">
                  {/* Close Button */}
                  <TouchableOpacity
                    onPress={handleClose}
                    className="absolute top-4 right-4 z-10"
                  >
                    <View className="relative">
                      <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-full" />
                      <View className="relative bg-white border-2 border-gray-900 rounded-full w-8 h-8 items-center justify-center">
                        <Text className="text-gray-900 text-lg font-bold">
                          ×
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Title */}
                  <Text
                    className="text-2xl font-bold text-gray-900 text-center mb-2"
                    style={{ fontFamily: "MerriweatherSans_700Bold" }}
                  >
                    Join Existing Room
                  </Text>

                  <Text
                    className="text-sm text-gray-600 text-center mb-6"
                    style={{ fontFamily: "MerriweatherSans_400Regular" }}
                  >
                    Enter your name and room code
                  </Text>

                  {/* User Name Input */}
                  <View className="mb-4">
                    <Text
                      className="text-sm font-semibold text-gray-900 mb-2"
                      style={{ fontFamily: "MerriweatherSans_400Regular" }}
                    >
                      Your Name
                    </Text>
                    <View className="relative">
                      {/* Shadow */}
                      <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />

                      {/* Input Container */}
                      <View
                        className={`relative bg-white rounded-xl ${
                          userNameFocused
                            ? "border-4 border-gray-900"
                            : "border-2 border-gray-900"
                        }`}
                      >
                        <TextInput
                          value={userName}
                          onChangeText={setUserName}
                          onFocus={() => setUserNameFocused(true)}
                          onBlur={() => setUserNameFocused(false)}
                          placeholder="Enter your name"
                          placeholderTextColor="#9ca3af"
                          className="px-4 py-3 text-gray-900 text-base"
                          style={
                            {
                              fontFamily: "MerriweatherSans_400Regular",
                              outline: "none",
                            } as any
                          }
                        />
                      </View>
                    </View>
                  </View>

                  {/* Room Code Input */}
                  <View className="mb-6">
                    <Text
                      className="text-sm font-semibold text-gray-900 mb-2"
                      style={{ fontFamily: "MerriweatherSans_400Regular" }}
                    >
                      Room Code
                    </Text>
                    <View className="relative">
                      {/* Shadow */}
                      <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />

                      {/* Input Container */}
                      <View
                        className={`relative bg-white rounded-xl ${
                          roomCodeFocused
                            ? "border-4 border-gray-900"
                            : "border-2 border-gray-900"
                        }`}
                      >
                        <TextInput
                          value={roomCode}
                          onChangeText={setRoomCode}
                          onFocus={() => setRoomCodeFocused(true)}
                          onBlur={() => setRoomCodeFocused(false)}
                          placeholder="Enter room code"
                          placeholderTextColor="#9ca3af"
                          autoCapitalize="characters"
                          className="px-4 py-3 text-gray-900 text-base"
                          style={
                            {
                              fontFamily: "MerriweatherSans_400Regular",
                              outline: "none",
                            } as any
                          }
                        />
                      </View>
                    </View>
                  </View>

                  {/* Join Button */}
                  <View className="relative">
                    <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-[14px]" />
                    <TouchableOpacity
                      onPress={handleJoin}
                      disabled={!isFormValid}
                      className={`relative border-2 border-gray-900 rounded-[14px] py-4 px-8 ${
                        isFormValid ? "bg-[#ffe4e6]" : "bg-gray-300"
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text
                        className="text-gray-900 text-lg text-center font-bold"
                        style={{ letterSpacing: -0.3 }}
                      >
                        {isFormValid ? "Join Room" : "Fill All Fields"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default JoinExistingRoom;
