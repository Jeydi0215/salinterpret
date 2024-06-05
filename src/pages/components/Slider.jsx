import React from 'react';
import CardSlider from './CardSlider';

export default function Slider({ movies }) {
    const getMoviesFromRange = ({ from, to }) => {
        return movies?.slice(from, to); 
    }

    return (
        <div>
            <CardSlider title="New Tutorials" data={getMoviesFromRange({ from: 0, to: 10 })} />
            <CardSlider title="Easy Tutorials" data={getMoviesFromRange({ from: 10, to: 20 })} />
            <CardSlider title="Intermediate Tutorials" data={getMoviesFromRange({ from: 20, to: 30 })} />
            <CardSlider title="Advance Tutorials" data={getMoviesFromRange({ from: 30, to: 40 })} />
        </div>
    );
}
