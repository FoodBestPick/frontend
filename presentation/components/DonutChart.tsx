import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { G, Circle } from "react-native-svg";

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
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, d) => sum + d.value, 0);

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
        <Text style={styles.centerTop}>{centerTop}</Text>
        <Text style={styles.centerBottom}>{centerBottom}</Text>
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
    color: "#111",
  },
  centerBottom: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
});
