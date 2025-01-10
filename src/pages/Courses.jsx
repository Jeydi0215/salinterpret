import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDownloadURL, listAll, ref, getMetadata, uploadBytesResumable } from 'firebase/storage';
import styled from 'styled-components';
import UserNavbar from '../components/UserNavbar';
import { imageDb } from '../utils/firebase-config'; // Adjust path as needed
import { v4 as uuidv4 } from 'uuid';  // For generating unique file names

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
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState(''); // State for category filter
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const listRef = ref(imageDb, 'courses'); // Reference to the courses folder
        const res = await listAll(listRef);
        const fileUrls = await Promise.all(res.items.map(async (item) => {
          const url = await getDownloadURL(item);
          const metadata = await getMetadata(item);
          const timestamp = new Date(metadata.timeCreated);

          return { 
            id: item.name, 
            title: metadata.customMetadata?.title || item.name,
            tags: metadata.customMetadata?.tags || 'No tags available',
            category: metadata.customMetadata?.category || 'Uncategorized',
            thumbnailUrl: url,
            timestamp: timestamp
          };
        }));

        // Sort images from oldest to newest based on timestamp
        fileUrls.sort((a, b) => a.timestamp - b.timestamp);

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
  }, [category, files]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleTagsChange = (e) => {
    setTags(e.target.value);
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleClick = () => {
    if (!file) {
      alert('Please choose a file before uploading.');
      return;
    }

    let folderPath = '';
    if (location === 'alphabets') {
      folderPath = 'courses/alphabets';
    } else if (location === 'commonPhrases') {
      folderPath = 'courses/commonPhrases';
    } else {
      folderPath = 'courses/easy'; // Default location for other cases
    }

    const fileRef = ref(imageDb, `${folderPath}/${uuidv4()}`);
    const metadata = {
      customMetadata: {
        title,
        tags,
        category,
      },
    };

    const uploadTask = uploadBytesResumable(fileRef, file, metadata);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error('Error uploading file:', error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          console.log('File URL:', url);
          setFile(null);
          setTitle('');
          setTags('');
          setLocation('');
          setCategory('');
          setProgress(0);

          // After uploading, fetch the updated file list
          fetchFiles(); // Refresh the list of files
        });
      }
    );
  };

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
        <CategorySelect onChange={handleCategoryChange} value={category}>
          <option value="">All Categories</option>
          <option value="alphabets">Alphabets</option>
          <option value="commonPhrases">Common Phrases</option>
          {/* Add more categories as needed */}
        </CategorySelect>

        {/* File Upload Section */}
        <FileUploadSection>
          <input type="file" onChange={handleFileChange} />
          <input 
            type="text" 
            placeholder="Enter Title" 
            value={title} 
            onChange={handleTitleChange} 
          />
          <input 
            type="text" 
            placeholder="Enter Tags" 
            value={tags} 
            onChange={handleTagsChange} 
          />
          <select value={location} onChange={handleLocationChange}>
            <option value="">Select Location</option>
            <option value="alphabets">Alphabets</option>
            <option value="commonPhrases">Common Phrases</option>
          </select>
          <button onClick={handleClick}>Upload</button>
          <progress value={progress} max="100" />
        </FileUploadSection>

        {/* File Grid */}
        <ResultGrid results={filteredFiles} onCardClick={handleCardClick} />

        {/* Selected File Popup */}
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

        {/* Quiz Button */}
        <QuizButton onClick={goToQuiz}>
          Go to Quiz
        </QuizButton>
      </PageContainer>
    </>
  );
};

const CardContainer = styled.div`
  flex: 1 1 calc(25% - 20px); 
  max-width: 300px;           
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

const FileUploadSection = styled.div`
  margin-bottom: 20px;
  input, select {
    margin: 5px 0;
    padding: 10px;
    font-size: 16px;
  }
  button {
    padding: 10px;
    background-color: #41bfde;
    border: none;
    color: white;
    cursor: pointer;
  }
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
