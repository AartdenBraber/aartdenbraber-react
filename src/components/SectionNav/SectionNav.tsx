import React, { useMemo, useRef } from 'react';
import './SectionNav.scss';
import { useSectionProgress } from '../../hooks/useSectionProgress';
import { useLanguage } from '../../i18n/LanguageContext';

const SectionNav: React.FC = () => {
  const { t } = useLanguage();
  const navRef = useRef<HTMLElement>(null);

  const items = t.nav.items;
  const ids = useMemo(() => items.map((item) => item.href.replace('#', '')), [items]);

  const { activeId, visible } = useSectionProgress(ids, navRef);
  const activeIndex = ids.indexOf(activeId ?? '');

  return (
    <nav
      className="section-nav"
      ref={navRef}
      aria-label={t.nav.label}
      // visibility: hidden houdt hem buiten de tabvolgorde zolang hij weg is.
      data-visible={visible ? 'true' : 'false'}
      data-has-active={activeIndex >= 0 ? 'true' : 'false'}
      style={{ '--active-index': Math.max(activeIndex, 0) } as React.CSSProperties}
    >
      <span className="section-nav__pill" aria-hidden="true" />

      <ol className="section-nav__list">
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
