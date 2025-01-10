import React, { useState } from 'react';
import { imageDb } from '../utils/firebase-config';
import { getDownloadURL, uploadBytesResumable, ref } from 'firebase/storage';
import { v4 } from 'uuid';
import styled from 'styled-components';
import Navbar from '../components/AdminNavbar';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #141413;
  font-family: 'Arial', sans-serif;
  padding: 20px;
`;

const NavbarWrapper = styled.div`
  width: 100%;
  margin-bottom: 20px; /* Add space below navbar on small screens */
`;

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  padding: 20px;
  border-radius: 12px;
  background: #FAF9F6;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  
  @media (min-width: 768px) {
    flex-direction: row;
  }

  @media (max-width: 768px) {
    margin-top: 20px; /* Ensure there's space between the navbar and upload container on mobile */
  }
`;

const LeftPanel = styled.div`
  width: 100%;
  padding: 20px;
  border-bottom: 2px solid #eee;

  @media (min-width: 768px) {
    width: 50%;
    border-right: 2px solid #eee;
    border-bottom: none;
  }
`;

const RightPanel = styled.div`
  width: 100%;
  padding: 20px;

  @media (min-width: 768px) {
    width: 50%;
  }
`;

const InputField = styled.input`
  width: 100%;
  height: 50px;
  padding: 12px;
  margin-bottom: 20px;
  border: 2px solid #007bff;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;
  transition: border-color 0.3s;

  &:focus {
    border-color: #0056b3;
    outline: none;
  }
`;

const InputFile = styled.input`
  display: none;
`;

const UploadButton = styled.label`
  display: inline-block;
  padding: 14px 28px;
  font-size: 18px;
  background: #ff6f61;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s, transform 0.3s, box-shadow 0.3s;
  text-align: center;
  margin-top: 10px;

  &:hover {
    background: #e65c50;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const ProgressContainer = styled.div`
  margin-top: 20px;
`;

const ProgressBar = styled.progress`
  width: 100%;
  height: 20px;
  border-radius: 10px;
  appearance: none;
  background: #FAF9F6;

  ::-webkit-progress-bar {
    background: #FAF9F6;
  }
  ::-webkit-progress-value {
    background: #007bff;
  }
`;

const FileName = styled.div`
  color: #333;
  font-size: 16px;
  margin-top: 10px;
`;

export default function Upload() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [location, setLocation] = useState('');
  const [subCategory, setSubCategory] = useState('');  // New state for the second dropdown
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : '');
  };

  const handleClick = () => {
    if (!file) {
      alert('Please choose a file before uploading.');
      return;
    }

    const folderPath = location === 'courses' ? `${location}/${subCategory}` : location;
    const fileRef = ref(imageDb, `${folderPath}/${v4()}`);
    const metadata = {
      customMetadata: {
        title,
        tags,
        location,
        subCategory,
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
          setFileName('');
          setTitle('');
          setTags('');
          setLocation('');
          setSubCategory('');
          setProgress(0);
        });
      }
    );
  };

  return (
    <PageContainer>
      <NavbarWrapper>
        <Navbar />
      </NavbarWrapper>
      <UploadContainer>
        <LeftPanel>
          <InputField
            type='text'
            placeholder='Title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <InputField
            type='text'
            placeholder='Tags (comma separated)'
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <InputField
            as='select'
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setSubCategory(''); // Reset subcategory when location changes
            }}
          >
            <option value=''>Select Location</option>
            <option value='courses'>Courses</option>
            <option value='main'>Main</option>
          </InputField>

          {location === 'courses' && (
            <InputField
              as='select'
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
            >
              <option value=''>Select Category</option>
              <option value='Common Phrases'>Common Phrases</option>
              <option value='Alphabets'>Alphabets</option>
            </InputField>
          )}

          <InputFile
            type='file'
            onChange={handleFileChange}
            accept='image/*,video/*'
            id='file-upload'
          />
          <ButtonWrapper>
            <UploadButton htmlFor='file-upload'>Choose File</UploadButton>
          </ButtonWrapper>
        </LeftPanel>
        <RightPanel>
          {fileName && <FileName>File: {fileName}</FileName>}
          <ProgressContainer>
            <ProgressBar value={progress} max='100' />
            {progress > 0 && <div>{Math.round(progress)}%</div>}
          </ProgressContainer>
          <ButtonWrapper>
            <UploadButton onClick={handleClick}>Upload</UploadButton>
          </ButtonWrapper>
        </RightPanel>
      </UploadContainer>
    </PageContainer>
  );
}
