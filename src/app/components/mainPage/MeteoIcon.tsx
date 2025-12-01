import { Meteo } from "../../types/forecast";
import SunnyIcon from "@mui/icons-material/Sunny";
import CloudIcon from "@mui/icons-material/Cloud";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

type MeteoProps = {
  meteo: Meteo;
  size?: "small" | "medium" | "large";
};

export default function MeteoIcon({ meteo, size = "medium" }: MeteoProps) {
  // Définir la taille en px selon le label
  const fontSizePx = size === "small" ? 24 : size === "medium" ? 36 : 48;

  // Style commun pour toutes les icônes
  const commonStyle = {
    fontSize: "inherit", // prend la taille du parent
    filter:
      size === "small"
        ? "drop-shadow(0 0 1px #f9f9f9ff)"
        : "drop-shadow(0 0 12px #f9f9f9ff)",
  };

  // Wrapper pour contrôler la taille proprement
  const IconWrapper = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: fontSizePx }}>{children}</div>
  );

  switch (meteo) {
    case "DAY":
      return (
        <IconWrapper>
          <SunnyIcon style={{ ...commonStyle, color: "#FFD700" }} />
        </IconWrapper>
      );
    case "CLOUD":
      return (
        <IconWrapper>
          <CloudIcon style={{ ...commonStyle, color: "#B0C4DE" }} />
        </IconWrapper>
      );
    case "CLOUDY":
      return (
        <IconWrapper>
          <NightsStayIcon style={{ ...commonStyle, color: "#778899" }} />
        </IconWrapper>
      );
    default:
      return (
        <IconWrapper>
          <AutoAwesomeIcon style={{ ...commonStyle, color: "#a3e4fa" }} />
        </IconWrapper>
      );
  }
}
