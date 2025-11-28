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
  switch (meteo) {
    case "DAY":
      return <SunnyIcon fontSize={size} style={{ color: "#FFD700" }} />;
    case "CLOUD":
      return <CloudIcon fontSize={size} style={{ color: "#B0C4DE" }} />;
    case "CLOUDY":
      return <NightsStayIcon fontSize={size} style={{ color: "#778899" }} />;
    default:
      return <AutoAwesomeIcon fontSize={size} style={{ color: "#00BFFF" }} />;
  }
}
