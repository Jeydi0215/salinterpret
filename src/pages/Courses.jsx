import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDownloadURL, listAll, ref, getMetadata } from 'firebase/storage';
import styled from 'styled-components';
import UserNavbar from '../components/UserNavbar';
import { imageDb } from '../utils/firebase-config'; // Adjust path as needed

// Styled components
const PageContainer = styled.div`
  margin-top: 60px; 
  padding: 20px;
  background: black;
  color: #fff;
  font-family: Arial, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ResultCard = ({ result, onClick }) => {
  return (
    <CardContainer onClick={() => onClick(result)}>
      <img
        src={result.thumbnailUrl}
        alt={result.title}
        className="thumbnail"
      />
      <div className="title">
        <h4>{result.title}</h4>
      </div>
    </CardContainer>
  );
};

const ResultGrid = ({ results, onCardClick }) => {
  return (
    <GridContainer>
      {results.map((result) => (
        <ResultCard key={result.id} result={result} onClick={onCardClick} />
      ))}
    </GridContainer>
  );
};

const CoursesPage = () => {
  const [files, setFiles] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const listRef = ref(imageDb, 'courses');
        const res = await listAll(listRef);
        const fileUrls = await Promise.all(res.items.map(async (item) => {
          const url = await getDownloadURL(item);
          const metadata = await getMetadata(item);
          const timestamp = new Date(metadata.timeCreated); // Use timeCreated field

          console.log('Image URL:', url); // Log the URL
          console.log('Metadata:', metadata); // Log metadata
          console.log('Timestamp:', timestamp); // Log the timestamp

          return { 
            id: item.name, 
            title: metadata.customMetadata?.title || item.name,
            tags: metadata.customMetadata?.tags || 'No tags available',
            thumbnailUrl: url,
            timestamp: timestamp
          };
        }));

        // Sort images from oldest to newest based on timestamp
        fileUrls.sort((a, b) => a.timestamp - b.timestamp);

        console.log('Sorted Images:', fileUrls); // Log sorted images

        setFiles(fileUrls);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles(); 
  }, []);

  const handleCardClick = (result) => {
    setSelectedResult(result);
  };

  const goToQuiz = () => {
    navigate('/quiz'); // Navigate to the quiz page
  };

  return (
    <>
      <UserNavbar />
      <PageContainer>
        <ResultGrid results={files} onCardClick={handleCardClick} />
        {selectedResult && (
          <Popup>
            <h2>{selectedResult.title}</h2>
          
            <p><strong>Tags:</strong> {selectedResult.tags}</p>
            <button
              onClick={() => setSelectedResult(null)}
              className="close-button"
            >
              Close
            </button>
          </Popup>
        )}
        <QuizButton onClick={goToQuiz}>
          Go to Quiz
        </QuizButton>
      </PageContainer>
    </>
  );
};

const CardContainer = styled.div`
  flex: 1 1 calc(50% - 10px); // Take up half of the container width minus gap

  // Optional: Adjust minimum width for smaller screens
  min-width: 150px;

  cursor: pointer;

  .thumbnail {
    width: 100%;
    border-radius: 8px;
  }

  .title {
    text-align: center;
    margin-top: 10px;

    h4 {
      font-size: 14px;
      margin: 0;
    }
  }
`

const GridContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 20px;
  gap: 10px;
  justify-content: center; // Center cards on mobile

  @media (max-width: 768px) {
    gap: 5px; // Reduce gap on mobile
  }
`;


const Popup = styled.div`
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff;
  color: #000;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  max-width: 80vw;

  .popup-image {
    width: 100%;
    border-radius: 8px;
    max-height: 400px;
    object-fit: cover;
  }

  .close-button {
    margin-top: 10px;
    padding: 10px 20px;
    background-color: black;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
`;

const QuizButton = styled.button`
  padding: 10px 20px;
  background-color: #ff6600;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 20px auto;
  display: block;
`;

export default CoursesPage;
