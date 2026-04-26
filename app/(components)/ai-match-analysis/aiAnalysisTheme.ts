import type { ComponentProps } from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

type Fa6IconName = ComponentProps<typeof FontAwesome6>["name"];

export type AiAnalysisUiVariant = "default" | "know_me_well";

type ModalVisual = {
  headerIcon: Fa6IconName;
  headerIconColor: string;
  headerIconBg: string;
  confirmIcon: Fa6IconName;
  confirmGradient: [string, string, string];
  confirmBorderColor: string;
};

type ButtonVisual = {
  gradient: [string, string, string];
  borderColor: string;
  shadowColor: string;
  icon: Fa6IconName;
  iconColor: string;
  iconBackground: string;
};

export const AI_ANALYSIS_BUTTON_VISUAL: Record<
  AiAnalysisUiVariant,
  ButtonVisual
> = {
  default: {
    gradient: ["#FFF5F5", "#FFE8E8", "#FFDCDC"],
    borderColor: "#FFBDBD",
    shadowColor: "#FF8080",
    icon: "heart-pulse",
    iconColor: "#E05A5A",
    iconBackground: "rgba(255, 128, 128, 0.15)",
  },
  know_me_well: {
    gradient: ["#FFF7ED", "#FFEDD5", "#FED7AA"],
    borderColor: "#FDC78E",
    shadowColor: "#f97316",
    icon: "magnifying-glass",
    iconColor: "#ea580c",
    iconBackground: "rgba(234,88,12,0.12)",
  },
};

export const AI_ANALYSIS_MODAL_VISUAL: Record<AiAnalysisUiVariant, ModalVisual> =
  {
    default: {
      headerIcon: "heart-pulse",
      headerIconColor: "#E05A5A",
      headerIconBg: "rgba(255, 128, 128, 0.15)",
      confirmIcon: "heart-pulse",
      confirmGradient: ["#FFF5F5", "#FFE8E8", "#FFDCDC"],
      confirmBorderColor: "#FFBDBD",
    },
    know_me_well: {
      headerIcon: "magnifying-glass",
      headerIconColor: "#ea580c",
      headerIconBg: "rgba(234,88,12,0.12)",
      confirmIcon: "magnifying-glass",
      confirmGradient: ["#FFF7ED", "#FFEDD5", "#FED7AA"],
      confirmBorderColor: "#FDC78E",
    },
  };

export type AiAnalysisFeatureItem = {
  icon: Fa6IconName;
  color: string;
  bg: string;
  text: string;
};

export type AiAnalysisModalContent = {
  title: string;
  description: string;
  features: AiAnalysisFeatureItem[];
  confirmLabel: string;
  cancelLabel: string;
} & Pick<
  ModalVisual,
  "headerIcon" | "headerIconColor" | "headerIconBg" | "confirmIcon"
> &
  Pick<ModalVisual, "confirmGradient" | "confirmBorderColor">;

export function getAiAnalysisModalContent(
  t: (key: string) => string,
  variant: AiAnalysisUiVariant
): AiAnalysisModalContent {
  const v = AI_ANALYSIS_MODAL_VISUAL[variant];
  if (variant === "know_me_well") {
    return {
      title: t("knowMeWell.aiModalTitle"),
      description: t("knowMeWell.aiModalDesc"),
      features: [
        {
          icon: "eye-slash",
          color: "#ea580c",
          bg: "rgba(234,88,12,0.1)",
          text: t("knowMeWell.aiModalFeature1"),
        },
        {
          icon: "lightbulb",
          color: "#f59e0b",
          bg: "rgba(245,158,11,0.1)",
          text: t("knowMeWell.aiModalFeature2"),
        },
        {
          icon: "handshake",
          color: "#3b82f6",
          bg: "rgba(59,130,246,0.1)",
          text: t("knowMeWell.aiModalFeature3"),
        },
      ],
      confirmLabel: t("knowMeWell.aiModalConfirm"),
      cancelLabel: t("knowMeWell.aiModalCancel"),
      headerIcon: v.headerIcon,
      headerIconColor: v.headerIconColor,
      headerIconBg: v.headerIconBg,
      confirmIcon: v.confirmIcon,
      confirmGradient: v.confirmGradient,
      confirmBorderColor: v.confirmBorderColor,
    };
  }
  return {
    title: t("gameFinished.aiModalTitle"),
    description: t("gameFinished.aiModalDesc"),
    features: [
      {
        icon: "heart",
        color: "#E05A5A",
        bg: "rgba(255, 128, 128, 0.12)",
        text: t("gameFinished.aiModalFeature1"),
      },
      {
        icon: "shuffle",
        color: "#3B82F6",
        bg: "rgba(59, 130, 246, 0.12)",
        text: t("gameFinished.aiModalFeature2"),
      },
      {
        icon: "lightbulb",
        color: "#F59E0B",
        bg: "rgba(245, 158, 11, 0.12)",
        text: t("gameFinished.aiModalFeature3"),
      },
    ],
    confirmLabel: t("gameFinished.aiModalConfirm"),
    cancelLabel: t("gameFinished.aiModalCancel"),
    headerIcon: v.headerIcon,
    headerIconColor: v.headerIconColor,
    headerIconBg: v.headerIconBg,
    confirmIcon: v.confirmIcon,
    confirmGradient: v.confirmGradient,
    confirmBorderColor: v.confirmBorderColor,
  };
}

export function getAiAnalysisButtonCopy(
  t: (key: string) => string,
  variant: AiAnalysisUiVariant
) {
  if (variant === "know_me_well") {
    return {
      title: t("knowMeWell.aiButton"),
      subtitle: t("knowMeWell.aiButtonSub"),
    };
  }
  return {
    title: t("gameFinished.aiAnalysisButton"),
    subtitle: t("gameFinished.aiAnalysisPowered"),
  };
}
