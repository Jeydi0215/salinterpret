import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDownloadURL, listAll, ref, getMetadata } from 'firebase/storage';
import styled from 'styled-components';
import UserNavbar from '../components/UserNavbar';
import { imageDb } from '../utils/firebase-config'; // Adjust path as needed

// Styled components with enhanced aesthetics
const PageContainer = styled.div`
  margin-top: 50px;
  padding: 30px;
  color: #fff;
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const PageHeader = styled.div`
  margin-bottom: 40px;
  text-align: center;
  
  h1 {
    font-size: 36px;
    font-weight: 600;
    margin-bottom: 12px;
    background: linear-gradient(90deg, #41bfde 0%, #4e7fff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 1px;
  }
  
  p {
    color: #b3b3b3;
    font-size: 16px;
    max-width: 600px;
    margin: 0 auto;
  }
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 20px;
`;

const ResultsCount = styled.span`
  color: #b3b3b3;
  font-size: 14px;
`;

const CategorySelect = styled.select`
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 500;
  background-color: rgba(65, 191, 222, 0.1);
  color: #41bfde;
  border-radius: 8px;
  border: 1px solid rgba(65, 191, 222, 0.3);
  width: 220px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(65, 191, 222, 0.15);
    border-color: rgba(65, 191, 222, 0.5);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(65, 191, 222, 0.2);
  }
  
  option {
    background-color: #1a1a1a;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  padding: 10px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 25px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 25px;
  }
`;

const CardContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    
    .thumbnail {
      transform: scale(1.05);
    }
    
    .overlay {
      opacity: 0.7;
    }
  }
  
  .thumbnail-container {
    position: relative;
    overflow: hidden;
    height: 180px;
  }
  
  .thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 60%);
    opacity: 0.5;
    transition: opacity 0.3s ease;
  }
  
  .card-content {
    padding: 16px 20px;
  }
  
  .category-tag {
    display: inline-block;
    padding: 5px 10px;
    background-color: rgba(65, 191, 222, 0.2);
    color: #41bfde;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 10px;
  }
  
  .title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 5px 0;
    line-height: 1.3;
  }
  
  .description {
    font-size: 13px;
    color: #b3b3b3;
    margin: 0;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const Popup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #1a1a1a;
  color: #fff;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  max-width: 600px;
  width: 90%;
  
  h2 {
    font-size: 28px;
    margin-top: 0;
    margin-bottom: 20px;
    color: #fff;
    font-weight: 600;
  }
  
  p {
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 30px;
    color: #e0e0e0;
  }
  
  .tag-label {
    font-weight: 500;
    color: #41bfde;
    margin-right: 8px;
  }
  
  .popup-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
  }
  
  .close-button {
    padding: 12px 25px;
    background-color: transparent;
    color: #e0e0e0;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    cursor: pointer;
    font-size: 15px;
    font-weight: 500;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
  
  .view-button {
    padding: 12px 25px;
    background: linear-gradient(90deg, #41bfde 0%, #4e7fff 100%);
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 15px;
    font-weight: 500;
    transition: all 0.2s ease;
    
    &:hover {
      opacity: 0.9;
    }
  }
`;

const QuizButton = styled.button`
  padding: 18px 40px;
  margin: 50px auto 20px;
  display: block;
  background: linear-gradient(90deg, #41bfde 0%, #4e7fff 100%);
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 6px 20px rgba(65, 191, 222, 0.3);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(65, 191, 222, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 999;
  animation: fadeIn 0.2s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// Enhanced Result Card Component
const ResultCard = ({ result, onCardClick }) => {
  return (
    <CardContainer onClick={() => onCardClick(result)}>
      <div className="thumbnail-container">
        <img
          src={result.thumbnailUrl}
          alt={result.title}
          className="thumbnail"
        />
        <div className="overlay" />
      </div>
      <div className="card-content">
        <span className="category-tag">{result.category}</span>
        <h3 className="title">{result.title}</h3>
        <p className="description">{truncateText(result.tags, 60)}</p>
      </div>
    </CardContainer>
  );
};

// Helper function to truncate text
const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Grid component
const ResultGrid = ({ results, onCardClick }) => {
  return (
    <GridContainer>
      {results.map((result) => (
        <ResultCard key={result.id} result={result} onCardClick={onCardClick} />
      ))}
    </GridContainer>
  );
};

// Main Component
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
              tags: metadata.customMetadata?.tags || 'No description available',
              category: metadata.customMetadata?.category || 'Uncategorized',
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
        <PageHeader>
        
        </PageHeader>

        <FilterBar>
          <ResultsCount>{filteredFiles.length} courses available</ResultsCount>
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
        </FilterBar>

        <ResultGrid results={filteredFiles} onCardClick={handleCardClick} />
        
        {/* Quiz Button */}
        <QuizButton onClick={goToQuiz}>Take the Quiz</QuizButton>
        
        {/* Popup Logic with Overlay */}
        {selectedResult && (
          <>
            <Overlay onClick={closePopup} />
            <Popup>
              <h2>{selectedResult.title}</h2>
              <p>
                <span className="tag-label">Instructions:</span>
                {selectedResult.tags}
              </p>
              <div className="popup-actions">
                <button onClick={closePopup} className="close-button">
                  Close
                </button>
                <button className="view-button">
                  View Course
                </button>
              </div>
            </Popup>
          </>
        )}
      </PageContainer>
    </>
  );
};

export default CoursesPage;
