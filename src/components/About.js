// libs
import React from 'react';

function About() {

    return (
        <div className='palette-wrapper'>
            <h2>Introduction</h2>

            <p>Color is an extremely important element in design, data visualization, and art. The right palette can help convey a message clearly, or help bring a visual project to life.</p>

            <p>In particular, <i>continuous</i> color palettes are useful in digital applications where color reinforces a message. Data analysts use continuous palette to convey stories through data, and generative artists (those who make art with code) use color to express the inherit beauty in mathematics and randomness.</p>

            <p>Color Curves makes it fun and simple to create unique color palettes for art and data projects.</p>

            <p>Instead of relying on color theory, image analysis, or "expertise", Color Curves allows anyone to generate limitless palettes using simple geometry.</p>

            <p>It is my hope in creating this tool that pleasing palettes will make their way into even more projects, delighting artists and viewers alike.</p>

            <h2>Inspiration</h2>

            <p>Color Curves was inspired by the pioneering computer graphics researchers who invented the HSL and HSV color spaces, as well as by the work of <a href="https://bost.ocks.org/mike/">Mike Bostok</a>, who introduced me to continuous color palettes by way of the fantastic <a href="https://github.com/d3/d3-scale-chromatic">d3-scale-chromatic</a> library.</p>

            <h2>Contact</h2>

            Let me know what you think of Color Curves!

            <li><a href="mailto:markracette@gmail.com">markracette@gmail.com</a></li>

            <li><a href="twitter.com/markracette">twitter.com/markracette</a></li>

            <li><a href="instagram.com/rgb.ig">instagram.com/rgb.ig</a></li>
        </div>
    );

}

export default About;