import { useEffect, useRef } from "react";
import "./App.css";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function App() {
  const scrollSectionRef = useRef<HTMLElement>(null);
  const laneRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLImageElement>(null);
  const greenRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const rafIdRef = useRef<number>(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const updateFromScroll = () => {
      const section = scrollSectionRef.current;
      const lane = laneRef.current;
      const car = carRef.current;
      const green = greenRef.current;
      const text = textRef.current;

      if (!section || !lane || !car || !green || !text) {
        tickingRef.current = false;
        return;
      }

      const rect = section.getBoundingClientRect();
      const scrollRange = rect.height - window.innerHeight;
      const rawProgress = scrollRange <= 0 ? 0 : clamp(-rect.top / scrollRange, 0, 1);
      const p = easeOutCubic(rawProgress);

      const laneWidth = lane.offsetWidth;
      const carWidth = car.offsetWidth;
      const fractionVisibleAtEnd = 0.35;

      // Car center X position: starts at left (35% visible), ends at right (35% visible)
      const carCenterAtStart = carWidth * fractionVisibleAtEnd;
      const carCenterAtEnd = laneWidth - carWidth * fractionVisibleAtEnd;
      const carCenterX = carCenterAtStart + p * (carCenterAtEnd - carCenterAtStart);

      // Green width equals car center X position (green ends exactly where car center is)
      const greenWidth = carCenterX;

      // Position car with its center at carCenterX
      car.style.left = `${carCenterX}px`;
      car.style.transform = `translateY(-50%) translateX(-50%)`;
      
      // Set green width
      green.style.width = `${greenWidth}px`;
      
      // Text animation: fade in and slide right
      text.style.opacity = `${Math.min(rawProgress * 1.2, 1)}`;
      text.style.transform = `translateY(-50%) translateX(${rawProgress * 24}px)`;

      tickingRef.current = false;
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      rafIdRef.current = requestAnimationFrame(updateFromScroll);
    };

    const onResize = () => requestAnimationFrame(updateFromScroll);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    updateFromScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  return (
    <section ref={scrollSectionRef} className="h-[300vh] relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-white flex items-center justify-center">
        <div ref={laneRef} className="w-screen h-[240px] relative overflow-hidden">
          {/* Black road background layer */}
          <div className="absolute inset-0 bg-[#1C1C1C] z-0" />
          
          {/* Green overlay layer - grows from left to right */}
          <div ref={greenRef} className="absolute left-0 top-0 h-full bg-[#49C97D] z-10" />
          
          {/* Text layer */}
          <h1
            ref={textRef}
            className="absolute top-1/2 left-8 m-0 text-black font-extrabold whitespace-nowrap z-30 pointer-events-none text-5xl md:text-6xl lg:text-7xl tracking-tight"
          >
            WELCOME ITZFIZZ
          </h1>
          
          {/* Car layer - positioned at green/black boundary */}
          <img
            ref={carRef}
            src="/car.png"
            alt="Car"
            className="absolute top-1/2 h-[280px] w-auto object-contain z-20 pointer-events-none"
          />
        </div>
      </div>
    </section>
  );
}
