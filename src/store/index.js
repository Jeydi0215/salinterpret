import { createAsyncThunk, createSlice, configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_KEY, TMDB_BASE_URL } from "../utils/constants";


const initialState = {
    movies: [],
    genresLoaded: false,
    genres: [],
};

export const getGenres = createAsyncThunk('main/genres', async () => {
    const { data:{genres} } = await axios.get(`${TMDB_BASE_URL}/genre/movie/list?api_key=${API_KEY}`
    );
    return genres;
});

const createArrayFromRawData = (array, moviesArray, genres) => {
    array.forEach((movie) => {
        const movieGenres = [];
        movie.genre_ids.forEach((genre) => {
            const name = genres.find(({ id }) => id === genre);
            if (name) movieGenres.push(name.name);
        });
        if (movie.backdrop_path) {
            moviesArray.push({
                id: movie.id,
                name: movie.original_name ? movie.original_name : movie.original_title,
                image: movie.backdrop_path,
                genres: movieGenres.slice(0, 3),
            });
        }
    });
};


const getRawData = async (api, genres, paging) => {
    const moviesArray = [];
    for(let i = 1; moviesArray.length < 60 && i < 10; i++){
        const { data: { results } } = await axios.get(
            `${api}${paging ? `&page=${i}` : ""}`);
        createArrayFromRawData(results, moviesArray, genres);
    }
    return moviesArray;
};


export const fetchMovies = createAsyncThunk(
    "main/trending",
    async ({ type }, thunkApi) => {
        const { main: { genres } } = thunkApi.getState();
        return getRawData(`${TMDB_BASE_URL}/trending/${type}/week?api_key=${API_KEY}`, genres, true);
    }
);

const mainSlice = createSlice({
    name: 'main',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getGenres.fulfilled, (state, action) => {
            state.genres = action.payload;
            state.genresLoaded = true;
        });
        builder.addCase(fetchMovies.fulfilled, (state, action) => {
            state.movies = action.payload;
        });
    },
});

export const store = configureStore({
    reducer: {
        main: mainSlice.reducer,
    },
});
