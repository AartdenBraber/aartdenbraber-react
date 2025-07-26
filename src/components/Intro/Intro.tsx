import React, { useEffect, useState } from 'react';
import FocusSpotlight from '../FocusSpotlight/FocusSpotlight';

export interface IntroProps {
    anything?: string;
}

const Intro: React.FC<IntroProps> = () => {
    const [age, setAge] = useState<number>();

    useEffect(() => {
        const birthDate = new Date("1992-05-10");
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();

        const hasHadBirthdayThisYear =
            today.getMonth() > birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

        if (!hasHadBirthdayThisYear) {
            age--;
        }

        setAge(age);
    }, []);

    return (<>

        <section className="page-content homepage-intro parallax clearfix">
            <div
                className="parallax-bg background-cover"
            ></div>

            <div className="entry-content content parallax-content">
                <div className="entry-content-page">
                    <header>
                        <h2 className="page-title">Imagination is the beginning of creation</h2>
                    </header>

                    <p>
                        My name is <strong>Aart den Braber</strong>, a {age}-year-old freelance developer from the Netherlands.
                        I specialize in <strong>frontend development</strong> (Angular, TypeScript, UX) and
                        <strong> backend development</strong> using <strong>Node.js and Java</strong>.
                    </p>

                    <p>
                        While I also have experience with PHP and Python, I focus primarily on
                        <strong> JavaScript-based and Java backend environments</strong>. I'm most energized by projects that
                        require both <strong>creative problem-solving</strong> and <strong>thoughtful architecture</strong> —
                        ideally in long-term, remote roles where I can contribute meaningful value over time.
                    </p>

                    <p>
                        Curious if I'm the right fit for your project or client?<br />
                        Feel free to review my CV below to see how my experience aligns with your needs for a
                        senior freelance developer.
                    </p>
                </div>
            </div>
        </section>
    </>
    );
};

export default Intro;