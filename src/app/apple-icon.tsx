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
          background: '#1e293b', // slate-800 background
          borderRadius: '20px', // Apple icon style
        }}
      >
        <img
          src="/logo.png"
          alt="HeHePhim"
          style={{
            width: '80%',
            height: '80%',
            objectFit: 'contain',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
