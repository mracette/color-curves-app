// libs
import React from 'react';

function About() {

    return (
        <div className='row'>
            <div className='col-12'>
                <div className='palette-wrapper'>
                    <h2>Introduction</h2>

                    <p>Color is an important element in design, data visualization, and art. The right palette can help convey a message clearly or bring a visual project to life.</p>

                    <p>In particular, <i>continuous</i> color palettes are useful in digital applications where color reinforces a message. Data analysts use continuous palettes to convey stories through data, and generative artists (those who make art with code) use color to express the inherit beauty in mathematics and randomness.</p>

                    <p>Color Curves makes it fun and simple to create unique color palettes for art and data projects.</p>

                    <p>Instead of relying on color theory, image analysis, or "expertise", Color Curves allows anyone to generate limitless palettes using simple geometry. It is my hope in creating this tool that palettes will make their way into even more projects, delighting artists and viewers alike.</p>

                    <h2>Inspiration</h2>

                    <p>Color Curves was inspired by the pioneering computer graphics researchers who invented the HSL and HSV color spaces, as well as by the work of <a href="https://bost.ocks.org/mike/">Mike Bostok</a>, who introduced me to continuous color palettes by way of the <a href="https://github.com/d3/d3-scale-chromatic">d3-scale-chromatic</a> library.</p>

                    <h2>Resources</h2>
                    <p>
                        <ul>
                            <li><a href="https://github.com/mracette/color-curves-app">Documentation</a></li>

                            <li><a href="https://github.com/mracette/color-curves-app/issues">File a bug or feature request</a></li>

                            <li><a href="https://www.npmjs.com/package/color-curves">NPM package</a></li>
                        </ul>
                    </p>
                    <h2>Contact</h2>
                    <p>

                        Let me know what you think of Color Curves:
                        <ul>
                            <li><a href="mailto:markracette@gmail.com">markracette@gmail.com</a></li>

                            <li><a href="https://twitter.com/markracette">twitter.com/markracette</a></li>

                            <li><a href="https://instagram.com/rgb.ig">instagram.com/rgb.ig</a></li>

                            <li><a href="https://github.com/mracette">github.com/mracette</a></li>
                        </ul>
                    </p>
                </div>
            </div>
        </div>
    );

}

export default About;