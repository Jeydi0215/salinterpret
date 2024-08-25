import React, { useEffect, useState } from 'react';
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from 'firebase/storage';
import UserNavbar from '../components/UserNavbar';
import styled from 'styled-components';
import background from "../assets/login.jpg";
import MovieLogo from "../assets/homeTitle.webp";
import ThumbnailImage from '../assets/Thumbnail.jpg';
import { FaPlay, FaTrashAlt, FaEdit } from 'react-icons/fa';
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
          const thumbnailUrl = metadata.thumbnailUrl;
          const type = metadata.contentType;
          return { url, title, tags, thumbnailUrl, type };
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

  const deleteVideo = (index, event) => {
    event.stopPropagation();
    const updatedMediaItems = [...mediaItems];
    updatedMediaItems.splice(index, 1);
    setMediaItems(updatedMediaItems);
    console.log(updatedMediaItems);
  };

  const editTitle = (index, newTitle, event) => {
    event.stopPropagation();
    const updatedMediaItems = [...mediaItems];
    updatedMediaItems[index].title = newTitle;
    setMediaItems(updatedMediaItems);
    console.log(updatedMediaItems);
  };

  const filteredMediaItems = mediaItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.tags && item.tags.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <Container>
        <UserNavbar isScrolled={isScrolled} />
        <div className="hero">
          <img src= {background}alt="background" className="background-image" />
          <div className="container">
            <div className="logo">
              <img src={MovieLogo} alt="Movie Logo" className="logo-img" />
            </div>
            <div className="buttons flex">
              <button className="flex j-center a-center" onClick={() => navigate('/Player')}>
                <FaPlay className="icon" />
                Play
              </button>
              <button className="more" onClick={() => setShowMoreInfo(true)}>
                <AiOutlineInfoCircle className="icon" />
                More Info
              </button>
            </div>
          </div>
        </div>
        <SearchContainer>
          <SearchBar
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>
        <MoviesContainer>
          {filteredMediaItems.map((item, index) => (
            <CustomMediaItem
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => playVideo(item.url)}
            >
              {item.type.startsWith('image') ? (
                <Image src={item.url} alt={`Image ${index}`} />
              ) : (
                <>
                  <Thumbnail src={ThumbnailImage} alt={`Thumbnail ${index}`} />
                  {hoveredIndex === index && (
                    <PlayButton>
                      <FaPlay className="icon" />
                    </PlayButton>
                  )}
                </>
              )}
              <Actions>
                <Title>{item.title}<br />#{item.tags}</Title>
                <EditButton onClick={(event) => editTitle(index, prompt('Enter new title:'), event)}>
                  <FaEdit className="icon" />
                </EditButton>
                <DeleteButton onClick={(event) => deleteVideo(index, event)}>
                  <FaTrashAlt className="icon" />
                </DeleteButton>
              </Actions>
            </CustomMediaItem>
          ))}
        </MoviesContainer>
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
        {showMoreInfo && (
          <PopupOverlay>
            <PopupContainer>
              <CloseButton onClick={() => setShowMoreInfo(false)}>Close</CloseButton>
              <h2>Salinterpret</h2>
              <p>A word play of Salin and Interpret. Salinterpret is a PWA used to create a bridge of communication between hearing-impaired and non-hearing-impaired 
              persons and create a more welcoming environment for them. Our app includes some features that can be a solution to the problem,
               it includes real-time translation, and we also included a sign-to-word language feature which will also help non-hearing-impaired communicate with hearing-impaired persons.</p>
            </PopupContainer>
          </PopupOverlay>
        )}
        <Footer>
          <p>&copy; Numbros</p>
        </Footer>
      </Container>
      
    </>
  );
};

const Container = styled.div`
  background-color: #1B1212;

  .hero {
    position: relative;

    .background-image {
      filter: brightness(60%);
      height: 85vh;
    }

    img {
      height: 100vh;
      width: 100vw;
    }

    .container {
      position: absolute;
      bottom: 5rem;

      .logo img {
        width: 100%;
        height: 100%;
        margin-left: 5rem;
      }

      .buttons {
        margin: 5rem;
        gap: 2rem;
        display: flex;
        align-items: center;

        button {
          font-size: 1.4rem;
          gap: 1rem;
          border-radius: 0.2rem;
          padding: 0.5rem 2rem;
          border: none;
          cursor: pointer;
          transition: 0.2s ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;

          &:hover {
            opacity: 0.8;
          }

          &:nth-of-type(2) {
            background-color: rgba(109, 109, 110, 0.7);
            color: white;
          }

          .icon {
            margin-right: 0.5rem;
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    .hero .container {
      bottom: 3rem;

      .logo img {
        margin-left: 2rem;
      }

      .buttons {
        margin: 2rem;
        gap: 1rem;
        flex-direction: row;  
        justify-content: flex-start;  

        button {
          font-size: 1.2rem;
          padding: 0.5rem 1.5rem;
          width: auto; 
          justify-content: center;

          .icon {
            margin-right: 0.3rem;
          }
        }
      }
    }
  }

  @media (max-width: 480px) {
    .hero .container {
      bottom: 2rem;

      .logo img {
        margin-left: 1rem;
      }

      .buttons {
        margin: 1rem;
        gap: 0.5rem;
        flex-direction: column; 
        align-items: center;

        button {
          font-size: 1rem;
          padding: 0.4rem 1rem;
          width: 40%; 
          justify-content: flex-start;

          .icon {
            margin-right: 0.2rem;
          }
        }
      }
    }
  }
`;
const SearchContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end; 
  margin-top: 20px;
  align-items: flex-start; 
`;

const SearchBar = styled.input`
  width: 200px; 
  padding: 10px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
`;

const MoviesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
  justify-content: center; 
  align-items: flex-start; 
`;

const CustomMediaItem = styled.div`
  position: relative;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
`;

const Image = styled.img`
  width: 100%;
  max-height: 35%;
  border-radius: 8px;
`;

const Thumbnail = styled.img`
  width: 100%;
  max-height: 85%;
  border-radius: 8px;
`;

const Actions = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.div`
  color: white;
  flex-grow: 1;
`;

const PlayButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 6vw; /* Adjust the size here */
  cursor: pointer;
`;

const EditButton = styled(FaEdit)`
  color: white;
  cursor: pointer;
  font-size: 1vw;
`;

const DeleteButton = styled(FaTrashAlt)`
  color: white;
  cursor: pointer;
  font-size: 1vw; 
`;

const VideoPlayerWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const VideoPlayer = styled.video`
  max-width: 80%;
  max-height: 80%;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15%;
  right: 10%;
  padding: 5px 10px;
  transition: background-color 0.3s;
  padding: 0.5rem 1rem;
  background-color: #e50914;
  border: none;
  cursor: pointer;
  color: white;
  border-radius: 0.2rem;
  font-weight: bold;
  font-size: 1.05rem;

  &:hover {
    background-color: #EC5800;
  }
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const PopupContainer = styled.div`
  background-color: white;
  padding: 20px;
  color:black;
  border-radius: 8px;
  max-width:80%;
  font-family: Georgia, serif;
  font-size:19px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
`;

const Footer = styled.footer`
  width: 100%;
  background-color: #333;
  color: white;
  padding: 20px 0;
`; 

export default Main;
