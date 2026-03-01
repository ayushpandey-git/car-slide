import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

import "./App.css";

/*function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}*/

// function easeOutCubic(t: number): number {
//   return 1 - Math.pow(1 - t, 3);
// }

export default function App() {
  const carImageUrl = `${import.meta.env.BASE_URL}car.png`;
  const [carSrc, setCarSrc] = useState(carImageUrl);
  const scrollSectionRef = useRef<HTMLElement>(null);
  const laneRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLImageElement>(null);
  const greenRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const topCardOneRef = useRef<HTMLDivElement>(null);
  const topCardTwoRef = useRef<HTMLDivElement>(null);
  const bottomCardOneRef = useRef<HTMLDivElement>(null);
  const bottomCardTwoRef = useRef<HTMLDivElement>(null);
  // const rafIdRef = useRef<number>(0);
  // const tickingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const createTransparentCar = async () => {
      const img = new Image();
      img.src = carImageUrl;
      await img.decode();

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const w = canvas.width;
      const h = canvas.height;
      const seen = new Uint8Array(w * h);
      const queue = new Uint32Array(w * h);
      let head = 0;
      let tail = 0;

      const isStrictBackground = (r: number, g: number, b: number): boolean =>
        r <= 10 && g <= 10 && b <= 10;

      const isFringeBackground = (r: number, g: number, b: number): boolean => {
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        return max <= 62 && max - min <= 12;
      };

      const enqueueIfBackground = (x: number, y: number) => {
        if (x < 0 || y < 0 || x >= w || y >= h) return;
        const idx = y * w + x;
        if (seen[idx]) return;
        const p = idx * 4;
        const r = data[p];
        const g = data[p + 1];
        const b = data[p + 2];
        if (isStrictBackground(r, g, b)) {
          seen[idx] = 1;
          queue[tail++] = idx;
        }
      };

      for (let x = 0; x < w; x += 1) {
        enqueueIfBackground(x, 0);
        enqueueIfBackground(x, h - 1);
      }
      for (let y = 0; y < h; y += 1) {
        enqueueIfBackground(0, y);
        enqueueIfBackground(w - 1, y);
      }

      while (head < tail) {
        const idx = queue[head++];
        const x = idx % w;
        const y = (idx - x) / w;

        enqueueIfBackground(x - 1, y);
        enqueueIfBackground(x + 1, y);
        enqueueIfBackground(x, y - 1);
        enqueueIfBackground(x, y + 1);
      }

      // Expand mask slightly into border-connected dark fringe pixels.
      let frontier: number[] = [];
      for (let i = 0; i < w * h; i += 1) {
        if (seen[i]) frontier.push(i);
      }

      for (let pass = 0; pass < 2; pass += 1) {
        const next: number[] = [];
        for (let i = 0; i < frontier.length; i += 1) {
          const idx = frontier[i];
          const x = idx % w;
          const y = (idx - x) / w;
          const neighbors = [
            [x - 1, y],
            [x + 1, y],
            [x, y - 1],
            [x, y + 1],
          ];

          for (let n = 0; n < neighbors.length; n += 1) {
            const nx = neighbors[n][0];
            const ny = neighbors[n][1];
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const nIdx = ny * w + nx;
            if (seen[nIdx]) continue;

            const p = nIdx * 4;
            const r = data[p];
            const g = data[p + 1];
            const b = data[p + 2];

            if (isFringeBackground(r, g, b)) {
              seen[nIdx] = 1;
              next.push(nIdx);
            }
          }
        }
        frontier = next;
        if (frontier.length === 0) break;
      }

      for (let i = 0; i < w * h; i += 1) {
        if (!seen[i]) continue;
        data[i * 4 + 3] = 0;
      }

      ctx.putImageData(imageData, 0, 0);
      if (!cancelled) {
        setCarSrc(canvas.toDataURL("image/png"));
      }
    };

    createTransparentCar().catch(() => {
      if (!cancelled) setCarSrc(carImageUrl);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
  const section = scrollSectionRef.current;
  const lane = laneRef.current;
  const car = carRef.current;
  const green = greenRef.current;
  const text = textRef.current;
  const topCardOne = topCardOneRef.current;
  const topCardTwo = topCardTwoRef.current;
  const bottomCardOne = bottomCardOneRef.current;
  const bottomCardTwo = bottomCardTwoRef.current;

  if (
    !section ||
    !lane ||
    !car ||
    !green ||
    !text ||
    !topCardOne ||
    !topCardTwo ||
    !bottomCardOne ||
    !bottomCardTwo
  ) {
    return;
  }

  const ctx = gsap.context(() => {
    const cards = [topCardOne, topCardTwo, bottomCardOne, bottomCardTwo];

    const getValues = () => {
      const laneWidth = lane.offsetWidth;
      const carWidth = car.offsetWidth;
      const startX = carWidth * 0.35;
      const endX = laneWidth - carWidth * 0.08;
      return {
        startX,
        endX,
        startRatio: startX / laneWidth,
        endRatio: endX / laneWidth,
      };
    };

    gsap.set(car, { left: 0, xPercent: -50, yPercent: -50 });
    gsap.set(green, { width: "100%", transformOrigin: "left center" });
    gsap.set(text, { yPercent: -50, clipPath: "inset(0 100% 0 0)" });
    gsap.set(cards, { autoAlpha: 0, y: 22 });


       gsap
      .timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
      .fromTo(
        car,
        { x: () => getValues().startX },
        { x: () => getValues().endX, duration: 1, ease: "none" },
        0
      )
      .fromTo(
        green,
        { scaleX: () => getValues().startRatio },
        { scaleX: () => getValues().endRatio, duration: 1, ease: "none" },
        0
      )
      .fromTo(
        text,
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 1, ease: "none" },
        0
      )
      .to(
        cards,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.12,
          stagger: 0.08,
          ease: "power2.out",
        },
        0.5
      );

  }, section);

  const ro = new ResizeObserver(() => ScrollTrigger.refresh());
  ro.observe(lane);

  return () => {
    ro.disconnect();
    ctx.revert();
  };
}, []);



  return (
    <section ref={scrollSectionRef} className="h-[360vh] relative bg-[#c8c8cb]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#c8c8cb]">
        <div className="absolute right-[7%] top-[8%] flex gap-3 md:gap-10 z-40 px-3 md:px-0">
          <div
            ref={topCardOneRef}
            className="w-[45vw] max-w-[310px] rounded-2xl bg-[#d6ea49] px-4 py-4 md:h-[170px] md:px-8 md:py-7 shadow-sm will-change-transform"
            style={{ opacity: 0, transform: "translateY(22px)" }}
          >
            <p className="banner-number text-[36px] leading-[1] text-[#111] md:text-[66px]">58%</p>
            <p className="banner-copy mt-2 text-[14px] leading-tight text-[#1c1c1c] md:text-[15px] md:whitespace-nowrap">
              Increase in pick up point use
            </p>
          </div>
          <div
            ref={topCardTwoRef}
            className="w-[45vw] max-w-[310px] rounded-2xl bg-[#353535] px-4 py-4 md:h-[170px] md:px-8 md:py-7 shadow-sm will-change-transform"
            style={{ opacity: 0, transform: "translateY(22px)", transition: "opacity 220ms linear, transform 220ms linear" }}
          >
            <p className="banner-number text-[36px] leading-[1] text-[#ededed] md:text-[66px]">27%</p>
            <p className="banner-copy mt-2 text-[14px] leading-tight text-[#f2f2f2] md:text-[15px] md:whitespace-nowrap">
              Increase in pick up point use
            </p>
          </div>
        </div>

        <div
          ref={laneRef}
          className="absolute left-0 top-1/2 h-[220px] w-screen -translate-y-1/2 relative overflow-hidden isolate"
        >
          <div className="absolute inset-0 bg-[#1f1f21] z-0" />
          <div ref={greenRef} className="absolute left-0 top-0 h-full bg-[#49d17f] z-10" />

          <h1
            ref={textRef}
            className="banner-display absolute top-1/2 left-4 md:left-8 m-0 z-20 pointer-events-none whitespace-nowrap text-black text-[56px] leading-none md:text-[120px] lg:text-[150px]"
          >
            WELCOME ITZFIZZ
          </h1>

          <img
            ref={carRef}
            src={carSrc}
            alt="Car"
            className="absolute top-1/2 h-[160px] md:h-[210px] w-auto object-contain z-30 pointer-events-none"
          />
        </div>

        <div className="absolute right-[7%] bottom-[9%] flex gap-3 md:gap-8 z-40 px-3 md:px-0">
          <div
            ref={bottomCardOneRef}
            className="w-[45vw] max-w-[330px] rounded-2xl bg-[#67bbec] px-4 py-4 md:h-[170px] md:px-8 md:py-7 shadow-sm will-change-transform"
            style={{ opacity: 0, transform: "translateY(22px)" }}

          >
            <p className="banner-number text-[36px] leading-[1] text-[#111] md:text-[66px]">23%</p>
            <p className="banner-copy mt-2 text-[14px] leading-tight text-[#1c1c1c] md:text-[15px] md:whitespace-nowrap">
              Decreased in customer phone calls
            </p>
          </div>
          <div
            ref={bottomCardTwoRef}
            className="w-[45vw] max-w-[330px] rounded-2xl bg-[#ff7426] px-4 py-4 md:h-[170px] md:px-8 md:py-7 shadow-sm will-change-transform"
            style={{ opacity: 0, transform: "translateY(22px)" }}

          >
            <p className="banner-number text-[36px] leading-[1] text-[#111] md:text-[66px]">40%</p>
            <p className="banner-copy mt-2 text-[14px] leading-tight text-[#1c1c1c] md:text-[15px] md:whitespace-nowrap">
              Decreased in customer phone calls
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
