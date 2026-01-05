'use client';

import Tilt from 'react-parallax-tilt';

export default function TiltButton({ children }: { children: React.ReactNode }) {
  return (
    <Tilt
      tiltMaxAngleX={20}
      tiltMaxAngleY={20}
      perspective={1000}
      scale={1.1}
      transitionSpeed={1500}
      className="inline-block"
    >
      {children}
    </Tilt>
  );
}
