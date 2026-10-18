import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { colors } from '../lib/theme';

type Props = {
  size?: number;
  color?: string;
  gradientColors?: [string, string];
  showShadow?: boolean;
};

export function PulseLogo({
  size = 56,
  color = colors.accent,
  gradientColors,
  showShadow = false,
}: Props) {
  const gradId = 'pulse-logo-grad';
  const fill = gradientColors ? `url(#${gradId})` : color;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        {gradientColors && (
          <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradientColors[0]} />
            <Stop offset="100%" stopColor={gradientColors[1]} />
          </LinearGradient>
        )}
      </Defs>

      {/* Speed lines & dots on the trailing edge */}
      {/* Row 1 */}
      <Rect x="18" y="29.5" width="6" height="4.5" rx="2.25" fill={fill} />
      <Rect x="27.5" y="29.5" width="16" height="4.5" rx="2.25" fill={fill} />

      {/* Row 2 */}
      <Rect x="22.5" y="38" width="22" height="4.5" rx="2.25" fill={fill} />

      {/* Row 3 */}
      <Rect x="13.5" y="46.5" width="6" height="4.5" rx="2.25" fill={fill} />
      <Rect x="22.5" y="46.5" width="25" height="4.5" rx="2.25" fill={fill} />

      {/* Row 4 */}
      <Rect x="27.5" y="55" width="18" height="4.5" rx="2.25" fill={fill} />

      {/* Main supersonic arrow delta wing with rounded corners */}
      <Path
        d="M 37 12
           C 34.5 10.5 32 12.5 33 15.5
           L 39 30
           L 44 44
           L 39 58
           L 33 74.5
           C 32 77.5 34.5 79.5 37 78
           L 82 48.5
           C 85 46.5 85 43.5 82 41.5
           Z"
        fill={fill}
      />

      {/* Optional ground shadow */}
      {showShadow && (
        <Rect
          x="24"
          y="88"
          width="54"
          height="3.5"
          rx="1.75"
          fill="rgba(255, 255, 255, 0.12)"
        />
      )}
    </Svg>
  );
}
