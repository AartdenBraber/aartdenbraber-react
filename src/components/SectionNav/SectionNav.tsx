import React, { useEffect, useMemo, useRef } from 'react';
import './SectionNav.scss';
import { useNavLayout } from '../../hooks/useNavLayout';
import { useSectionProgress } from '../../hooks/useSectionProgress';
import { useLanguage } from '../../i18n/LanguageContext';

const SectionNav: React.FC = () => {
  const { t } = useLanguage();
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);

  const items = t.nav.items;
  const ids = useMemo(() => items.map((item) => item.href.replace('#', '')), [items]);

  const layout = useNavLayout(navRef);
  const { activeId, visible } = useSectionProgress(ids, navRef);
  const activeIndex = ids.indexOf(activeId ?? '');

  // In balkstand past niet alles op één scherm. De actieve sectie moet dan
  // meeschuiven, anders wijst de balk naar iets wat je niet ziet.
  useEffect(() => {
    const list = listRef.current;

    if (layout !== 'bar' || !list || activeIndex < 0) return;

    const active = list.children[activeIndex] as HTMLElement | undefined;

    if (!active) return;

    const target = Math.max(0, active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2);

    // Niet elke omgeving kent scrollTo op een element; dan maar zonder animatie.
    if (typeof list.scrollTo !== 'function') {
      list.scrollLeft = target;
      return;
    }

    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    list.scrollTo({ left: target, behavior: smooth ? 'smooth' : 'auto' });
  }, [activeIndex, layout]);

  return (
    <nav
      className="section-nav"
      ref={navRef}
      aria-label={t.nav.label}
      data-layout={layout}
      // visibility: hidden houdt hem buiten de tabvolgorde zolang hij weg is.
      data-visible={visible ? 'true' : 'false'}
    >
      <ol className="section-nav__list" ref={listRef}>
        {items.map((item, index) => {
          const state = index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'todo';

          return (
            <li className="section-nav__item" data-state={state} key={item.href}>
              <a
                className="section-nav__link"
                href={item.href}
                aria-current={state === 'active' ? 'true' : undefined}
              >
                <span className="section-nav__track" aria-hidden="true">
                  <span className="section-nav__fill" />
                </span>
                <span className="section-nav__label">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default SectionNav;
