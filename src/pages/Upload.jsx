import React, { useState } from 'react';
import { imageDb } from '../utils/firebase-config';
import { getDownloadURL, uploadBytes, ref } from 'firebase/storage';
import { v4 } from 'uuid';
import styled from 'styled-components';
import Navbar from '../components/AdminNavbar';

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const UploadContainer = styled.div`
  width: 60%;
  height: 400px;
  margin-top: 9%;
  padding: 20px;
  border: 1px solid white;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center; /* Center horizontally */
  justify-content: center; /* Center vertically */
`;

const InputFile = styled.input`
  display: none;
`;

const UploadButton = styled.label`
  padding: 10px 20px;
  font-size: 18px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

const FileName = styled.span`
  color: black;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: auto;
`;

const InputField = styled.input`
  width: 100%;
  height: 60px;
  padding: 12px;
  margin-bottom: 20px;
  box-sizing: border-box;
`;

export default function Upload() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');

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
          tags
        }
      };
      uploadBytes(fileRef, file, metadata)
        .then((snapshot) => {
          console.log(snapshot);
          getDownloadURL(snapshot.ref).then((url) => {
            // Handle uploaded file URL
            console.log('File URL:', url);
            setFileName('');
            setTitle('');
            setTags('');
          });
        })
        .catch((error) => {
          console.error('Error uploading file:', error);
        });
    }
  };

  return (
    <PageContainer>
      <Navbar />
      <UploadContainer>
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
        <InputFile
          type='file'
          onChange={handleFileChange}
          accept='image/*,video/*' // Accept both image and video files
          id='file-upload'
        />
        <ButtonContainer>
          <UploadButton htmlFor='file-upload'>Choose File</UploadButton>
          <button onClick={handleClick}>Upload</button>
        </ButtonContainer>
        {fileName && <FileName>{fileName}</FileName>}
      </UploadContainer>
    </PageContainer>
  );
}
