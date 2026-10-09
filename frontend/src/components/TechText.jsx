import { useMemo } from "react";
import "./TechText.css";

export default function TechText({
  text = "Acadex",
  color = "#f4f1ea",
  accentColor = "#d4d4d8",
  fontSize = 28,
  fontWeight = 700,
  letterSpacing = -0.05,
  className = "",
  fontFamily = "",
  reveal = "letter",
  dashLength = 4,
  dashGap = 2,
  specks = 12,
  reach = 200,
  softness = 0.7,
  strokeWidth = 1.5,
  speed = 1,
  lineStyle = "dashed",
  selection = false,
  labels = false,
  draggable = false,
  sweep = false,
}) {
  const characters = useMemo(() => text.split(""), [text]);
  const speckDots = useMemo(
    () =>
      Array.from({ length: Number(specks) || 0 }, (_, index) => ({
        id: `${text}-${index}`,
        left: `${(index * 19) % 100}%`,
        top: `${(index * 23 + 12) % 100}%`,
        size: `${(index % 3) + 2}px`,
        delay: `${(index * 0.09) / Number(speed || 1)}s`,
      })),
    [specks, speed, text],
  );

  return (
    <span
      className={`tech-text ${className}`.trim()}
      data-text={text}
      style={{
        color,
        fontSize,
        fontWeight,
        letterSpacing,
        fontFamily: fontFamily || undefined,
        "--tech-accent": accentColor,
        "--tech-reveal": reveal,
        "--tech-dash-length": dashLength,
        "--tech-dash-gap": dashGap,
        "--tech-reach": `${reach}px`,
        "--tech-softness": softness,
        "--tech-stroke-width": `${strokeWidth}px`,
        "--tech-speed": `${speed}`,
        "--tech-line-style": lineStyle,
        "--tech-selection": selection ? 1 : 0,
        "--tech-labels": labels ? 1 : 0,
        "--tech-draggable": draggable ? 1 : 0,
        "--tech-sweep": sweep ? 1 : 0,
      }}
    >
      {characters.map((char, index) => (
        <span
          key={`${char}-${index}`}
          className="tech-text-char"
          style={{
            animationDelay: `${index * 0.06 / Number(speed || 1)}s`,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}

      {speckDots.length > 0 && (
        <span className="tech-text-specks" aria-hidden="true">
          {speckDots.map((speck) => (
            <span
              key={speck.id}
              className="tech-text-speck"
              style={{
                left: speck.left,
                top: speck.top,
                width: speck.size,
                height: speck.size,
                animationDelay: speck.delay,
              }}
            />
          ))}
        </span>
      )}
    </span>
  );
}
