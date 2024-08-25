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
  height: 100vh;
  background: #141413;
  font-family: 'Arial', sans-serif;
`;

const UploadContainer = styled.div`
  display: flex;
  width: 80%;
  height:50%;
  max-width: 1200px;
  padding: 20px;
  border-radius: 12px;
  background: #FAF9F6;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
`;

const LeftPanel = styled.div`
  width: 50%;
  padding: 20px;
  border-right: 2px solid #eee;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const RightPanel = styled.div`
  width: 50%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const InputField = styled.input`
  width: calc(100% - 24px);
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
  padding: 14px 28px;
  font-size: 18px;
  background: #ff6f61;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s, transform 0.3s, box-shadow 0.3s;
  text-align: center;

  &:hover {
    background: #e65c50;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ButtonWrapper = styled.div`
  position: absolute;
  bottom: 20px; 
  left: 50%; 
  transform: translateX(-50%); 
  width: 100%;
  display: flex;
  justify-content: center;
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
    background:#FAF9F6;
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
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
  };

  const handleClick = () => {
    if (file) {
      const fileRef = ref(imageDb, `easy/${v4()}`);
      const metadata = {
        customMetadata: {
          title,
          tags,
          location
        }
      };

      const uploadTask = uploadBytesResumable(fileRef, file, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress function
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error('Error uploading file:', error);
        },
        () => {
          // Complete function
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            console.log('File URL:', url);
            setFileName('');
            setTitle('');
            setTags('');
            setLocation('');
            setProgress(0);
          });
        }
      );
    }
  };

  return (
    <PageContainer>
      <Navbar />
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
            type='text'
            placeholder='Location'
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <InputFile
            type='file'
            onChange={handleFileChange}
            accept='image/*,video/*' // Accept both image and video files
            id='file-upload'
          />
          <ButtonWrapper>
            <UploadButton htmlFor='file-upload'>Choose File</UploadButton>
          </ButtonWrapper>
        </LeftPanel>
        <RightPanel>
          {fileName && <FileName>File: {fileName}</FileName>}
          <ProgressContainer>
            <ProgressBar value={progress} max="100" />
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
