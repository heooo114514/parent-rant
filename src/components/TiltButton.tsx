'use client';

import Tilt from 'react-parallax-tilt';

export default function TiltButton({ children }: { children: React.ReactNode }) {
  return (
    <Tilt
      tiltMaxAngleX={20}
      tiltMaxAngleY={20}
      perspective={1000}
      scale={1.05}
      transitionSpeed={400}
      className="inline-block"
      glareEnable={true}
      glareMaxOpacity={0.45}
      glareColor="#ffffff"
      glarePosition="all"
    >
      {children}
    </Tilt>
  );
}
