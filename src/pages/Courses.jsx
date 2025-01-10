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
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [category, setCategory] = useState(''); // State for category filter
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
            category: metadata.customMetadata?.category || 'Uncategorized', // Assume categories are added in metadata
            thumbnailUrl: url,
            timestamp: timestamp
          };
        }));

        // Sort images from oldest to newest based on timestamp
        fileUrls.sort((a, b) => a.timestamp - b.timestamp);

        console.log('Sorted Images:', fileUrls); // Log sorted images

        setFiles(fileUrls);
        setFilteredFiles(fileUrls); // Initially show all files
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles(); 
  }, []);

  useEffect(() => {
    if (category === '') {
      setFilteredFiles(files); // If no category is selected, show all files
    } else {
      setFilteredFiles(files.filter(file => file.category === category)); // Filter by category
    }
  }, [category, files]); // Update filtered files when category changes

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
        {/* Category Dropdown */}
        <CategorySelect onChange={(e) => setCategory(e.target.value)} value={category}>
          <option value="">All Categories</option>
          <option value="Category1">Alphabets</option>
          <option value="Category2">Common Phrases</option>
          <option value="Category3">Category 3</option>
          {/* Add more categories as needed */}
        </CategorySelect>

        <ResultGrid results={filteredFiles} onCardClick={handleCardClick} />
        {selectedResult && (
          <Popup>
            <h2>{selectedResult.title}</h2>
            <p><strong>Instruction:</strong> {selectedResult.tags}</p>
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
  flex: 1 1 calc(25% - 20px); // Each card takes up 25% width with some gap
  max-width: 300px;           // Optional max width for cards
  cursor: pointer;

  .thumbnail {
    width: 100%;               
    height: auto;              
    object-fit: cover;         
    border-radius: 8px;
  }

  .title {
    text-align: center;
    margin-top: 10px;

    h4 {
      font-size: 16px;
      margin: 0;
    }
  }
`;

const GridContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 20px;
  gap: 20px;                    
  justify-content: space-between; 

  @media (max-width: 1024px) {
    gap: 15px;                  
  }

  @media (max-width: 768px) {
    flex: 1 1 calc(50% - 20px); 
  }

  @media (max-width: 480px) {
    flex: 1 1 100%;              
  }
`;

const CategorySelect = styled.select`
  padding: 10px;
  font-size: 16px;
  margin-bottom: 20px;
  background-color: #333;
  color: white;
  border-radius: 5px;
  border: none;
  width: 200px;
`;

const Popup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff;
  color: #000;
  padding: 30px;
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
    cursor: pointer; /* Added missing semicolon here */
  }

  h2 {
    font-size: 30px;
  }
  p {
    font-size: 25px;
  }
`;

const QuizButton = styled.button`
  padding: 20px 30px;
  background-color: #41bfde;
  font-size: 20px;
  font-weight: bold;
  color: black;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 20px auto;
  display: block;
`;

export default CoursesPage;
