import React from "react";
import MovieCarousel from "./MovieCarousel";

/**
 * Uses the same MovieCarousel layout as NowShowing:
 * centre-focussed 3-card carousel, auto-slide, indicator dots.
 */
const ComingSoonSection = ({ movies = [], onMoviePress, onViewAll, locationButton }) => {
    return (
        <MovieCarousel
            title="Sắp Chiếu"
            movies={movies}
            onMoviePress={onMoviePress}
            onViewAll={onViewAll}
            locationButton={locationButton}
        />
    );
};

export default React.memo(ComingSoonSection);
