import { renderBorderSVG } from '../../lib/pageBorders';

interface Props {
  type: string;
  color: string;
  width: number;
  height: number;
}

export function PageBorderOverlay({ type, color, width, height }: Props) {
  if (type === 'none') return null;
  const inner = renderBorderSVG(type, width, height, color);
  if (!inner) return null;

  return (
    <svg
      width={width}
      height={height}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}
