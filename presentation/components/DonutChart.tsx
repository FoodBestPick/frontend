import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { G, Circle } from "react-native-svg";
import { ThemeContext } from "../../context/ThemeContext"; 

interface DonutChartProps {
  size?: number;
  strokeWidth?: number;
  data: { name: string; value: number; color: string }[];
  centerTop?: string;
  centerBottom?: string;
}

export const DonutChart = ({
  size = 220,
  strokeWidth = 24,
  data,
  centerTop,
  centerBottom,
}: DonutChartProps) => {
  const { theme } = useContext(ThemeContext); 

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.border}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
        </Svg>
        <View style={styles.center}>
          <Text style={[styles.centerTop, { color: theme.textPrimary }]}>
            0
          </Text>
          <Text style={[styles.centerBottom, { color: theme.textSecondary }]}>
            {centerBottom}
          </Text>
        </View>
      </View>
    );
  }

  let startAngle = 0;

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {data.map((item, i) => {
            const strokeDasharray = `${(item.value / total) * circumference} ${circumference}`;
            const strokeDashoffset = -(startAngle / 360) * circumference;
            startAngle += (item.value / total) * 360;
            return (
              <Circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            );
          })}
        </G>
      </Svg>

      <View style={styles.center}>
        <Text style={[styles.centerTop, { color: theme.textPrimary }]}>
          {centerTop}
        </Text>
        <Text style={[styles.centerBottom, { color: theme.textSecondary }]}>
          {centerBottom}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  centerTop: {
    fontSize: 22,
    fontWeight: "800",
  },
  centerBottom: {
    fontSize: 12,
    marginTop: 2,
  },
});
