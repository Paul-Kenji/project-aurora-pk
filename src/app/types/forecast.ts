export type Meteo = "DAY" | "CLEAR" | "CLOUD" | "CLOUDY";

export type Prediction = {
  hour: string;
  percentage: number;
  reason: string;
  meteo: Meteo;
  kp: number;
};

export type KpPoint = {
  date: string;
  middleKp: number;
  highKp: number;
};
