import React, { useEffect, useState } from 'react';
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from 'firebase/storage';
import AdminNavbar from '../components/AdminNavbar';
import styled from 'styled-components';
import MovieLogo from "../assets/homeTitle.webp";
import { FaPlay } from 'react-icons/fa';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

const Main = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const storage = getStorage();
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 0);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchMediaItems = async () => {
      try {
        const mediaRef = ref(storage, 'easy');
        const mediaList = await listAll(mediaRef);
        const items = await Promise.all(mediaList.items.map(async (item) => {
          const url = await getDownloadURL(item);
          const metadata = await getMetadata(item);
          const { title, tags } = metadata.customMetadata || {};

          return { id: item.name, url, title, tags };
        }));
        setMediaItems(items);
      } catch (error) {
        console.error('Error fetching media items:', error);
      }
    };

    fetchMediaItems();
  }, [storage]);

  const playVideo = (url) => {
    setSelectedVideoUrl(url);
  };

  const closeVideo = () => {
    setSelectedVideoUrl(null);
  };

  const filteredMediaItems = mediaItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.tags && item.tags.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const deleteVideo = (videoId) => {
    const confirmed = window.confirm("Are you sure you want to delete this video from your list?");
    if (confirmed) {
      try {
        setMediaItems(prevItems => prevItems.filter(item => item.id !== videoId));
        alert("Video deleted.");
      } catch (error) {
        console.error("Error deleting video:", error);
        alert("Failed to delete video.");
      }
    }
  };

  return (
    <>
      <Container>
        <AdminNavbar isScrolled={isScrolled} />
        
        {/* Adjusted and Centered Search Bar */}
        <SearchContainer>
          <SearchBar
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>

        {/* Videos below the search bar */}
        <MoviesContainer>
          {filteredMediaItems.map((item, index) => (
            <CustomMediaItem
              key={item.id}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => playVideo(item.url)}
            >
              <VideoThumbnail src={item.url} controls={false} />
              <DeleteButton onClick={() => deleteVideo(item.id)}>
                Delete
              </DeleteButton>
            </CustomMediaItem>
          ))}
        </MoviesContainer>

        {/* Video Player Modal */}
        {selectedVideoUrl && (
          <VideoPlayerWrapper>
            <VideoPlayer
              src={selectedVideoUrl}
              controls
              autoPlay
            />
            <CloseButton onClick={closeVideo}>Close</CloseButton>
          </VideoPlayerWrapper>
        )}

        {/* Footer */}
        <Footer>
          <p>&copy; Numbros</p>
        </Footer>
      </Container>
    </>
  );
};

const VideoThumbnail = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none; 
  background-color: black;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-top: 0px; 
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: center;  
  align-items: center; 
  width: 100%;
  height: 40vh;  
  position: relative;
  padding-top: -60px; 
`;

const SearchBar = styled.input`
  width: 80%; 
  max-width: 600px;
  padding: 0.8rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1.2rem;
  text-align: center; 
  background-color: #f9f9f9;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const MoviesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
  flex-grow: 1;
`;

const CustomMediaItem = styled.div`
  width: 300px;
  height: 170px;
  cursor: pointer;
  position: relative;
  background-color: #000;
  background: url('path/to/fallback-thumbnail.jpg') no-repeat center center;
  background-size: cover;
`;

const DeleteButton = styled.button`
  background-color: red;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  position: absolute;
  right: 10px;  
  top: 50%;  
  transform: translateY(-50%); 
  font-size: 1rem;
  border-radius: 4px;
  z-index: 10;
`;

const VideoPlayerWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const VideoPlayer = styled.video`
  max-width: 80%;
  max-height: 80%;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #333;
  border: none;
  color: white;
  padding: 0.5rem;
  cursor: pointer;
`;

const Footer = styled.footer`
  background-color: #111;
  color: #fff;
  text-align: center;
  padding: 1rem;
  position: fixed;
  bottom: 0;
  width: 100%;
`;

export default Main;
