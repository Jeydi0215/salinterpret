import React, { useEffect, useState } from 'react';
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from 'firebase/storage';
import UserNavbar from '../components/UserNavbar';
import styled from 'styled-components';
import background from "../assets/login.jpg";
import MovieLogo from "../assets/homeTitle.webp";
import { FaPlay, FaSearch, FaTimes } from 'react-icons/fa';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

const Main = () => {
  // State declarations
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaItems, setMediaItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const storage = getStorage();

  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch media items from Firebase
  useEffect(() => {
    const fetchMediaItems = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const mediaRef = ref(storage, 'easy');
        const mediaList = await listAll(mediaRef);
        
        const itemPromises = mediaList.items.map(async (item) => {
          try {
            const url = await getDownloadURL(item);
            const metadata = await getMetadata(item);
            const customData = metadata.customMetadata || {};
            
            return { 
              id: item.name,
              url, 
              title: customData.title || item.name,
              timestamp: metadata.timeCreated
            };
          } catch (error) {
            console.error("Error fetching item:", error);
            return null;
          }
        });
        
        const results = await Promise.all(itemPromises);
        setMediaItems(results.filter(item => item !== null));
      } catch (error) {
        console.error('Error fetching media items:', error);
        setError('Failed to load videos. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMediaItems();
  }, [storage]);

  // Video player functions
  const playVideo = (url, title) => {
    setSelectedVideoUrl(url);
    setSelectedVideoTitle(title);
    document.body.style.overflow = 'hidden';
  };

  const closeVideo = () => {
    setSelectedVideoUrl(null);
    setSelectedVideoTitle(null);
    document.body.style.overflow = 'auto';
  };

  // Search functions
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Filter media items based on search query
  const filteredMediaItems = mediaItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Modal toggle
  const toggleMoreInfo = () => {
    setShowMoreInfo(!showMoreInfo);
    document.body.style.overflow = showMoreInfo ? 'auto' : 'hidden';
  };

  return (
    <Container>
      <UserNavbar isScrolled={isScrolled} />
      
      {/* Hero Section */}
      <HeroSection>
        <HeroBackground src={background} alt="background" />
        <HeroContent>
          <LogoContainer>
            <img src={MovieLogo} alt="Movie Logo" />
          </LogoContainer>
          <HeroButtons>
            <PlayButton onClick={() => navigate('/Player')}>
              <FaPlay className="icon" />
              Play
            </PlayButton>
            <InfoButton onClick={toggleMoreInfo}>
              <AiOutlineInfoCircle className="icon" />
              More Info
            </InfoButton>
          </HeroButtons>
        </HeroContent>
      </HeroSection>
      
      {/* Search Section */}
      <SearchContainer>
        <SearchWrapper>
          <SearchIcon><FaSearch /></SearchIcon>
          <SearchBar
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <ClearButton onClick={clearSearch}>
              <FaTimes />
            </ClearButton>
          )}
        </SearchWrapper>
      </SearchContainer>
      
      {/* Content Section */}
      <ContentSection>
        <SectionTitle>
          {searchQuery 
            ? `Search Results for "${searchQuery}" (${filteredMediaItems.length})` 
            : 'Available Videos'}
        </SectionTitle>
        
        {isLoading ? (
          <LoadingContainer>
            <LoadingSpinner />
            <p>Loading videos...</p>
          </LoadingContainer>
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : filteredMediaItems.length === 0 ? (
          <EmptyState>
            <p>No videos found{searchQuery ? ' matching your search' : ''}.</p>
            {searchQuery && <ResetButton onClick={clearSearch}>Clear Search</ResetButton>}
          </EmptyState>
        ) : (
          <VideoGrid>
            {filteredMediaItems.map((item, index) => (
              <VideoCard
                key={item.id || index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => playVideo(item.url, item.title)}
              >
                <VideoThumbnail>
                  <video src={item.url} muted />
                  {hoveredIndex === index && (
                    <VideoOverlay>
                      <PlayIcon><FaPlay /></PlayIcon>
                    </VideoOverlay>
                  )}
                </VideoThumbnail>
              </VideoCard>
            ))}
          </VideoGrid>
        )}
      </ContentSection>
      
      {/* Video Player Modal */}
      {selectedVideoUrl && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h3>{selectedVideoTitle}</h3>
              <CloseButton onClick={closeVideo}><FaTimes /></CloseButton>
            </ModalHeader>
            <VideoPlayer
              src={selectedVideoUrl}
              controls
              autoPlay
            />
          </ModalContent>
        </Modal>
      )}
      
      {/* Info Modal */}
      {showMoreInfo && (
        <Modal onClick={toggleMoreInfo}>
          <InfoModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <h2>Salinterpret</h2>
              <CloseButton onClick={toggleMoreInfo}><FaTimes /></CloseButton>
            </ModalHeader>
            <ModalBody>
              <p>
                A word play of Salin and Interpret. Salinterpret is a PWA used to create a bridge of 
                communication between hearing-impaired and non-hearing-impaired persons and create a 
                more welcoming environment for them.
              </p>
              <p>
                Our app includes some features that can be a solution to the problem,
                it includes real-time translation, and we also included a sign-to-word language 
                feature which will also help non-hearing-impaired communicate with hearing-impaired persons.
              </p>
            </ModalBody>
          </InfoModalContent>
        </Modal>
      )}
      
      <Footer>
        <p>&copy; {new Date().getFullYear()} Numbros</p>
      </Footer>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  background-color: #0f0f0f;
  color: #fff;
  min-height: 100vh;
  position: relative;
  padding-bottom: 60px; /* Space for footer */
`;

const HeroSection = styled.div`
  position: relative;
  height: 85vh;
  overflow: hidden;
`;

const HeroBackground = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(50%) saturate(120%);
`;

const HeroContent = styled.div`
  position: absolute;
  bottom: 10%;
  left: 0;
  width: 100%;
  padding: 0 5%;
  
  @media (max-width: 768px) {
    bottom: 15%;
  }
`;

const LogoContainer = styled.div`
  width: 40%;
  max-width: 500px;
  min-width: 250px;
  margin-bottom: 2rem;
  
  img {
    width: 100%;
    height: auto;
  }
  
  @media (max-width: 768px) {
    width: 60%;
  }
  
  @media (max-width: 480px) {
    width: 80%;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    width: 80%;
  }
`;

const PlayButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 2rem;
  border-radius: 4px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background-color: #fff;
  color: #000;
  
  .icon {
    margin-right: 0.8rem;
    font-size: 1rem;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.8);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1.5rem;
    font-size: 1rem;
  }
