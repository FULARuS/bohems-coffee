import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { createRoot } from 'react-dom/client';
import Magnet from './vendor/react-bits/Magnet.jsx';
import { initLocale } from './locale.js';

gsap.registerPlugin(ScrollTrigger);

const visual = document.querySelector('[data-hero-visual]');
const image = visual.querySelector('[data-hero-image]');
const light = visual.querySelector('[data-window-light]');

const motion = gsap.matchMedia();
motion.add('(prefers-reduced-motion: no-preference)', () => {
  const loop = gsap.timeline({ paused: true, repeat: -1 });
  loop
    .to(image, {
      keyframes: { scale: [1, 1.025, 1], easeEach: 'sine.inOut' },
      duration: 8.4
    }, 0)
    .fromTo(light, { xPercent: -24, opacity: 0 }, {
      keyframes: { xPercent: [-24, 5, 27], opacity: [0, 0.37, 0], easeEach: 'sine.inOut' },
      duration: 8.4
    }, 0);

  for (const [index, wisp] of [...visual.querySelectorAll('.coffee-steam i')].entries()) {
    const drift = index === 1 ? 27 : -17;
    loop.fromTo(wisp, { opacity: 0, scale: 0.47 }, {
      keyframes: {
        opacity: [0, 0.56, 0.37, 0.11, 0],
        xPercent: [0, 3, drift * 0.25, drift * 0.72, drift],
        yPercent: [17, -2, -28, -48, -73],
        scale: [0.47, 0.62, 0.87, 1.13, 1.38],
        rotation: [2, -5, -9, 0, 12],
        easeEach: 'none'
      },
      duration: 4.4,
      immediateRender: false
    }, index * 2);
  }

  let inView = false;

  function updatePlayback() {
    loop.paused(!inView || document.hidden);
  }

  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.intersectionRatio >= 0.14;
    updatePlayback();
  }, { threshold: 0.14 });
  observer.observe(visual);
  document.addEventListener('visibilitychange', updatePlayback);

  const lenis = new Lenis({ lerp: 0.115, stopInertiaOnNavigate: true });
  const tick = (time) => lenis.raf(time * 1000);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(tick);

  for (const element of document.querySelectorAll('[data-reveal]')) {
    gsap.from(element, {
      y: 20,
      opacity: 0.72,
      duration: 0.72,
      ease: 'power3.out',
      scrollTrigger: { trigger: element, start: 'top 91%', once: true }
    });
  }

  return () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', updatePlayback);
    gsap.ticker.remove(tick);
    lenis.destroy();
  };
});

const actions = [...document.querySelectorAll('[data-magnet]')].map((container) => {
  const link = container.querySelector('a');
  const { className, target, rel, textContent, dataset } = link;
  return {
    root: createRoot(container),
    href: link.getAttribute('href'),
    className,
    target,
    rel,
    key: dataset.i18n,
    turkish: textContent
  };
});

initLocale((dictionary) => {
  for (const { root, href, className, target, rel, key, turkish } of actions) {
    root.render(
      <Magnet padding={15} magnetStrength={6.5} maxOffset={5}>
        <a className={className} href={href} target={target || undefined} rel={rel || undefined}>
          {dictionary[key] ?? turkish}
        </a>
      </Magnet>
    );
  }
  ScrollTrigger.refresh(true);
});
