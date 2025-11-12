export const COLORS = {
  primary: "#00BDBD",  
  secondary: "#4FC3F7",

  background: "#F7F9FB", 
  card: "#FFFFFF",       
  text: "#222222",       
  subtext: "#666666",    
  border: "#E5E7EB",     

  success: "#4CAF50", 
  warning: "#FFA000",
  danger: "#E53935",  

  chartBlue: "#2196F3",
  chartOrange: "#FF8A65",
  chartGreen: "#4CAF50",
  chartYellow: "#FFCA28",
  chartPurple: "#9C27B0",

  tabInactive: "#B0BEC5",
  tabActive: "#00BDBD",
};

export const LightTheme = {
  background: "#F9F9F9",
  card: "#FFFFFF",
  textPrimary: "#222222",
  textSecondary: "#555555",
  border: "#E5E5E5",
  icon: "#0A84FF",
  chartLine: (opacity: number = 1) => `rgba(10,132,255,${opacity})`,
};

export const DarkTheme = {
  background: "#121212",
  card: "#1E1E1E",
  textPrimary: "#FFFFFF",
  textSecondary: "#BBBBBB",
  border: "#333333",
  icon: "#66B2FF",
  chartLine: (opacity: number = 1) => `rgba(100,180,255,${opacity})`,
};