`;

const InfoButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 2rem;
  border-radius: 4px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background-color: rgba(109, 109, 110, 0.7);
  color: white;
  
  .icon {
    margin-right: 0.8rem;
    font-size: 1rem;
  }
  
  &:hover {
    background-color: rgba(109, 109, 110, 0.9);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1.5rem;
    font-size: 1rem;
  }
`;

const SearchContainer = styled.div`
  padding: 2rem 5%;
  display: flex;
  justify-content: center;
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 12px;
  color: #777;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 0.8rem 2.5rem;
  border-radius: 30px;
  border: none;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    background-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
  }
  
  &::placeholder {
    color: #aaa;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: white;
  }
`;

const ContentSection = styled.div`
  padding: 0 5% 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
`;

const VideoCard = styled.div`
  border-radius: 8px;
  overflow: hidden;
  background-color: #1a1a1a;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }
`;

const VideoThumbnail = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: #000;
  
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  }
`;

const VideoOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${VideoThumbnail}:hover & {
    opacity: 1;
  }
`;

const PlayIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    color: white;
    font-size: 1.2rem;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  width: 100%;
  max-width: 900px;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const InfoModalContent = styled.div`
  background-color: #1a1a1a;
  width: 100%;
  max-width: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  
  h2, h3 {
    margin: 0;
  }
`;

const ModalBody = styled.div`
  padding: 0 1.5rem 1.5rem;
  line-height: 1.6;
  
  p:not(:last-child) {
    margin-bottom: 1rem;
  }
`;

const VideoPlayer = styled.video`
  width: 100%;
  max-height: 80vh;
  background-color: black;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  text-align: center;
  padding: 2rem;
  background-color: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
`;

const ResetButton = styled.button`
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Footer = styled.footer`
  background-color: rgba(0, 0, 0, 0.3);
  text-align: center;
  padding: 1rem;
  position: absolute;
  bottom: 0;
  width: 100%;
  
  p {
    margin: 0;
    font-size: 0.9rem;
    color: #aaa;
  }
`;

export default Main;
