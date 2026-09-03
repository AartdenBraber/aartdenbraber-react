import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

const BIRTH_DATE = new Date('1992-05-10');

const berekenLeeftijd = (vandaag: Date) => {
    let leeftijd = vandaag.getFullYear() - BIRTH_DATE.getFullYear();

    const alJarigGeweest =
        vandaag.getMonth() > BIRTH_DATE.getMonth() ||
        (vandaag.getMonth() === BIRTH_DATE.getMonth() && vandaag.getDate() >= BIRTH_DATE.getDate());

    if (!alJarigGeweest) {
        leeftijd--;
    }

    return leeftijd;
};

const Intro: React.FC = () => {
    const { t } = useLanguage();
    const [age, setAge] = useState<number>();

    useEffect(() => {
        setAge(berekenLeeftijd(new Date()));
    }, []);

    return (
        <section className="page-content homepage-intro parallax clearfix">
            <div className="parallax-bg background-cover"></div>

            <div className="entry-content content parallax-content">
                <div className="entry-content-page">
                    <header>
                        <h2 className="page-title">{t.intro.pageTitle}</h2>
                    </header>

                    {age !== undefined && t.intro.body(age)}
                </div>
            </div>
        </section>
    );
};

export default Intro;
