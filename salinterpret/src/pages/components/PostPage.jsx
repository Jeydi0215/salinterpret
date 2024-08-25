import React, { useState } from 'react';
import styled from 'styled-components';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // Import Firebase Storage methods
import Navbar from '../components/Navbar';
import { firebaseStorage } from '../utils/firebase-config'; // Import firebaseStorage from firebaseConfig

const Upload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [level, setLevel] = useState('easy'); // Default to 'Easy'
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value); 
  };

  const handleTagsChange = (event) => {
    setTags(event.target.value);
  };

  const handleLevelChange = (event) => {
    setLevel(event.target.value);
  };

  const handleFileChange = (event) => {
    setVideoFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      if (!videoFile) {
        console.error('Please select a file to upload.');
        return;
      }

      const storageRef = ref(firebaseStorage, videoFile.name); // Create a reference to the file in Firebase Storage
      const uploadTask = uploadBytesResumable(storageRef, videoFile); // Upload the file

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress monitoring
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          // Handle unsuccessful uploads
          console.error('Error uploading file:', error);
        },
        () => {
          // Handle successful uploads on complete
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log('File available at', downloadURL);
            // Here you can save the downloadURL to your database or do any other necessary actions
          });
        }
      );
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  return (
    <Container>
    <NavbarContainer>
      <Navbar />
    </NavbarContainer>
    <Content>
      <Title>Upload Video</Title>
      <Form>
        <FormGroup>
          <Label>Title</Label>
          <Input type="text" value={title} onChange={handleTitleChange} />
        </FormGroup>
        <FormGroup>
          <Label>Description</Label>
          <TextArea value={description} onChange={handleDescriptionChange} />
        </FormGroup>
        <FormGroup>
          <Label>Tags</Label>
          <Input type="text" value={tags} onChange={handleTagsChange} />
        </FormGroup>
        <FormGroup>
          <Label>Level</Label>
          <Select value={level} onChange={handleLevelChange}>
            <option value="easy">Easy</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </Select>
        </FormGroup>
        <FormGroup>
          <Label>Video File</Label>
          <FileInput type="file" onChange={handleFileChange} />
        </FormGroup>
        <UploadButton onClick={handleUpload}>Upload</UploadButton>
        {uploadProgress > 0 && <ProgressBar value={uploadProgress} max="100" />}
      </Form>
    </Content>
  </Container>
);
};


const Container = styled.div`
  display: flex;
  justify-content: center;
`;

const NavbarContainer = styled.div`
  position: fixed;
  left: 0;
`;

const Content = styled.div`
  width: 60%;
  padding: 20px;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-size: 18px;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  height: 100px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const FileInput = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const UploadButton = styled.button`
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

const ProgressBar = styled.progress`
  width: 100%;
  margin-top: 10px;
`;

export default Upload;
