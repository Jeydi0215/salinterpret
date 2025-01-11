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

const ResultCard = ({ result, onCardClick }) => {
  return (
    <CardContainer onClick={() => onCardClick(result)}>
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
        <ResultCard key={result.id} result={result} onCardClick={onCardClick} />
      ))}
    </GridContainer>
  );
};

const CoursesPage = () => {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [category, setCategory] = useState(''); // State for category filter
  const [categories, setCategories] = useState([]); // State for unique categories
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const listRef = ref(imageDb, 'courses'); // Referring to the "courses" folder in Firebase Storage
        const res = await listAll(listRef);
        const fileUrls = await Promise.all(
          res.items.map(async (item) => {
            const url = await getDownloadURL(item);
            const metadata = await getMetadata(item);
            const timestamp = new Date(metadata.timeCreated); // Use timeCreated field

            return {
              id: item.name,
              title: metadata.customMetadata?.title || item.name,
              tags: metadata.customMetadata?.tags || 'No tags available',
              category: metadata.customMetadata?.category || 'Uncategorized', // Assume categories are added in metadata
              thumbnailUrl: url,
              timestamp: timestamp,
            };
          })
        );

        // Sort images from oldest to newest based on timestamp
        fileUrls.sort((a, b) => a.timestamp - b.timestamp);

        setFiles(fileUrls);
        setFilteredFiles(fileUrls); // Initially show all files

        // Extract unique categories
        const uniqueCategories = [
          ...new Set(fileUrls.map((file) => file.category)),
        ];
        setCategories(uniqueCategories);
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
      setFilteredFiles(files.filter((file) => file.category === category)); // Filter by category
    }
  }, [category, files]); // Update filtered files when category changes

  const handleCardClick = (result) => {
    setSelectedResult(result); // Set selected result to trigger popup
  };

  const goToQuiz = () => {
    navigate('/quiz'); // Navigate to the quiz page
  };

  const closePopup = () => {
    setSelectedResult(null); // Close popup
  };

  return (
    <>
      <UserNavbar />
      <PageContainer>
        {/* Dynamic Category Dropdown */}
        <CategorySelect
          onChange={(e) => setCategory(e.target.value)}
          value={category}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </CategorySelect>

        <ResultGrid results={filteredFiles} onCardClick={handleCardClick} />
        
        {/* Popup Logic */}
        {selectedResult && (
          <Popup>
            <h2>{selectedResult.title}</h2>
            <p>
              <strong>Instruction:</strong> {selectedResult.tags}
            </p>
            <button onClick={closePopup} className="close-button">
              Close
            </button>
          </Popup>
        )}
        
        <QuizButton onClick={goToQuiz}>Go to Quiz</QuizButton>
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
  background-color: #333;
  color: white;
  border-radius: 5px;
  border: none;
  width: 200px;
  position: absolute;
  right: 20px;  
  top: 20px;    
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

  h2 {
    font-size: 30px;
  }
  p {
    font-size: 25px;
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
