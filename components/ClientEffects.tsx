"use client";

import { useEffect } from "react";

/**
 * 기존 시안의 클라이언트 동작을 옮긴 것:
 * - [data-reveal] 스크롤 리빌
 * - 헤더 스크롤 그림자
 * - [data-photo] 로컬 이미지가 실제로 있으면 자동 교체(플레이스홀더 대체)
 * - [data-flight-path] 히어로 SVG 라인 1회 그리기
 * JS가 꺼져 있으면 내용은 그대로 보이도록 설계했습니다.
 */
export default function ClientEffects() {
  useEffect(() => {
    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // flight path 1회 그리기
    const fp = document.querySelector<SVGPathElement>("[data-flight-path]");
    if (fp) {
      if (reduce) {
        fp.style.strokeDashoffset = "0";
      } else {
        requestAnimationFrame(() => {
          fp.style.transition = "stroke-dashoffset .75s ease";
          fp.style.strokeDashoffset = "0";
        });
      }
    }

    // 스크롤 리빌
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );
    const show = (el: HTMLElement) => el.classList.remove("is-hidden");
    let io: IntersectionObserver | undefined;
    let safety: ReturnType<typeof setTimeout> | undefined;
    if (!reduce && "IntersectionObserver" in window) {
      const vh = window.innerHeight || 800;
      els.forEach((el) => el.classList.add("is-hidden"));
      requestAnimationFrame(() => {
        els.forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top < vh * 0.92) show(el);
        });
      });
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              show(en.target as HTMLElement);
              io?.unobserve(en.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
      );
      els.forEach((el) => io?.observe(el));
      safety = setTimeout(() => els.forEach(show), 1100);
    }

    // data-photo: 로컬 이미지가 로드되면 표시
    const photos = Array.from(
      document.querySelectorAll<HTMLImageElement>("[data-photo]")
    );
    photos.forEach((el) => {
      const url = el.getAttribute("data-photo");
      if (!url) return;
      const probe = new Image();
      probe.onload = () => {
        el.src = url;
        el.style.display = "block";
      };
      probe.src = url;
    });

    // 헤더 그림자
    const onScroll = () => {
      const h = document.querySelector<HTMLElement>("[data-header]");
      if (h)
        h.style.boxShadow =
          window.scrollY > 8 ? "0 6px 20px rgba(16,34,44,0.07)" : "none";
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io?.disconnect();
      if (safety) clearTimeout(safety);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
