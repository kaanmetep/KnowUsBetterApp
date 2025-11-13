/**
 * Avatar utility functions for mapping avatar IDs to image sources
 */

export const getAvatarImage = (avatarId: string) => {
  const avatarMap: Record<string, any> = {
    boy_avatar_1: require("../../assets/images/avatars/boy_avatar_1.png"),
    boy_avatar_2: require("../../assets/images/avatars/boy_avatar_2.png"),
    boy_avatar_3: require("../../assets/images/avatars/boy_avatar_3.png"),
    boy_avatar_4: require("../../assets/images/avatars/boy_avatar_4.png"),
    girl_avatar_1: require("../../assets/images/avatars/girl_avatar_1.png"),
    girl_avatar_2: require("../../assets/images/avatars/girl_avatar_2.png"),
    girl_avatar_3: require("../../assets/images/avatars/girl_avatar_3.png"),
    girl_avatar_4: require("../../assets/images/avatars/girl_avatar_4.png"),
  };
  return avatarMap[avatarId] || null;
};
