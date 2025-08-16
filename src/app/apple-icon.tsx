import { ImageResponse } from 'next/og';

// Apple touch icon metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

// Apple touch icon generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ef4444', // Red background
          borderRadius: '20px', // Apple icon style
        }}
      >
        <div
          style={{
            fontSize: '80px',
            fontWeight: 'bold',
            color: 'white',
            display: 'flex',
          }}
        >
          H
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
